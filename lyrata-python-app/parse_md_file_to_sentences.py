import re

def parse_markdown_to_sentences_simple(filepath: str) -> list[str]:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Ошибка: Файл '{filepath}' не найден.")
        return []
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return []

    processed_text_parts = []
    for line in lines:
        stripped_line = line.strip()
        if stripped_line.startswith('>'):
            continue
        if stripped_line:
            processed_text_parts.append(stripped_line)
    full_text = ' '.join(processed_text_parts)
    full_text = re.sub(r'\s+', ' ', full_text).strip()
    ellipsis_placeholder = "___ELLIPSIS_PLACEHOLDER___"
    text_with_placeholder = full_text.replace("...", ellipsis_placeholder)
    # Используем регулярное выражение для разбиения по знакам препинания (. ! ?).
    # `(?<=[.!?])` - это "positive lookbehind", который означает "разбить, если
    # перед этим местом находится . или ! или ?". Это позволяет сохранить знак
    # препинания в конце предложения.
    # `\s*` - ноль или более пробелов после знака препинания.
    raw_sentences = re.split(r'(?<=[.!?])\s*', text_with_placeholder)
    final_sentences = []
    for s in raw_sentences:
        cleaned_s = s.strip()
        if cleaned_s:
            final_sentences.append(cleaned_s.replace(ellipsis_placeholder, "..."))
    
    return final_sentences, processed_text_parts

if __name__ == '__main__':
    extracted_sentences, _ = parse_markdown_to_sentences_simple("big_text.md")

    print("Извлеченные предложения:")
    for i, sentence in enumerate(extracted_sentences):
        print(f"{i+1}. {sentence}")