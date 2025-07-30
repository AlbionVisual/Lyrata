import React, { useRef, useEffect, useState, useCallback } from "react";
import parseHTML from "../texts/ParseHTML";
import { text_vanka } from "../texts/vanka";
import parseMarkdown from "../texts/ParseMarkdown";
import ScrollableText from "../components/ScrollableText";
import "./ReadingPage.css";
parseHTML(parseMarkdown(text_vanka));

interface ReadingPageProps {
  selectionSize?: number;
  selectionStep?: number;
}
interface BlockedDataInterface {
  tagName: string;
  selectionPos?: number[];
  text: string;
}

function ReadingPage({
  selectionSize = 80,
  selectionStep = 70,
}: ReadingPageProps) {
  const [blockedData, setBlockedData] = useState<BlockedDataInterface[]>(
    parseHTML(parseMarkdown(text_vanka))
  );
  const selectionTagRef = useRef<HTMLDivElement>(null);
  const selectionIndexRef = useRef(0);

  const changeSelection = useCallback((amount: number) => {
    console.log(selectionIndexRef.current);
    const copy = [...blockedData];

    if (!selectionIndexRef.current) {
      // Если по какой-то причине нету id текущего блока
      selectionIndexRef.current = 0;
    }
    let currentBlock = copy[selectionIndexRef.current];

    if (!currentBlock.selectionPos) {
      // Если в нашем блоке ещё не установлен выделитель (либо мы только перекинулись на этот блок)
      if (amount > 0)
        currentBlock.selectionPos = [
          0,
          copy[selectionIndexRef.current].text.length > selectionSize
            ? selectionSize
            : copy[selectionIndexRef.current].text.length,
        ];
      else if (amount < 0)
        currentBlock.selectionPos = [
          copy[selectionIndexRef.current].text.length - selectionSize < 0
            ? 0
            : copy[selectionIndexRef.current].text.length - selectionSize,
          copy[selectionIndexRef.current].text.length,
        ];
      setBlockedData(copy);
      return;
    }

    if (
      currentBlock.selectionPos[1] >= currentBlock.text.length &&
      amount > 0
    ) {
      // Если выделитель уже в конце текущего блока
      if (selectionIndexRef.current + 1 >= copy.length) return; // в конце текста...
      selectionIndexRef.current += 1;
      currentBlock.selectionPos = undefined;
      changeSelection(amount);
      return;
    }

    if (currentBlock.selectionPos[0] <= 0 && amount < 0) {
      // Если выделитель уже в начале текущего блока
      if (selectionIndexRef.current - 1 < 0) return; // в начале текста...
      selectionIndexRef.current -= 1;
      currentBlock.selectionPos = undefined;
      changeSelection(amount);
      return;
    }

    // Остался только вариант, когда выделитель нужно переместить
    currentBlock.selectionPos[0] += amount;
    currentBlock.selectionPos[1] += amount;
    if (currentBlock.selectionPos[1] > currentBlock.text.length) {
      currentBlock.selectionPos[1] = currentBlock.text.length;
      currentBlock.selectionPos[0] =
        currentBlock.selectionPos[1] - selectionSize > 0
          ? currentBlock.selectionPos[1] - selectionSize
          : 0;
    }
    if (currentBlock.selectionPos[0] < 0) {
      currentBlock.selectionPos[0] = 0;
      currentBlock.selectionPos[1] =
        currentBlock.selectionPos[0] + selectionSize < currentBlock.text.length
          ? currentBlock.selectionPos[0] + selectionSize
          : currentBlock.text.length;
    }
    setBlockedData(copy);
  }, []);

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          changeSelection(selectionStep);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          changeSelection(-selectionStep);
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

  useEffect(() => {
    // init eventListeners
    document.addEventListener("keydown", handelKeyDown);
    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  useEffect(() => {
    // when we change selection, init machine scroll
    if (selectionTagRef.current) {
      selectionTagRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [blockedData]);

  return (
    <div className="ReadingPage">
      <ScrollableText enableUserScrolling={false}>
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
