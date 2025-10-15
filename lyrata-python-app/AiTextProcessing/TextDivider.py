from .ModelLoader import ModelLoader
import re

DEFAULT_BATCH_SIZES = {
    "s": 10,    # sentences
    "p": 3,     # paragraphs
    "t": 200    # tokens
}
IGNORE_SIZE = 2

paragraph_pattern = re.compile('([^\n]+)')

class TextDivider(ModelLoader):

    def __init__(self, text = None, tokens_amount = None, intersection_amount = None, model_name: int | str = 0, division_type: str= "sentence"):
        super().__init__(model_name, division_type)
        self._batch_size = tokens_amount if tokens_amount is not None else DEFAULT_BATCH_SIZES[self._division_type]
        self._batch_intersection = intersection_amount if intersection_amount is not None else int(self._batch_size * 0.8)
        self._text = text
        self._batches = []
        self._batch_offsets = []

    def divide_text(self):
        if self._text is None or self._text.strip() == '': return
        if self._tokenizer is None:
            self.unload()
            self.load()

        self._batches = []
        self._batch_offsets = []
        if self._division_type == "t":
            self.tokeniser_divider()
            return
        elif self._division_type == "s":
            if self._nlp is None: self.load()
            doc = self._nlp(self._text)
            for sent in doc.sents:
                self._batches += [str(sent)]
                self._batch_offsets += [[sent.start_char,sent.end_char]]
        elif self._division_type == "p":
            for match in paragraph_pattern.finditer(self._text):
                paragraph_text = match.group()
                if paragraph_text.strip():
                    span = list(match.span())
                    span[1] += 1
                    self._batch_offsets.append(span)
                    self._batches.append(paragraph_text)

        self.prepare_raw_batches()
        self.parse_batch_offsets()
    
    def prepare_raw_batches(self):
        if type(self._batches[0]) != str: return
        
        new_batches = []
        new_offsets = []
        batch = int(self._batch_intersection / 2)
        text_length = len(self._batches)
        for i in range(-batch + 1, len(self._batches) + batch):

            start = i-batch if i-batch >= 0 else 0 # Сохраняем индексы диапазона
            end = i+batch if i+batch < text_length else text_length
            new_batches += [' '.join(self._batches[start : end])] # Считаем текст группы
            new_offsets += [[self._batch_offsets[start][0], self._batch_offsets[end - 1][1]]]

        self._batch_offsets = new_offsets
        self._batches = [
            self._tokenizer(
                batch,
                max_length=512,
                truncation=True,
                return_tensors="pt"
            )
            for batch in new_batches
        ]

    def tokeniser_divider(self):
        self._batches = self._tokenizer(
                self._text,
                max_length=self._batch_size,     # Максимальная длина каждого сегмента
                truncation=True,                # Обрезать, если текст длиннее max_length
                return_overflowing_tokens=True, # Вернуть все сегменты
                stride=self._batch_intersection, # Размер перекрытия между сегментами
                return_tensors="pt",            # Вернуть тензоры PyTorch
                padding=True,                   # Довести размер до максимума при помощи пустых токенов
                return_offsets_mapping=True     # Вернуть индексы с изначального текста
            )
        for el in self._batches['offset_mapping']: # Извлечение индексов текста для сопоставления со строками в batches
            ind = 0
            while int(el[ind][0]) == 0 and ind < len(el): ind += 1
            low = int(el[ind][0])
            ind = 1
            while int(el[-ind][1]) == 0 and ind < len(el): ind += 1
            high = int(el[-ind][1])
            self._batch_offsets += [[low, high + 1]]
        
        self.parse_batch_offsets()

        # Форматируем входные данные, чтобы тип совпадал с prepare_raw_batches
        new_batches = []
        # Извлечение признаков
        input_ids = self._batches["input_ids"]
        attention_mask = self._batches["attention_mask"]
        token_type_ids = self._batches.get("token_type_ids")
        for i in range(input_ids.shape[0]):
            current_input_ids = input_ids[i].unsqueeze(0)
            current_attention_mask = attention_mask[i].unsqueeze(0)
            model_inputs = {
                "input_ids": current_input_ids,
                "attention_mask": current_attention_mask
            }
            if token_type_ids is not None:
                model_inputs["token_type_ids"] = token_type_ids[i].unsqueeze(0)
            new_batches += [model_inputs]
        self._batches = new_batches

    def parse_batch_offsets(self):
        unique_numbers = []
        for start, end in self._batch_offsets:
            ind = 0
            while len(unique_numbers) > ind and start > unique_numbers[ind]: ind +=1
            if ((ind >= len(unique_numbers) or unique_numbers[ind] != start) and
                (ind == 0 or abs(unique_numbers[ind - 1] - start) > IGNORE_SIZE)and
                (ind >= len(unique_numbers)-1 or abs(unique_numbers[ind + 1] - start) > IGNORE_SIZE)):
                    unique_numbers.insert(ind, start)
            while len(unique_numbers) > ind and end > unique_numbers[ind]: ind += 1
            if ((ind >= len(unique_numbers) or unique_numbers[ind] != end) and
                (ind == 0 or abs(unique_numbers[ind - 1] - end) > IGNORE_SIZE)and
                (ind >= len(unique_numbers)-1 or abs(unique_numbers[ind + 1] - end) > IGNORE_SIZE)):
                    unique_numbers.insert(ind, end)
        
        self.text_offsets = []
        for i in range(len(unique_numbers) - 1):
            self.text_offsets += [(unique_numbers[i], unique_numbers[i+1])]
        self.text_offsets
    
    @property
    def batches(self):
        return self._batches
    
    @property
    def batch_offsets(self):
        return self._batch_offsets
    
    @property
    def text(self):
        return self._text
    
    @text.setter
    def text(self, new_text):
        self._batches = []
        self._batch_offsets = []
        self._text = new_text

    @property
    def tokens_amount(self):
        return self._batch_size
    
    @tokens_amount.setter
    def tokens_amount(self, new_tokens_amount):
        if type(new_tokens_amount) is not int: raise ValueError("You can set only integer amount")
        self._batch_size = new_tokens_amount

    @property
    def intersection_amount(self):
        return self._batch_intersection
    
    @intersection_amount.setter
    def intersection_amount(self, new_intersection_amount):
        if type(new_intersection_amount) is not int: raise ValueError("You can set only integer amount")
        self._batch_intersection = new_intersection_amount

    @ModelLoader.division_type.setter
    def division_type(self, new_type):
        if new_type[:2] not in ["se", "pa", "to", "s", "p", "t"]:
            print(f"You cannot provide \"{new_type}\" as division type! You can use only \"sentence\" | \"paragraph\" | \"tokens\". Not changing")
        elif new_type[0] == self._division_type:return
        else:
            self._division_type = new_type[0]
            if self._model is not None:
                self.load()
            self._batch_size = DEFAULT_BATCH_SIZES[self._division_type]
            self._batch_intersection = int(self._batch_size * 0.8)