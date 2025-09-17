import markdown
import re
from pathlib import Path

def parse_md(file:str | Path)->str:
    """
    Получает markdown файл и преобразует его в html.

    `file` - путь к файлу

    Returns:
            'html_result' - строка html
    """
    res = ''
    if type(file) == str:file = Path(file)
    with open(file, 'r', encoding='utf-8') as f:
        res = f.read()
        res = re.sub(r"([^\n])\n\s*([^\n])", r"\1\n\n\2", res)
        res = markdown.markdown(res, extensions=[
            'fenced_code',
            'tables',
            'attr_list',
            'footnotes',
            'sane_lists',
        ])
    return res