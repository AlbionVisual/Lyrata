from .rubert_classificator import classify_text
from .spacy_division import divide_text
import numpy as np
import re

def max_result(d):
    """
    Позволяет узнать лучший результат. Т. е. эта функция делает конечный вывод: какая эмоция была оченена больше всего

    `d` - словарь или массив из 5-ти элементов

    Returns:
            `ans` - ответ, слово-эмоция
            `m` - её вес, т.е. максимальный вес в списке
    """
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
    
def sentence_divider(text):
    """
    Разбивает текст сначала на абзацы, а затем, при помощи нейронной сети от spacy, делит каждый на предложения.

    `text` - строка, входной текст

    Returns:
            `text_list` - список строк, содержащий все предложения.\n
            `spans` - список числовых промежутков, содержащих соответствующие по индексу предложения.
    """
    paragraphs = paragraph_divider(text)
    text_list = []
    spans = []
    for i, p in enumerate(paragraphs[0]):
        divided_text = divide_text(p)
        for sent in divided_text:
            text_list += [sent['text']]
            spans += [(sent['start'] + paragraphs[1][i][0], sent['end'] + paragraphs[1][i][0])]
    return text_list, spans

def paragraph_divider(text):
    """
    Разбивает текст на абзацы путём поиска элементов текста вида: `[^\\n]+` - текст не содержащий переносов строк. Полученные строки фильтруются на пустоту.

    `text` - строка, входной текст

    Returns:
            `paragraphs` - список строк, содержащий все абзацы.\n
            `spans` - список числовых промежутков, содержащих соответствующие по индексу предложения.
    """

    if not text.strip():
        return []

    paragraph_pattern = re.compile('([^\n]+)')

    spans = []
    paragraphs = []
    for match in paragraph_pattern.finditer(text):
        
        paragraph_text = match.group()

        if paragraph_text.strip():
            spans.append(match.span())
            paragraphs.append(paragraph_text)

    return paragraphs, spans

def text_list_check(text_list, batch = 0):

    """
    Разбитый текст классифицирует при помощи нейронной сети разными способами. Если `batch` отсутствует или 0, то текст анализируется по элементно, как это было бы и без обработки. Если `batch` не ноль, то нейронная сеть будет получать тексты с наложением, а результатом будет усреднённое значение всех перекрываний данного элемента.

    `text_list` - массив строк для классификации
    `batch` - сколько элементов входного массива дополнительно нужно брать сверху и снизу для составления текста для запроса

    Returns:
            `results` - массив элементов вида [float,float,float,float,float], соответсвующие вероятности для 'aggression', 'anxiety', 'sarcasm', 'positive', 'normal'
    """

    error_amount = 0
    results = []

    if len(text_list) <= 2*batch: batch = int((len(text_list)-1) / 2)
    if batch == 0:
        answers = classify_text(text_list)
        results = np.array([list(answer.values()) for answer in answers])
    else:
        results = np.zeros((len(text_list), 5)) # Структура для подсчёта средних значений
        for i in range(-batch + 1, len(results)):

            start = i-batch if i-batch >= 0 else 0 # Сохраняем индексы диапазона
            end = i+batch if i+batch < len(text_list) else len(text_list)

            text = ' '.join(text_list[start : end]) # Считаем текст группы
            try: # Пробуем закинуть в нейронку
                answer = classify_text(text)
            except RuntimeError: # Если текст слишком большой мы вставляем буферное значение по умолчанию, чтобы не пропускать итерации для подсчёта среднего
                error_amount += 1
                answer = [{'aggression': 0.2, 'anxiety': 0.2, 'sarcasm': 0.2, 'positive': 0.2, 'neutral': 0.2}]
            
            if answer and len(answer): # Если ответ есть
                answer = np.array(list(answer[0].values()))
                for j in range(start, end): # Коробки перекрываются, поэтому мы считаем среднюю, для каждого абзаца из всех коробок
                    results[j] += answer / (2 * batch)

    return results

def mix_batches(text_list:list[str], batches:dict)->list[(str, dict)]:
    """
    Запускает обработку с разным количеством batch, комбинируя результат также по переданным данным

    `text_list` - разбитый текст для тестирования\n
    `batches` - словарь вида: `{кол-во bathes (int): вес параметра (float), ...}`

    Returns:
            `results` - массив оценок вида [float,float,float,float,float], соответсвующие вероятности для 'aggression', 'anxiety', 'sarcasm', 'positive', 'normal'
    """
    weight_sum = sum(batches.values())
    for key, value in batches.items():
        batches[key] = value / weight_sum

    results = np.zeros((len(text_list), 5))
    for key in batches:
        ans = text_list_check(text_list, key)
        divided = ans * batches[key]
        results += divided
        
    return results


def print_results(text_list, results):
    """
    Выводит результат работы `text_list_check` или `mix_batched` с раскрашенным текстом

    `text_list` - список строк\n
    `results` - результат работы одной из функций - список ответов нейронной сети - массив пяти-элементных массивов
    """
    
    from colorama import Fore, Style, init
    init()  # Инициализация colorama

    # Напоминалка:
    print(Fore.RED + "Aggression, " + Fore.LIGHTBLUE_EX + "anxiety, " + Fore.YELLOW + "sarcasm, " + Fore.GREEN + "positive, " + Fore.LIGHTWHITE_EX + "neutral" + Style.RESET_ALL)
    
    # Вывод:

    for i, val in enumerate(results):
        ans, _ = max_result(val) # Извлекаем одно слово - наиболее вероятный ответ
        
        # И выбираем соответствующий цвет:
        color = None
        if ans == 'aggression': color = Fore.RED
        elif ans == 'anxiety': color = Fore.LIGHTBLUE_EX
        elif ans == 'positive': color = Fore.GREEN
        elif ans == 'sarcasm': color = Fore.YELLOW

        print((color if color else '') + text_list[i] + Style.RESET_ALL + str(val))
