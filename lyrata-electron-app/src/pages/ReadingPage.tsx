import React, { useRef, useMemo, useContext } from "react";
import { SSEContext } from "../utils/SSEContext";
import { DatabaseEmotion } from "../utils/DatabaseTypes";
import TextDrawer from "../components/TextDrawer";
import "./ReadingPage.css";
import TextSelectionController from "../components/TextSelectionController";

interface ReadingPageProps {}

function ReadingPage({}: ReadingPageProps) {
  const firstActivation = useRef(true);

  // Получение данных
  const storage = useContext(SSEContext);
  const currentText = storage.current_text[0];
  const currentTextProperties = storage.settings.current_document[0];

  // Рендерер текста по структуре данных
  const gened_text = useMemo((): [React.ReactNode, number] => {
    if (!currentText) return [<>Загрузка...</>, 0];

    let ind = 0;
    let currentTextOffset = 0;
    let lastEmotion: DatabaseEmotion = "normal";

    const get_children = (parent_id: number | null = null): React.ReactNode => {
      let ans: React.ReactNode[] = [];
      while (ind < currentText.length && parent_id === currentText[ind][2]) {
        const subel_type = currentText[ind][4];
        if (subel_type === "text") {
          const subel_content = currentText[ind][7];
          const subel_data = currentText[ind][6];
          ans.push(
            <TextDrawer
              key={currentText[ind][0]}
              rawText={subel_content}
              indexOffset={currentTextOffset}
              data={subel_data}
              defualtEmotion={lastEmotion}></TextDrawer>
          );
          if (subel_data) {
            const keysAsStrings = Object.keys(subel_data);
            if (keysAsStrings.length !== 0) {
              const largestKey = Math.max(
                ...keysAsStrings.map((key) => parseInt(key, 10))
              );
              lastEmotion = subel_data[largestKey][0];
            }
          }
          currentTextOffset += subel_content.length;
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

    return [get_children(), currentTextOffset];
  }, [currentText]);

  if (firstActivation.current) {
    firstActivation.current = false;
    storage.current_text[1](0, 0);
  }

  return (
    <div className="ReadingPage">
      <TextSelectionController
        currentTextProperties={currentTextProperties}
        textSize={gened_text[1]}>
        <div className="ReadingTextElement">{gened_text[0]} </div>
      </TextSelectionController>
    </div>
  );
}

export default ReadingPage;
