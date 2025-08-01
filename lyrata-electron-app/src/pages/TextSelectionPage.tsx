import {
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import "./TextSelectionPage.css";
import Menu from "./Menu";
import { text_vanka } from "../texts/vanka";
import parseMarkdown from "../texts/ParseMarkdown";

export interface ReadingText {
  text: string;
  name: string;
  startPos?: number;
}

interface TextSelectionPageProps {
  currentText?: ReadingText;
  changeCurrentText?: (newText: ReadingText) => void;
}

export let AvailableTexts: ReadingText[] = [
  {
    text: parseMarkdown(text_vanka) as string,
    name: 'Демо: А. П. Чехов\t"Ванька"',
  },
  {
    name: "Буферный текст для тестов...",
    text: `Я хочу создать свой новый текст и начать читать его.

Для этого я хочу создать заголовок:

<h1>Заголовок 1</h1>

Разных уровней:

<h2>Заголовок 2</h2>
<h3>Заголовок 3</h3>
<h4>Заголовок 4</h4>
<h5>Заголовок 5</h5>

Также я хочу протестировать параграфы:

<p>Немного текста в параграфе</p>

А ещё немного стилей:

<i>Итальянский шрифт</i>

<b>И жирный</b>

А теперь проверим как работает md:

# Заголовок 1
## Заголовок 2
### Заголовок 3
#### Заголовок 4
##### Заголовок 5

А ещё форматирование:

_Немного текста с нижним подчёркиванием_

*Немного со звёздочками*

**Немного с двойными звёздочками**`,
  },
];

function TextSelectionPage({
  currentText,
  changeCurrentText,
}: TextSelectionPageProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [textAreaValue, setTextAreaValue] = useState<string>("");
  const [textNameInputValue, setTextNameInputValue] = useState<string>("");
  const [currentTextId, setCurrentTextId] = useState<number>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textNameInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback(async () => {
    if (!window.electronAPI) {
      setError("Electron API not available. Are you running in Electron?");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const content = await window.electronAPI.openFile();
      if (content !== null) {
        setFileContent(content);
        setTextAreaValue(content);
        setTextNameInputValue(`Текст номер ${AvailableTexts.length}`);
      } else {
        setError("File import cancelled or failed.");
      }
    } catch (err) {
      console.error("Error importing file:", err);
      setError(
        `Failed to import file: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleActivation = (id: number) => {
    if (id === 1 && !loading) handleImportFile();
    else if (id === 2 && error) setError(null);
    else {
      if (error) id -= 1;
      if (id === 2) {
        if (textAreaRef.current) textAreaRef.current.focus();
      } else if (id === 3) {
        if (!textAreaValue) setError("Введите текст для чтения!");
        else if (
          !textNameInputValue ||
          AvailableTexts.find((data) => data.name === textNameInputValue.trim())
        )
          setError("Введите отличительное название для текста!");
        else {
          AvailableTexts = AvailableTexts.concat({
            text: textAreaValue,
            name: textNameInputValue,
          });
          setCurrentTextId(AvailableTexts.length - 1);
          if (changeCurrentText)
            changeCurrentText(AvailableTexts[AvailableTexts.length - 1]);
        }
      } else if (id > 4) {
        setCurrentTextId(id - 5);
        if (changeCurrentText) changeCurrentText(AvailableTexts[id - 5]);
      }
    }
  };

  const MenuPositions = [
    { id: 0, text: <h1>Что будем читать?</h1> },
    {
      id: 1,
      text: (
        <>
          {loading ? "Импортирование..." : "Импортировать файл (.md или .html)"}
        </>
      ),
    },
    {
      id: error ? 2 : -1,
      text: (
        <>
          {error && (
            <div className="TextSelectionPageErrorMessage">Ошибка: {error}</div>
          )}
        </>
      ),
    },
    {
      id: error ? 3 : 2,
      text: (
        <textarea
          value={textAreaValue}
          onChange={(e) => {
            setTextAreaValue(e.target.value);
            AvailableTexts[currentTextId].text = e.target.value;
          }}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Импортируйте файл или введите текс сюда..."
          className="TextSelectionArea"
          rows={1}
          ref={textAreaRef}></textarea>
      ),
    },
    {
      id: error ? 4 : 3,
      text: (
        <div className="SelectionTextSaveItem">
          Сохранить как:
          <input
            ref={textNameInputRef}
            onClick={(e) => {
              e.stopPropagation();
            }}
            placeholder="Введите название для текста..."
            value={textNameInputValue}
            className="TextSelectionNameInput"
            onChange={(e) => {
              setTextNameInputValue(e.target.value);
            }}
          />
        </div>
      ),
    },
    {
      id: error ? 5 : 4,
      text: <h2>Можно просто выбрать подходящий текст:</h2>,
    },
    ...AvailableTexts.map((data, index) => {
      return { id: (error ? 6 : 5) + index, text: <>{data.name}</> };
    }),
  ];

  useLayoutEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaValue]);

  useEffect(() => {
    if (fileContent) setTextAreaValue(fileContent);
  }, [fileContent]);

  useEffect(() => {
    if (!currentText || !currentText.name) {
      if (changeCurrentText) changeCurrentText(AvailableTexts[0]);
      return;
    }
    if (!AvailableTexts.find((data) => data.name === currentText.name)) {
      AvailableTexts = AvailableTexts.concat(currentText);
      setCurrentTextId(AvailableTexts.length - 1);
    } else {
      setCurrentTextId(
        AvailableTexts.findIndex((data) => data.name === currentText.name)
      );
    }
    setTextNameInputValue(currentText.name);
    setTextAreaValue(currentText.text);
  }, [currentText]);

  useEffect(() => {
    setTextNameInputValue(AvailableTexts[currentTextId].name);
    setTextAreaValue(AvailableTexts[currentTextId].text);
  }, [currentTextId]);

  return (
    <div className="TextSelectionPage">
      <Menu
        menuPositions={MenuPositions}
        onItemActivate={handleActivation}
        enableEvents={
          document.activeElement !== textAreaRef.current &&
          document.activeElement !== textNameInputRef.current
        }></Menu>
    </div>
  );
}

export default TextSelectionPage;
