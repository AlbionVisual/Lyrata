import React, { useCallback, useEffect, useRef, useState } from "react";
import { HighlighterContext } from "../utils/HighlighterContext";
import ScrollableText from "./ScrollableText";
import { DatabaseDocument } from "../utils/DatabaseTypes";

export interface Highlighter {
  startPos: number;
  endPos: number;
}

interface TextSelectionControllerProps {
  children: React.ReactNode;
  selectionSize?: number;
  selectionStep?: number;
  currentTextProperties: DatabaseDocument;
  textSize: number;
  updateProgress?: (new_progres: number) => void;
}

let magnetised: Boolean = false;
let reading_progress: number | undefined;

function TextSelectionController({
  children,
  selectionSize = 120,
  selectionStep = 100,
  currentTextProperties,
  textSize,
  updateProgress,
}: TextSelectionControllerProps) {
  // Состояния для отправки в скроллер
  const [selectionPos, setSelectionPos] = useState<number>(
    currentTextProperties[5]
  );
  const [magnetizeTo, setMagnetizeTo] = useState<HTMLDivElement | undefined>(
    undefined
  );
  // Хранение данных о выделениях
  let [hihglighter, presetHihglighter] = useState<Highlighter>({
    startPos: currentTextProperties[5] !== -1 ? currentTextProperties[5] : 0,
    endPos:
      currentTextProperties[5] !== -1
        ? currentTextProperties[5] + selectionSize
        : selectionSize,
  });
  const setHihglighter = useCallback(
    (newHighlighter: Highlighter) => {
      if (newHighlighter.endPos > textSize) {
        newHighlighter.endPos = textSize;
        newHighlighter.startPos = textSize - selectionSize;
      }
      presetHihglighter(newHighlighter);
      reading_progress = newHighlighter.startPos;
    },
    [presetHihglighter, selectionSize, textSize]
  );

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
    [selectionStep, hihglighter, selectionSize, setHihglighter]
  );
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

  const updateSelectionPos = useCallback((selectionTag: HTMLDivElement) => {
    const newSelectionPos =
      selectionTag.offsetTop + selectionTag.offsetHeight / 2;
    setSelectionPos(newSelectionPos);
    if (!magnetised) {
      magnetised = true;
      setMagnetizeTo(selectionTag);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (magnetised) {
        magnetised = false;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (updateProgress && reading_progress) updateProgress(reading_progress);
    };
  });

  return (
    <div className="TextSelectionController">
      <ScrollableText
        enableUserScrolling={false}
        selectionPos={selectionPos}
        magnetizeInstanteniouslyTo={magnetizeTo}>
        <HighlighterContext.Provider
          value={{
            startPos: hihglighter.startPos,
            endPos: hihglighter.endPos,
            updatePosFunc: updateSelectionPos,
          }}>
          {children}
        </HighlighterContext.Provider>
      </ScrollableText>
    </div>
  );
}

export default TextSelectionController;
