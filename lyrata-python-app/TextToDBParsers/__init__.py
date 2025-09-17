from DataBaseAPI import db_api
from AiTextProcessing import TextAnaliser
from pathlib import Path
from .HTMLParser import parse_html
from .MDParser import parse_md
from .GetTextFromDB import get_text
from .PushDataToDB import update_data

def read_file(file: str | Path, db: db_api):
    if type(file) == str:file = Path(file)
    html = ''
    with db:
        if file.suffix == '.txt' or file.suffix == '.md':
            html = parse_md(file)
            parse_html(db, file, html)
        elif file.suffix == '.html':
            parse_html(db, file)

def analise_document(db: db_api, document_id: int, input_text: TextAnaliser | None, *, smooth_type = "direct", result_getter_type = "weighted"):
    text, poses = get_text(db, document_id)
    if input_text is None:
        text = TextAnaliser(text)
    else:
        input_text.text = text
        text = input_text

    results = None
    if result_getter_type[0].lower() == "w": # for weighted
        results = text.get_weighted_results()
    elif result_getter_type[0].lower() == "a": # for average
        results = text.get_average_results()
    else:
        raise ValueError(f"You cannot provide {result_getter_type} as result parser! Use \"Weighted\" or \"Average\"")

    if smooth_type[:3].lower() == "dir": # for direct
        text.direct_smooth(results)
    elif smooth_type[:3].lower() == "dis": # for distanced
        text.distance_smooth(results)
    else:
        raise ValueError(f"You cannot provide {smooth_type} as smooth type! Use \"Direct\" or \"Distanced\"")
    
    update_data(db, poses, text.smoothed_results, text.labels)