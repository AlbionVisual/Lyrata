import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
from pprint import pprint

selected = [int(el) for el in input('Select showing (music length, frequency, raw music, rms energy, onset, beats / temp, mel-spectogram, mfccs, harmonic division): ').split()]
while len(selected) < 5: selected += [0]

# Загружаем аудиофайл
y, sr = librosa.load('.\music\Don_t Let Me Down (Illenium Remix).mp3', sr=22050)

if selected[0]: 
    print(f"Длительность аудио: {len(y)/sr:.2f} секунд")
if selected[1]:
    print(f"Частота дискретизации: {sr} Гц")

# Showing raw
if selected[2]:
    t = np.linspace(0,len(y)/sr, len(y))
    fig, ax = plt.subplots()
    ax.plot(t, y)
    plt.show()

# Вычисляем RMS энергию
if selected[3]:
    rmse = librosa.feature.rms(y=y)
    times = librosa.times_like(rmse, sr=sr)

    plt.figure(figsize=(10, 4))
    plt.plot(times, rmse[0])
    plt.title('RMS Energy over time')
    plt.xlabel('Time (s)')
    plt.ylabel('RMS')
    plt.show()

if selected[4]:
    onset_env = librosa.onset.onset_detect(y=y, sr=sr, units='frames')
    pprint(onset_env)

if selected[5]:
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    pprint(beats)
    print(f"Примерный темп: {tempo[0]:.2f} BPM")
    # Можно использовать beats для определения ритмических акцентов
    # beats - это индексы кадров, где был обнаружен удар (бит)

if selected[6]:
    # Вычисляем мел-спектрограмму (представляет распределение энергии по частотам)
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    S_dB = librosa.power_to_db(S, ref=np.max) # Переводим в децибелы для лучшей визуализации

    plt.figure(figsize=(10, 4))
    librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel')
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel-frequency spectrogram')
    plt.tight_layout()
    plt.show()

if selected[7]:
    # MFCCs - это сжатое представление мел-спектрограммы, очень популярны для задач классификации
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13) # n_mfcc - количество коэффициентов
    print("MFCCs shape:", mfccs.shape) # (n_mfcc, number_of_frames)

if selected[8]:
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    # Можно анализировать эти части отдельно для понимания структуры
    print("Harmomic: ")
    pprint(y_harmonic)
    print("Percussive: ")
    pprint(y_percussive)