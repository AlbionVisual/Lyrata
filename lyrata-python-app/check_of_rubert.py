from parse_ai_request_and_answer import classify_text_backend
from parse_md_file_to_sentences import parse_markdown_to_sentences_simple
from time import perf_counter
from colorama import Fore, Style, init

init()  # Инициализация colorama

def max_dict(d):
    if not d: return
    m = list(d.values())[0]
    ans = list(d.keys())[0]
    for key, el in d.items():
        if el > m:
            m = el
            ans = key
    return ans, m


extracted_sentences = parse_markdown_to_sentences_simple("big_text.md")

sum_time = 0

batch = 0
for i in range(batch, len(extracted_sentences) - batch):
    text = ''
    if batch != 0:
        text = ' '.join(extracted_sentences[i-batch:i+batch])
    else:
        text = extracted_sentences[i]

    start = perf_counter()
    result = classify_text_backend(text)
    sum_time += perf_counter() - start

    print((Style.BRIGHT + Fore.RED + 'Text: ' + Style.RESET_ALL) + (Style.DIM + text + ' -> ' + Style.RESET_ALL) + (Style.BRIGHT + Fore.GREEN + 'Answer: ' + max_dict(result[0])[0] + Style.RESET_ALL) + (' and full answer: ' + str(result)))

print(f"Average time: {sum_time / (len(extracted_sentences) - 2*batch)}")