from .TextDivider import TextDivider
import torch
from math import sqrt

class TextClassifier(TextDivider):

    def __init__(self, text = None, model_name: int | str = 0, *, tokens_amount = None, intersection_amount = None, division_type: str= "sentence"):
        super().__init__(text=text, tokens_amount=tokens_amount, intersection_amount=intersection_amount,model_name=model_name, division_type=division_type)
        self._batched_results = []
        self._results = {}
        self._avg_results = {}
        self._weighted_results = {}

    def classify_text(self):
        if self._text is None or self._text.strip() == '': return
        self._results = {}
        self._batched_results = []
        self.load()
        self.divide_text()
        with torch.no_grad():
            for batch in self._batches:
                inputs = {k: v.to(self._device) for k, v in batch.items()}
                outputs = self._model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1).squeeze(0) # Убираем размерность батча
                self._batched_results.append(probabilities.cpu()) # Переносим на CPU для удобства
        
    def get_results(self):
        self._results = {}
        if len(self._batched_results) == 0: self.classify_text()
        for span in self.text_offsets: self._results[span] = []
        for i, res in enumerate(self._batched_results):
            b1, b2 = self._batch_offsets[i]
            for r1, r2 in self._results:
                if max(b1, r1) < min(r2, b2):
                    self._results[(r1, r2)] += [res]
        return self._results
        

    def get_average_results(self):
        self.get_results()
        for span, res in self._results.items():
            self._avg_results[span] = sum(res) / len(self._results[span])
        return self._avg_results
  
    def get_weighted_results(self):
        self.get_results()
        self._weighted_results = {}

        def get_weights(size):
            a = -1 + sqrt(5)
            a/=2
            b = 1 - 1 / a
            ans = 1 / (torch.linspace(0, 1, size // 2 + 1) + a) + b
            weights = torch.cat((ans.flip(0)[:-1], ans))
            weights = weights / sum(weights)
            return weights

        for span, reses in self._results.items():
            ans = torch.zeros(len(reses[0]))
            weights = get_weights(len(reses))
            for i, res in enumerate(reses):
                ans += res * float(weights[i])
            self._weighted_results[span] = ans
        
        return self._weighted_results

    @property
    def batched_results(self):
        return self._batched_results

    @property
    def results(self):
        if len(self._results.keys()) == 0: self.get_results()
        return self._results
    
    @property
    def avg_results(self):
        if len(self._avg_results.keys()) == 0: self.get_average_results()
        return self._avg_results
    
    @property
    def weighted_results(self):
        if len(self._weighted_results.keys()) == 0: self.get_weighted_results()
        return self._weighted_results

    @TextDivider.text.setter
    def text(self, new_text):
        self._batches = []
        self._batch_offsets = []
        self._text = new_text
        self._batched_results = []
        self._results = {}
        self._avg_results = {}
        self._weighted_results = {}