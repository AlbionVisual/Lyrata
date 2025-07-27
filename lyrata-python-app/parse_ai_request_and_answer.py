import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 1. Загрузка токенизатора и модели один раз при старте приложения
# Это важно, чтобы не загружать их при каждом запросе, что очень неэффективно.
try:
    tokenizer = AutoTokenizer.from_pretrained("Kostya165/rubert_emotion_slicer")
    model = AutoModelForSequenceClassification.from_pretrained("Kostya165/rubert_emotion_slicer")
    
    # Опционально: переместить модель на GPU, если доступно
    # Это значительно ускорит инференс, если у вас есть GPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval() # Перевести модель в режим оценки (отключает dropout и т.д.)
    print(f"Модель загружена на: {device}")
except Exception as e:
    print(f"Ошибка при загрузке модели: {e}")
    # Обработка ошибки, например, завершение работы приложения или переход в режим "недоступно"

def classify_text_backend(texts: list[str]) -> list[dict]:
    """
    Классифицирует список текстовых строк с использованием загруженной модели.

    Args:
        texts: Список строк для классификации.

    Returns:

    """
    if not texts:
        return []

    # 2. Токенизация входных текстов
    # `padding=True` добавляет паддинг до максимальной длины в батче
    # `truncation=True` обрезает тексты, если они слишком длинные для модели
    # `return_tensors="pt"` возвращает PyTorch тензоры
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    
    # Опционально: переместить входные данные на то же устройство, что и модель
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad(): # Отключить вычисление градиентов для ускорения инференса
        # 3. Проход через модель
        outputs = model(**inputs)


    # 4. Получение логитов и преобразование в вероятности
    # `outputs.logits` содержит логиты
    # `torch.softmax` преобразует их в вероятности
    probabilities = torch.softmax(outputs.logits, dim=1)

    # print("labels: ", model.config.id2label)
    # print("logits: ", outputs.logits)
    # print("probabilities: ", probabilities)

    # 5. Определение предсказанных классов и их вероятностей
    # `torch.argmax(dim=1)` находит индекс класса с максимальной вероятностью
    # `model.config.id2label` сопоставляет индекс с именем метки
    # predictions = []
    # for probs in probabilities:
        # score, predicted_id = torch.max(probs, dim=0)
        # label = model.config.id2label[predicted_id.item()]
        # predictions.append({"label": label, "score": score.item()})
    
    predictions = []
    # rounded = torch.round(probabilities, decimals=4)
    for prob in probabilities:
        temp = {}
        for key, label in model.config.id2label.items():
            temp[label] = int(prob[key].item() * 1e4) /10000
        predictions.append(temp)
    
    return predictions

# Пример использования на бэкенде:
if __name__ == "__main__":
    test_strings = [
        'Это просто прекрасно!',
        'Я считаю, что мне нужно немного выспаться, а потом пойти покушать, а сейчас мне хочется поесть мороженого и пойти спать',
        'Мне абсолютно все равно, что происходит',
        'Какой ужасный день, все идет не так'
    ]

    results = classify_text_backend(test_strings)
    for text, result in zip(test_strings, results):
        print(f"Текст: '{text}' -> Предсказание: {result}")