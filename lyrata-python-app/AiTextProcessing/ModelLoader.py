import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import spacy

MODELS = [
    "Kostya165/rubert_emotion_slicer", # aggression, anxiety, sarcasm, positive, normal
    "cointegrated/rubert-tiny2-cedr-emotion-detection", # joy, sadness, surprise, fear, anger, no_emotion
    "blanchefort/rubert-base-cased-sentiment", # positive, neutral, negative
]

class ModelLoader:            

    

    def __init__(self, model_name: int | str = 0, division_type: str= "sentence"):
        self._tokenizer = None
        self._model = None
        self._device = None
        self._nlp = None
        self.labels = None
        if type(model_name) == str:
            self._model_name = model_name
        else:
            self._model_name = MODELS[model_name]
        if division_type[:2] not in ["se", "pa", "to", "s", "p", "t"]:
            print(f"You cannot provide \"{division_type}\" as division type! You can use only \"sentence\" | \"paragraph\" | \"tokens\". Using sentence")
            division_type = "sentence"
        self._division_type = division_type[0] # "sentence" | "paragraph" | "tokens" but only with one letter
    
    def load(self):
        if self._model is None:
            # Загрузка модели
            self._tokenizer = AutoTokenizer.from_pretrained(self._model_name)
            self._model = AutoModelForSequenceClassification.from_pretrained(self._model_name)

            # Извлекаем также значения нейронов последнего слоя
            d = self._model.config.id2label
            self.labels = [""] * len(d.keys())
            for ind, label in d.items():
                self.labels[ind] = label
            if self.labels[0] == "LABEL_0":
                d = self._model.config.label2id
                self.labels = [""] * len(d.keys())
                for label, ind in d.items():
                    self.labels[ind] = label

            # Перенос модели на видеокарту / старт необучаемости модели
            self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self._model.to(self._device)
            self._model.eval()

        if self._division_type == 's': # Если нужно, подключаем spacy
            self._nlp = spacy.load("ru_core_news_sm")
        else:
            del self.nlp
            self.npl = None

    def unload(self):
        del self._tokenizer
        del self.model
        self._tokenizer = None
        self._model = None
        self.labels = None
        del self.nlp
        self._nlp = None

    @property
    def loaded(self):
        return self.model != None

    @property
    def model_name(self):
        return self._model_name

    @model_name.setter
    def model_name(self, new_model_name):
        if new_model_name != self._model_name: self.unload()
        if type(new_model_name) == str:
            self._model_name = new_model_name
        else:
            self._model_name = MODELS[new_model_name]
    
    @property
    def division_type(self):
        return self._division_type
    
    @division_type.setter
    def division_type(self, new_type):
        if new_type[:2] not in ["se", "pa", "to", "s", "p", "t"]:
            print(f"You cannot provide \"{new_type}\" as division type! You can use only \"sentence\" | \"paragraph\" | \"tokens\". Not changing")
        elif new_type[0] == self._division_type:return
        else:
            self._division_type = new_type[0]
            if self._model is not None:
                if self._division_type == 's': # Если теперь нужно, подключаем spacy
                    self._nlp = spacy.load("ru_core_news_sm")
                else:
                    del self.nlp
                    self.npl = None