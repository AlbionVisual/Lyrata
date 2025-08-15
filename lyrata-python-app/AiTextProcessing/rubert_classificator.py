import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

try:
    tokenizer = AutoTokenizer.from_pretrained("Kostya165/rubert_emotion_slicer")
    model = AutoModelForSequenceClassification.from_pretrained("Kostya165/rubert_emotion_slicer")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
except Exception as e:
    print(f"Ошибка при загрузке RuBert модели: {e}")

def classify_text(texts: list[str]) -> list[dict]:
    """
    Классифицирует список текстовых строк с использованием загруженной модели.

    `texts` - список строк для классификации.

    Returns:
            `predictions` - список числовых результатов последнего слоя округлённых до 1e-4
    """
    if not texts:
        return []

    # `padding=True` добавляет паддинг до максимальной длины в батче
    # `truncation=True` обрезает тексты, если они слишком длинные для модели
    # `return_tensors="pt"` возвращает PyTorch тензоры
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    
    # Опционально: переместить входные данные на то же устройство, что и модель
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.softmax(outputs.logits, dim=1)

    # 5. Определение предсказанных классов и их вероятностей
    # `torch.argmax(dim=1)` находит индекс класса с максимальной вероятностью
    # `model.config.id2label` сопоставляет индекс с именем метки
    # predictions = []
    # rounded = torch.round(probabilities, decimals=4)
    # for probs in probabilities:
        # score, predicted_id = torch.max(probs, dim=0)
        # label = model.config.id2label[predicted_id.item()]
        # predictions.append({"label": label, "score": score.item()})
    
    predictions = []
    for prob in probabilities:
        temp = {}
        for key, label in model.config.id2label.items():
            temp[label] = int(prob[key].item() * 1e4) /10000
        predictions.append(temp)
    
    return predictions


if __name__ == "__main__":
    test_strings = [
        'Это просто прекрасно!',
        'Я считаю, что мне нужно немного выспаться, а потом пойти покушать, а сейчас мне хочется поесть мороженого и пойти спать',
        'Мне абсолютно все равно, что происходит',
        'Какой ужасный день, все идет не так'
    ]
    results = classify_text(test_strings)
    for text, result in zip(test_strings, results):
        print(f"Текст: '{text}' -> Предсказание: {result}")