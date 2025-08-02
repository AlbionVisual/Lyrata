import {
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import "./TextSelectionPage.css";
import Menu from "./Menu";
import { settings } from "../index";
import { demoText } from "../utils/DemoText";

export interface ReadingText {
  text: string;
  name: string;
  startPos?: number;
}

interface TextSelectionPageProps {
  currentText?: ReadingText;
  changeCurrentText?: (newText: ReadingText) => void;
}

export let AvailableTexts: ReadingText[] = [];

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
  const [localSettings, setLocalSettings] = useState<settings>({
    demoDeleted: true,
  });
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
          window.appFileAPI.saveTextFile(
            textNameInputValue + ".lyrata.txt",
            textAreaValue
          );
          window.appSettingsAPI.updateSettings({
            AvailableTextsNames: (localSettings.AvailableTextsNames
              ? localSettings.AvailableTextsNames
              : []
            ).concat(textNameInputValue + ".lyrata.txt"),
          });
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
        <div className="FlexContainer">
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
      return {
        id: (error ? 6 : 5) + index,
        text: (
          <div className="FlexContainer">
            {data.name}
            <div
              onClick={(e) => {
                e.stopPropagation();
                AvailableTexts = AvailableTexts.filter(
                  (checkingData) => checkingData.name !== data.name
                );
                window.appFileAPI.deleteTextFile(data.name + ".lyrata.txt");
                setCurrentTextId(0);
                const newLocalSettings = {
                  AvailableTextsNames:
                    localSettings.AvailableTextsNames?.filter(
                      (checkingName) =>
                        checkingName !== data.name + ".lyrata.txt"
                    ),
                  demoDeleted: AvailableTexts.length !== 0 ? true : false,
                };
                window.appSettingsAPI.updateSettings(newLocalSettings);
                setLocalSettings(newLocalSettings);
              }}>
              Удалить
            </div>
          </div>
        ),
      };
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
    if (currentText && currentText.text !== "") {
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
    }
  }, [currentText]);

  useEffect(() => {
    if (AvailableTexts.length > currentTextId) {
      setTextNameInputValue(AvailableTexts[currentTextId].name);
      setTextAreaValue(AvailableTexts[currentTextId].text);
    }
  }, [currentTextId]);

  useEffect(() => {
    if (localSettings.demoDeleted !== true) {
      if (
        !AvailableTexts.find(
          (data) => data.name === "Демо - А. П. Чехов, Ванька"
        )
      ) {
        const text = demoText;
        const name = "Демо - А. П. Чехов, Ванька";
        AvailableTexts = AvailableTexts.concat({
          text: text,
          name: name,
        });
        setCurrentTextId(AvailableTexts.length - 1);
        if (changeCurrentText)
          changeCurrentText(AvailableTexts[AvailableTexts.length - 1]);
        window.appFileAPI.saveTextFile(name + ".lyrata.txt", text);
        window.appSettingsAPI.updateSettings({
          AvailableTextsNames: (localSettings.AvailableTextsNames
            ? localSettings.AvailableTextsNames
            : []
          ).concat(name + ".lyrata.txt"),
        });
      }
    }
    if (localSettings.AvailableTextsNames) {
      localSettings.AvailableTextsNames.forEach((name) => {
        if (!AvailableTexts.find((data) => data.name === name.slice(0, -11))) {
          window.appFileAPI
            .loadTextFile(name)
            .then(({ success, content, error }) => {
              if (content)
                AvailableTexts = AvailableTexts.concat({
                  name: name.slice(0, -11),
                  text: content,
                });
              setCurrentTextId(AvailableTexts.length - 1);
            });
        }
      });
    }
  }, [localSettings]);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await window.appSettingsAPI.getSettings();
      setLocalSettings(savedSettings);
    };
    loadSettings();
  }, []);

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
