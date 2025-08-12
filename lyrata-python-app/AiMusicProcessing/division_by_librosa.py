# import librosa
# import librosa.display
# import numpy as np
# import matplotlib.pyplot as plt

# # Загрузка аудиофайла
# y, sr = librosa.load('.\music\Don_t Let Me Down (Illenium Remix).mp3')

# # Вычисление RMSE
# rms = librosa.feature.rms(y=y)[0]

# # Визуализация (опционально)
# times = librosa.times_like(rms, sr=sr)
# plt.figure(figsize=(14, 5))
# librosa.display.waveshow(y, sr=sr, alpha=0.4)
# plt.plot(times, rms, color='r', label='RMS Energy')
# plt.title('Аудиосигнал и RMSE')
# plt.xlabel('Время (с)')
# plt.ylabel('Амплитуда / RMSE')
# plt.legend()
# plt.show()

# # Обнаружение онсетов
# onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
# onset_times = librosa.frames_to_time(onset_frames, sr=sr)

# # Визуализация (опционально)
# plt.figure(figsize=(14, 5))
# librosa.display.waveshow(y, sr=sr, alpha=0.4)
# plt.vlines(onset_times, -1, 1, color='r', linestyle='--', label='Onsets')
# plt.title('Обнаружение начала событий')
# plt.xlabel('Время (с)')
# plt.ylabel('Амплитуда')
# plt.legend()
# plt.show()

import librosa
import numpy as np
import pandas as pd
from scipy.signal import find_peaks
import matplotlib.pyplot as plt

def analyze_song_dynamism(audio_path, sr=22050, frame_length=2048, hop_length=512):
    y, sr = librosa.load(audio_path, sr=sr)
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    # Сглаживание RMSE для выделения общих тенденций
    # Размер окна для сглаживания можно подобрать экспериментально
    # Например, 1 секунда = sr / hop_length кадров
    smoothing_window = int(sr / hop_length * 1) # Окно сглаживания 1 секунда
    if smoothing_window % 2 == 0:
        smoothing_window += 1 # Окно должно быть нечетным для симметричного сглаживания
    
    smoothed_rms = pd.Series(rms).rolling(window=smoothing_window, center=True, min_periods=1).mean().values

    # Вычисление стандартного отклонения сглаженной RMSE
    # Высокое std_rms указывает на большую динамичность
    std_rms = np.std(smoothed_rms)
    
    return smoothed_rms, std_rms, y, sr, hop_length

def segment_dynamic_song(smoothed_rms, y, sr, hop_length):
    times = librosa.frames_to_time(np.arange(len(smoothed_rms)), sr=sr, hop_length=hop_length)

    # Вычисляем среднее и стандартное отклонение RMSE для данной песни
    mean_rms = np.mean(smoothed_rms)
    std_dev_rms = np.std(smoothed_rms)

    # Пороги для определения "громких" и "тихих" участков
    # Эти коэффициенты (например, 0.5, 0.5) можно настроить
    loud_threshold = mean_rms + 0.5 * std_dev_rms
    quiet_threshold = mean_rms - 0.5 * std_dev_rms

    segments = []
    current_segment_type = None
    current_segment_start_frame = 0

    for i, rms_val in enumerate(smoothed_rms):
        if rms_val > loud_threshold:
            new_segment_type = "loud"
        elif rms_val < quiet_threshold:
            new_segment_type = "quiet"
        else:
            new_segment_type = "neutral" # Или можно отнести к предыдущему типу, если он есть

        if new_segment_type != current_segment_type:
            if current_segment_type is not None:
                # Завершаем предыдущий сегмент
                segments.append({
                    "type": current_segment_type,
                    "start_frame": current_segment_start_frame,
                    "end_frame": i - 1,
                    "start_time": times[current_segment_start_frame],
                    "end_time": times[i - 1] if i > 0 else times[0]
                })
            current_segment_type = new_segment_type
            current_segment_start_frame = i
    
    # Добавляем последний сегмент
    if current_segment_type is not None:
        segments.append({
            "type": current_segment_type,
            "start_frame": current_segment_start_frame,
            "end_frame": len(smoothed_rms) - 1,
            "start_time": times[current_segment_start_frame],
            "end_time": times[-1]
        })

    # Фильтрация коротких сегментов и объединение
    min_segment_duration_frames = int(sr / hop_length * 2) # Например, 2 секунды

    filtered_segments = []
    if segments:
        current_filtered_segment = segments[0]
        for i in range(1, len(segments)):
            segment = segments[i]
            if segment["type"] == current_filtered_segment["type"]:
                # Объединяем сегменты одного типа
                current_filtered_segment["end_frame"] = segment["end_frame"]
                current_filtered_segment["end_time"] = segment["end_time"]
            else:
                # Если текущий сегмент слишком короткий, присоединяем его к предыдущему или следующему
                if (current_filtered_segment["end_frame"] - current_filtered_segment["start_frame"] + 1) < min_segment_duration_frames:
                    if filtered_segments: # Если есть предыдущий сегмент, присоединяем к нему
                        filtered_segments[-1]["end_frame"] = current_filtered_segment["end_frame"]
                        filtered_segments[-1]["end_time"] = current_filtered_segment["end_time"]
                        # Обновляем тип, если новый сегмент был доминирующим
                        # (более сложная логика, пока просто присоединяем)
                    # Иначе (если это первый короткий сегмент), просто отбрасываем или оставляем как есть
                    # Для простоты пока просто отбрасываем, если нет предыдущего
                else:
                    filtered_segments.append(current_filtered_segment)
                current_filtered_segment = segment
        
        # Добавляем последний обработанный сегмент
        if (current_filtered_segment["end_frame"] - current_filtered_segment["start_frame"] + 1) >= min_segment_duration_frames or not filtered_segments:
             filtered_segments.append(current_filtered_segment)
        elif filtered_segments: # Если последний сегмент короткий, присоединяем к предыдущему
             filtered_segments[-1]["end_frame"] = current_filtered_segment["end_frame"]
             filtered_segments[-1]["end_time"] = current_filtered_segment["end_time"]

    # Очистка итоговых сегментов: объединение смежных одинаковых типов после фильтрации
    final_segments = []
    if filtered_segments:
        final_segments.append(filtered_segments[0])
        for i in range(1, len(filtered_segments)):
            if filtered_segments[i]["type"] == final_segments[-1]["type"]:
                final_segments[-1]["end_frame"] = filtered_segments[i]["end_frame"]
                final_segments[-1]["end_time"] = filtered_segments[i]["end_time"]
            else:
                final_segments.append(filtered_segments[i])

    return final_segments, times, smoothed_rms

def refine_segment_boundaries_with_onsets(segments, y, sr, hop_length, max_onset_snap_time=0.5):
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, hop_length=hop_length)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr, hop_length=hop_length)

    refined_segments = []
    for segment in segments:
        # Уточняем начало сегмента
        start_time = segment["start_time"]
        closest_onset_start = None
        min_diff_start = float('inf')
        for ot in onset_times:
            diff = abs(ot - start_time)
            if diff <= max_onset_snap_time and diff < min_diff_start:
                closest_onset_start = ot
                min_diff_start = diff
        if closest_onset_start is not None:
            segment["start_time"] = closest_onset_start
            buff = librosa.time_to_frames(closest_onset_start, sr=sr, hop_length=hop_length)
            segment["start_frame"] = int(buff)

        # Уточняем конец сегмента (опционально, часто достаточно начала следующего)
        # Для конца можно искать ближайший онсет или просто использовать начало следующего сегмента
        # В данном случае, конец сегмента - это просто начало следующего, если сегменты смежные.
        # Поэтому явное уточнение конца каждого сегмента может быть излишним,
        # если мы просто хотим получить точки разделения.

        refined_segments.append(segment)
    return refined_segments


audio_file = '.\music\Centuries - Fall Out Boy (Lyrics).mp3'

# Шаг 1: Анализ динамичности
smoothed_rms, std_rms, y, sr, hop_length = analyze_song_dynamism(audio_file)
print(f"Стандартное отклонение RMSE для песни: {std_rms:.4f}")

# Определяем, является ли песня "динамичной" (пока фиксированный порог для примера)
# В реальном приложении: сравнить std_rms с распределением по плейлисту
is_dynamic = std_rms > 0.05 # Примерный порог, требует настройки

if is_dynamic:
    print("Песня классифицирована как динамичная, приступаем к сегментации.")
    segments, times, smoothed_rms_for_plot = segment_dynamic_song(smoothed_rms, y, sr, hop_length)
    refined_segments = refine_segment_boundaries_with_onsets(segments, y, sr, hop_length)

    print("\nОбнаруженные сегменты:")
    for i, seg in enumerate(refined_segments):
        print(f"Сегмент {i+1}: Тип='{seg['type']}', Начало={seg['start_time']:.2f}с, Конец={seg['end_time']:.2f}с")

    # Визуализация
    plt.figure(figsize=(15, 7))

    # Отображение аудиоволны
    plt.subplot(2, 1, 1)
    librosa.display.waveshow(y, sr=sr, alpha=0.6)
    plt.title('Аудиосигнал и сегменты')
    plt.xlabel('Время (с)')
    plt.ylabel('Амплитуда')

    # Наложение RMSE и сегментов
    for seg in refined_segments:
        color = 'red' if seg['type'] == 'loud' else ('blue' if seg['type'] == 'quiet' else 'green')
        plt.axvspan(seg['start_time'], seg['end_time'], color=color, alpha=0.2, label=f'{seg["type"]} (начало: {seg["start_time"]:.2f}с)')
        plt.axvline(seg['start_time'], color=color, linestyle='--', linewidth=1) # Вертикальные линии для границ

    # Отображение сглаженной RMSE
    plt.subplot(2, 1, 2)
    plt.plot(times, smoothed_rms_for_plot, color='black', label='Сглаженная RMSE')
    plt.axhline(np.mean(smoothed_rms_for_plot), color='gray', linestyle=':', label='Средняя RMSE')
    plt.axhline(np.mean(smoothed_rms_for_plot) + 0.5 * np.std(smoothed_rms_for_plot), color='red', linestyle=':', label='Порог громких')
    plt.axhline(np.mean(smoothed_rms_for_plot) - 0.5 * np.std(smoothed_rms_for_plot), color='blue', linestyle=':', label='Порог тихих')

    # Наложение границ сегментов
    for seg in refined_segments:
        color = 'red' if seg['type'] == 'loud' else ('blue' if seg['type'] == 'quiet' else 'green')
        plt.axvspan(seg['start_time'], seg['end_time'], color=color, alpha=0.2)
        plt.axvline(seg['start_time'], color=color, linestyle='--', linewidth=1)

    plt.title('Сглаженная RMSE и сегментация')
    plt.xlabel('Время (с)')
    plt.ylabel('RMSE')
    plt.legend()
    plt.tight_layout()
    plt.show()

else:
    print("Песня классифицирована как спокойная/фоновая, сегментация не требуется.")