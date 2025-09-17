from .TextClassifier import TextClassifier
from math import sqrt
import torch

def get_max_emotion_ind(res):
    m, ind = res[0], 0
    for i, el in enumerate(res):
        if el > m: m, ind = el, i
    return ind

class TextAnaliser(TextClassifier):

    def __init__(self, text = None, model_name: int | str = 0, *, tokens_amount = None, intersection_amount = None, division_type: str= "sentence"):
        super().__init__(text=text, tokens_amount=tokens_amount, intersection_amount=intersection_amount,model_name=model_name, division_type=division_type)
        self._smoothed_results = {}

    def direct_smooth(self, results):
        if type(results) is dict and len(results.keys()) != 0:            
            self._smoothed_results = {}
            last_start = 0
            curr_emotion_ind = None
            last_end = 0
            for span, res in results.items():
                if curr_emotion_ind is None:
                    curr_emotion_ind = get_max_emotion_ind(res)
                else:
                    next_emotion_ind = get_max_emotion_ind(res)
                    last_end = span[1]
                    if next_emotion_ind == curr_emotion_ind:
                        continue
                    self._smoothed_results[(last_start, span[0])] = curr_emotion_ind
                    curr_emotion_ind = next_emotion_ind
                    last_start = span[0]
            self._smoothed_results[(last_start, last_end)] = curr_emotion_ind            
            return self._smoothed_results
    
    def distance_smooth(self, results, threshold = 0.3):
        potential_points = self.direct_smooth(results)
        if potential_points is None: return
        ans = {}

        def avg_vector(big_span):
            nonlocal results
            s = None
            amount = 0
            for span, val in results.items():
                if span[0] < big_span[0]: continue
                if span[1] > big_span[1]: break
                if s is None:
                    s = val.clone().detach()
                else:
                    s += val
                amount += 1
            return s / amount

        def cosine_distance(vec1, vec2):
            return 1 - float(sum(vec1*vec2) / sqrt(sum(vec1*vec1)*sum(vec2*vec2)))

        span_list = list(potential_points.keys())
        last_start = 0
        last_end = span_list[0][1]
        for i in range(len(span_list)-1):
            avg_before = avg_vector((last_start, last_end))
            avg_after = avg_vector(span_list[i+1])
            dist = cosine_distance(avg_before, avg_after)
            if dist < threshold:
                last_end = span_list[i+1][1]
            else:
                ans[(last_start, last_end)] = get_max_emotion_ind(avg_before)
                last_start, last_end = span_list[i+1]

        ans[(last_start, last_end)] = get_max_emotion_ind(avg_vector((last_start, last_end)))
        self._smoothed_results = ans
        return self._smoothed_results
    
    @property
    def smoothed_results(self):
        return self._smoothed_results