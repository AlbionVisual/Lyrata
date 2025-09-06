import React, {
  Fragment,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./TextDrawer.css";
import { DatabaseEmotion, DataEmotionMap } from "../utils/DatabaseTypes";
import { HighlighterContext } from "../utils/HighlighterContext";
import { Highlighter } from "./TextSelectionController";

interface TextDrawerProps {
  indexOffset: number;
  rawText: string;
  data: DataEmotionMap;
  defualtEmotion: DatabaseEmotion;
}

const emotion_to_color = (emotion: string) => {
  switch (emotion) {
    case "aggression":
      return "#eedada";
    case "anxiety":
      return "#dadaee";
    case "sarcasm":
      return "#eeeeda";
    case "positive":
      return "#daeeda";
    case "normal":
    default:
      return "#eeeeee";
  }
};

const color_text = (
  content: string,
  data: DataEmotionMap,
  lastEmotion: DatabaseEmotion,
  indexOffset: number = 0
): [React.ReactNode, DatabaseEmotion] => {
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

function TextDrawer({
  indexOffset,
  rawText,
  data,
  defualtEmotion,
}: TextDrawerProps) {
  const highlighterStorage = useContext(HighlighterContext);
  const selectionTagRef = useRef<HTMLDivElement>(null);
  const containsSelection = useRef<boolean>(false);
  const [reasonableHighlighterPos, setReasonableHighlighterPos] =
    useState<Highlighter>({
      startPos: -1,
      endPos: -1,
    });

  // Проверка нужно ли обновлять компонент
  const [h1, h2] = [highlighterStorage.startPos, highlighterStorage.endPos];
  const [s1, s2] = [indexOffset, indexOffset + rawText.length];
  if (Math.max(s1, h1) < Math.min(s2, h2)) {
    if (!containsSelection.current) {
      setReasonableHighlighterPos({
        startPos: highlighterStorage.startPos,
        endPos: highlighterStorage.endPos,
      });
      containsSelection.current = true;
    } else if (
      highlighterStorage.startPos !== reasonableHighlighterPos.startPos ||
      highlighterStorage.endPos !== reasonableHighlighterPos.endPos
    ) {
      setReasonableHighlighterPos({
        startPos: highlighterStorage.startPos,
        endPos: highlighterStorage.endPos,
      });
    }
  } else {
    if (containsSelection.current) {
      setReasonableHighlighterPos({ startPos: -1, endPos: -1 });
      containsSelection.current = false;
    }
  }

  // Просчёт текста только в нужные моменты
  const text = useMemo(() => {
    let ans: React.ReactNode = <></>;
    let lastEmotion = defualtEmotion;
    const [h1, h2] = [
      reasonableHighlighterPos.startPos,
      reasonableHighlighterPos.endPos,
    ];
    const [s1, s2] = [indexOffset, indexOffset + rawText.length];
    if (Math.max(s1, h1) < Math.min(s2, h2)) {
      let beforeSelection: React.ReactNode = "",
        afterSelection: React.ReactNode = "",
        selection = "";
      let [a1, a2] = [0, rawText.length];
      let reffed = false;
      if (h1 >= s1) {
        // Выделение в этом блоке только начинается
        a1 = Math.trunc(h1 - s1);
        while (rawText[a1] !== " " && a1 > 0) a1 -= 1;
        [beforeSelection, lastEmotion] = color_text(
          rawText.slice(0, a1),
          data,
          lastEmotion
        );
        reffed = true;
      }
      if (h2 < s2) {
        // Выделение в этом блоке заканчивается
        a2 = Math.trunc(h2 - s1);
        while (a2 < rawText.length && rawText[a2] !== " ") a2 += 1;
        [afterSelection, lastEmotion] = color_text(
          rawText.slice(a2),
          data,
          lastEmotion,
          a2
        );
      }
      selection = rawText.slice(a1, a2);
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
      [ans, lastEmotion] = color_text(rawText, data, lastEmotion);
    }
    return ans;
  }, [
    data,
    defualtEmotion,
    reasonableHighlighterPos.endPos,
    reasonableHighlighterPos.startPos,
    indexOffset,
    rawText,
  ]);

  useLayoutEffect(() => {
    if (selectionTagRef.current) {
      highlighterStorage.updatePosFunc(selectionTagRef.current);
    }
  });

  return text;
}

export default TextDrawer;
