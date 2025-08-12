import spacy

try:
    nlp = spacy.load("ru_core_news_sm")

except Exception as e:
    print(f"Ошибка загрузки SpaCy модели: {e}")

def divide_text(text: str):
    """
    Делит текст на doc структуру, содержащую разделение на слова и предложения, а также учитывающую все пробельные символы.

    Args:
        text Входной текст для обработки

    Returns:
        doc-структура с разделённым и размеченным текстом
    """
    return nlp(text)
