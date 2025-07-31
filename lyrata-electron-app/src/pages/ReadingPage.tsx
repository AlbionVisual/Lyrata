import React, { useRef, useEffect, useState, useCallback } from "react";
import parseHTML from "../texts/ParseHTML";
import { text_vanka } from "../texts/vanka";
import parseMarkdown from "../texts/ParseMarkdown";
import ScrollableText from "../components/ScrollableText";
import "./ReadingPage.css";

import {
  BlockedDataInterface,
  changeSelection,
} from "../texts/ChangeSelection";
import { validateHeaderName } from "node:http";

interface ReadingPageProps {
  selectionSize?: number;
  selectionStep?: number;
}

function ReadingPage({
  selectionSize = 80,
  selectionStep = 70,
}: ReadingPageProps) {
  const [blockedData, setBlockedData] = useState<BlockedDataInterface[]>(
    parseHTML(parseMarkdown(text_vanka))
  );
  const [selectionPos, setSelectionPos] = useState<number | undefined>();
  const [magnetizeInstanteniouslyTo, setMagnetizeInstanteniouslyTo] = useState<
    HTMLElement | undefined
  >();
  const selectionTagRef = useRef<HTMLDivElement>(null);
  const selectionIndexRef = useRef(0);
  const pressedKeys = useRef<Set<string>>(new Set<string>());

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (pressedKeys.current.has(event.key)) return;
      const copy = [...blockedData];
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          selectionIndexRef.current = changeSelection(
            selectionStep,
            copy,
            selectionIndexRef.current,
            selectionSize
          );
          pressedKeys.current.add(event.key);
          setBlockedData(copy);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          selectionIndexRef.current = changeSelection(
            -selectionStep,
            copy,
            selectionIndexRef.current,
            selectionSize
          );
          pressedKeys.current.add(event.key);
          setBlockedData(copy);
          break;
      }
    },
    [selectionStep]
  );

  useEffect(() => {
    // init first selection
    let copy: BlockedDataInterface[] = [...blockedData];
    if (!selectionIndexRef.current) selectionIndexRef.current = 0;
    copy[selectionIndexRef.current].selectionPos = [
      0,
      copy[selectionIndexRef.current].text.length > selectionSize
        ? selectionSize
        : copy.length,
    ];
    setBlockedData(copy);
  }, []);

  const activationFlagRef = useRef<boolean>(false);
  useEffect(() => {
    // Magnetise to saved selection after start
    if (selectionTagRef.current && !activationFlagRef.current) {
      setMagnetizeInstanteniouslyTo(selectionTagRef.current);
      activationFlagRef.current = true;
    }
  }, [selectionTagRef.current]);

  useEffect(() => {
    // init eventListeners
    document.addEventListener("keydown", handelKeyDown);

    document.addEventListener("keyup", (event) => {
      pressedKeys.current.delete(event.code);
    });
    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  useEffect(() => {
    // Обновить необходимое положение экрана
    if (selectionTagRef.current) {
      const selectionPos =
        selectionTagRef.current.offsetTop +
        selectionTagRef.current.offsetHeight / 2;
      setSelectionPos(selectionPos);
    }
  }, [blockedData]);

  return (
    <div className="ReadingPage">
      <ScrollableText
        enableUserScrolling={false}
        selectionPos={selectionPos}
        magnetizeInstanteniouslyTo={magnetizeInstanteniouslyTo}>
        <div className="ReadingTextElement">
          {blockedData.map((data, index) => {
            if (data.selectionPos) {
              const startInd = data.selectionPos[0];
              const endInd = data.selectionPos[1];
              const textBefore = data.text.slice(0, startInd);
              const textInside = data.text.slice(startInd, endInd);
              const textAfter = data.text.slice(endInd, data.text.length);
              return React.createElement(
                data.tagName,
                { key: index, selectionstart: startInd },
                <>
                  {textBefore}
                  <span className="textSelection" ref={selectionTagRef}>
                    {textInside}
                  </span>
                  {textAfter}
                </>
              );
            }
            return React.createElement(data.tagName, { key: index }, data.text);
          })}
        </div>
      </ScrollableText>
    </div>
  );
}

export default ReadingPage;
