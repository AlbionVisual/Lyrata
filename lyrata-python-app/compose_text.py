from parse_ai_request_and_answer import classify_text_backend
from parse_md_file_to_sentences import parse_markdown_to_sentences_simple
from colorama import Fore, Style, init
import numpy as np

init()  # Инициализация colorama


def max_result(d):
    if type(d) == dict:
        if not d: return
        m = list(d.values())[0]
        ans = list(d.keys())[0]
        for key, el in d.items():
            if el > m:
                m = el
                ans = key
        return ans, m
    else:
        if not len(d): return None, None
        words = ['aggression', 'anxiety', 'sarcasm', 'positive', 'neutral']
        ans = words[3]
        m = d[3]
        for i, el in enumerate(d):
            if el > m:
                m = el
                ans = words[i]
        return ans, m

def one_sentence_check(file_name, batch = 0):
    extracted_sentences, _ = parse_markdown_to_sentences_simple(file_name)

    print(Fore.RED + "Aggression, " + Fore.LIGHTBLUE_EX + "anxiety, " + Fore.YELLOW + "sarcasm, " + Fore.GREEN + "positive, " + Fore.LIGHTWHITE_EX + "neutral" + Style.RESET_ALL)
    results = []

    if batch == 0:
        answers = classify_text_backend(extracted_sentences)
        results = [(text, answers[i]) for i, text in enumerate(extracted_sentences)]
    else:
        for i in range(batch, len(extracted_sentences) - batch):
            text = ' '.join(extracted_sentences[i-batch:i+batch])
            results.append((text, classify_text_backend(text)[0]))

    for text, processed_text in results:
        ans, _ = max_result(processed_text)
        color = None
        if ans == 'aggression': color = Fore.RED
        elif ans == 'anxiety': color = Fore.LIGHTBLUE_EX
        elif ans == 'positive': color = Fore.GREEN
        elif ans == 'sarcasm': color = Fore.YELLOW

        print((color if color else '') + text + Style.RESET_ALL)

def per_paragpraph_check(file_name, batch = 0):
    _, paragraphs = parse_markdown_to_sentences_simple(file_name) # Извлекаем все абзацы из файла

    # Напоминалка:
    print(Fore.RED + "Aggression, " + Fore.LIGHTBLUE_EX + "anxiety, " + Fore.YELLOW + "sarcasm, " + Fore.GREEN + "positive, " + Fore.LIGHTWHITE_EX + "neutral" + Style.RESET_ALL)

    if batch == 0: # Если мы не делим текст на группы, просто закинуть всё в нейронку
        answers = classify_text_backend(paragraphs)
        results = [(text, answers[i]) for i, text in enumerate(paragraphs)]

        for text, processed_text in results:
            ans, _ = max_result(processed_text) # Извлекаем одно слово - наиболее вероятный ответ
            
            # И выбираем соответствующий цвет:
            color = None
            if ans == 'aggression': color = Fore.RED
            elif ans == 'anxiety': color = Fore.LIGHTBLUE_EX
            elif ans == 'positive': color = Fore.GREEN
            elif ans == 'sarcasm': color = Fore.YELLOW

            print((color if color else '') + text + Style.RESET_ALL)

    else: # Разделяем на группы и считаем средние значения
        results = [[el, np.array([0.0]*5)] for el in paragraphs] # Структура для подсчёта средних значений
        for i in range(-batch + 1, len(results)):

            start = i-batch if i-batch >= 0 else 0 # Сохраняем индексы диапазона
            end = i+batch if i+batch < len(paragraphs) else len(paragraphs)

            text = ' '.join(paragraphs[start : end]) # Считаем текст группы
            try: # Пробуем закинуть в нейронку
                answer = classify_text_backend(text)
            except RuntimeError: # Если текст слишком большой мы вставляем буферное значение по умолчанию, чтобы не пропускать итерации для подсчёта среднего
                answer = [{'aggression': 0.2, 'anxiety': 0.2, 'sarcasm': 0.2, 'positive': 0.2, 'neutral': 0.2}]
            
            if answer and len(answer): # Если ответ есть
                answer = np.array(list(answer[0].values()))
                for j in range(start, end): # Коробки перекрываются, поэтому мы считаем среднюю, для каждого абзаца из всех коробок
                    results[j][1] += answer / (2 * batch)
        
        for text, val in results:
            ans, _ = max_result(val) # Извлекаем одно слово - наиболее вероятный ответ
            
            # И выбираем соответствующий цвет:
            color = None
            if ans == 'aggression': color = Fore.RED
            elif ans == 'anxiety': color = Fore.LIGHTBLUE_EX
            elif ans == 'positive': color = Fore.GREEN
            elif ans == 'sarcasm': color = Fore.YELLOW

            print((color if color else '') + text + Style.RESET_ALL + str(val))


if __name__ == '__main__':
    per_paragpraph_check("big_text_2.md", 4)