import React, {
  Fragment,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
  useEffect,
  useContext,
} from "react";
import ScrollableText from "../components/ScrollableText";
import "./TextEditorPage.css";
import { db_update } from "../utils/requests";
import { SSEContext } from "../utils/SSEContext";
import { emotion_to_color } from "../components/TextDrawer";

interface TextEditorPageProps {
  selectionSize?: number;
  selectionStep?: number;
}

interface Highlighter {
  startPos: number;
  endPos: number;
}

const color_text = (
  content: string,
  data: any,
  lastEmotion: string,
  indexOffset: number = 0
): [React.ReactNode, string] => {
  let ai = 0;
  let res: React.ReactNode[] = [];
  for (let ind in data) {
    if (data[ind][0] === lastEmotion || Number(ind) < indexOffset) {
      lastEmotion = data[ind][0];
      continue;
    }
    res.push(
      <span style={{ color: emotion_to_color(lastEmotion) }}>
        {content.slice(ai, Number(ind) - indexOffset)}
      </span>
    );
    ai = Number(ind) - indexOffset;
    lastEmotion = data[ind][0];
  }
  res.push(
    <span style={{ color: emotion_to_color(lastEmotion) }}>
      {content.slice(ai)}
    </span>
  );
  return [
    <>
      {res.map((el, ind) => (
        <Fragment key={ind}>{el}</Fragment>
      ))}
    </>,
    lastEmotion,
  ];
};

let magnetised: Boolean = false;
let prevSelectionTagRef: HTMLDivElement;
let reading_progress: number | undefined;

function TextEditorPage({
  selectionSize = 120,
  selectionStep = 100,
}: TextEditorPageProps) {
  const firstActivation = useRef(true);

  // Получение данных
  const storage = useContext(SSEContext);
  const currentText = storage.current_text[0];
  const currentTextProperties = storage.current_document[0];

  // Состояния для отправки в скроллер
  const [selectionPos, setSelectionPos] = useState<number>(
    currentTextProperties[5]
  );
  const [magnetizeTo, setMagnetizeTo] = useState<HTMLDivElement | undefined>(
    undefined
  );

  // Хранение данных о выделениях
  const selectionTagRef = useRef<HTMLDivElement>(null);
  let [hihglighter, presetHihglighter] = useState<Highlighter>({
    startPos: currentTextProperties[5] !== -1 ? currentTextProperties[5] : 0,
    endPos:
      currentTextProperties[5] !== -1
        ? currentTextProperties[5] + selectionSize
        : selectionSize,
  });
  const setHihglighter = (newHighlighter: Highlighter) => {
    presetHihglighter(newHighlighter);
    reading_progress = newHighlighter.startPos;
  };

  // Обработка нажатия клавиш
  const pressedKeys = useRef<Set<string>>(new Set<string>());
  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (pressedKeys.current.has(event.key)) return;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          pressedKeys.current.add(event.key);
          let otherCopy = { ...hihglighter };
          otherCopy.startPos += selectionStep;
          otherCopy.endPos = otherCopy.startPos + selectionSize;
          setHihglighter(otherCopy);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          pressedKeys.current.add(event.key);
          let copy = { ...hihglighter };
          copy.startPos -= selectionStep;
          if (copy.startPos < 0) copy.startPos = 0;
          copy.endPos = copy.startPos + selectionSize;
          setHihglighter(copy);
          break;
      }
    },
    [selectionStep, hihglighter]
  );

  // Рендерер текста по структуре данных
  const gened_text = useMemo((): React.ReactNode => {
    if (!currentText) return <>Загрузка...</>;

    let ind = 0;
    let currentTextOffset = 0;
    let lastEmotion = "";

    // Установка выделений, если таковые
    const checkOffsets = (content: string, data: any): React.ReactNode => {
      let ans: React.ReactNode;
      const [h1, h2] = [hihglighter.startPos, hihglighter.endPos];
      const [s1, s2] = [currentTextOffset, currentTextOffset + content.length];
      if (Math.max(s1, h1) < Math.min(s2, h2)) {
        let beforeSelection: React.ReactNode = "",
          afterSelection: React.ReactNode = "",
          selection = "";
        let [a1, a2] = [0, content.length];
        let reffed = false;
        if (h1 >= s1) {
          // Выделение в этом блоке только начинается
          a1 = Math.trunc(h1 - s1);
          while (content[a1] !== " " && a1 > 0) a1 -= 1;
          [beforeSelection, lastEmotion] = color_text(
            content.slice(0, a1),
            data,
            lastEmotion
          );
          reffed = true;
        }
        if (h2 < s2) {
          // Выделение в этом блоке заканчивается
          a2 = Math.trunc(h2 - s1);
          while (a2 < content.length && content[a2] !== " ") a2 += 1;
          [afterSelection, lastEmotion] = color_text(
            content.slice(a2),
            data,
            lastEmotion,
            a2
          );
        }
        selection = content.slice(a1, a2);
        ans = (
          <>
            {beforeSelection}
            <span
              key={a1}
              className="textSelection"
              ref={reffed ? selectionTagRef : undefined}>
              {selection}
            </span>
            {afterSelection}
          </>
        );
      } else {
        [ans, lastEmotion] = color_text(content, data, lastEmotion);
      }
      currentTextOffset += content.length;
      return ans;
    };

    const get_children = (parent_id: number | null = null): React.ReactNode => {
      let ans: React.ReactNode[] = [];
      while (ind < currentText.length && parent_id === currentText[ind][2]) {
        const subel_type = currentText[ind][4];
        if (subel_type === "text") {
          const subel_content = currentText[ind][7];
          const subel_data = currentText[ind][6];
          ans.push(
            <Fragment key={currentText[ind][0]}>
              {checkOffsets(subel_content, subel_data)}
            </Fragment>
          );
          ind += 1;
        } else {
          const new_parent_id = currentText[ind][0];
          const parsed_attrs = {
            ...currentText[ind][5],
            key: new_parent_id,
          };
          ind += 1;
          const children = get_children(new_parent_id);
          ans.push(React.createElement(subel_type, parsed_attrs, children));
        }
      }

      return <>{ans.map((el) => el)}</>;
    };

    return get_children();
  }, [currentText, hihglighter]);

  // Вешание ивентов на окно
  useEffect(() => {
    document.addEventListener("keydown", handelKeyDown);

    document.addEventListener("keyup", (event) => {
      pressedKeys.current.delete(event.code);
    });
    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  useLayoutEffect(() => {
    if (
      selectionTagRef.current &&
      selectionTagRef.current !== prevSelectionTagRef
    ) {
      prevSelectionTagRef = selectionTagRef.current;
      const newSelectionPos =
        selectionTagRef.current.offsetTop +
        selectionTagRef.current.offsetHeight / 2;
      setSelectionPos(newSelectionPos);
    }
    if (!magnetised && selectionTagRef.current) {
      magnetised = true;
      setMagnetizeTo(selectionTagRef.current);
    }
  });

  useEffect(() => {
    return () => {
      if (magnetised) {
        db_update(`database/document/${currentTextProperties[0]}/progress`, {
          progress: reading_progress
            ? reading_progress
            : currentTextProperties[5],
        });
        magnetised = false;
      }
    };
  }, []);

  // console.log("selectionPos: ", selectionPos);
  // console.log("selectionOffsetTop: ", selectionTagRef.current?.offsetTop);
  // window.outerHeight * 3;
  // textElementRef.current?.scrollHeight

  if (firstActivation.current) {
    firstActivation.current = false;
    storage.current_text[1](0, 0);
  }

  return (
    <div className="TextEditorPage">
      <ScrollableText
        enableUserScrolling={true}
        selectionPos={selectionPos}
        magnetizeInstanteniouslyTo={magnetizeTo}>
        <div className="ReadingTextElement">{gened_text}</div>
      </ScrollableText>
    </div>
  );
}

export default TextEditorPage;
