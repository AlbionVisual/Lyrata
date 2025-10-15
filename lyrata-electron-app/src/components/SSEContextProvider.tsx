import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DatabaseDocument,
  DatabaseTextBlock,
  DocumentProperties,
} from "../utils/DatabaseTypes";
import { SSEContext } from "../utils/SSEContext";
import { db_update } from "../utils/requests";

interface SSEContextProviderProps {
  children: React.ReactNode;
}

interface StateSetting {
  name: string;
  state:
    | [number, React.Dispatch<React.SetStateAction<number>>]
    | [string, React.Dispatch<React.SetStateAction<string>>]
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

let prevDocId = -1; // Переменная для слежки за изменением документа и последующим обновлением текста

/**
 * Компонент, поставляющий контекст и всю логику обновления данных
 *
 * @param props.children Под дерево компонентов для использования контекста
 * @returns Провайдер контекста с переданным поддеревом компонентов
 */
function SSEContextProvider({ children }: SSEContextProviderProps) {
  // Объявление данных
  const [currentDocument, setCurrentDocument] = useState<DatabaseDocument>([
    -1,
    "",
    "",
    "",
    "",
    -1,
  ]);
  const [documentListProperties, setDocumentListProperties] = useState<
    DocumentProperties[]
  >([]);
  const [modelStatus, setModelStatus] = useState<
    "loaded" | "unloaded" | "loading"
  >("unloaded");
  const [currentText, setCurrentText] = useState<DatabaseTextBlock[]>([]);
  const [documentList, presetDocumentList] = useState<DatabaseDocument[]>([]);
  const [currentDivisionType, setCurrentDivisionType] = useState("");
  const [currentSmoothType, setCurrentSmoothType] = useState("");
  const [currentResultGetterType, setCurrentResultGetterType] = useState("");
  const [currentModelName, setCurrentModelName] = useState("");
  const [textSelectionSize, setTextSelectionSize] = useState(200);
  const [textSelectionStep, setTextSelectionStep] = useState(100);
  const [colorEmotions, setColorEmotions] = useState(false);
  const [encryptText, setEncryptText] = useState(false);
  const setDocumentList = useCallback(
    (new_document_list: DatabaseDocument[]) => {
      presetDocumentList(new_document_list);
      let copy: DocumentProperties[] = [];
      let targetMap = new Map<number, DocumentProperties>([]);
      documentListProperties.forEach((elem) => {
        targetMap.set(elem.documentId, elem);
      });
      for (let ind in new_document_list) {
        const el = targetMap.get(new_document_list[ind][0]);
        if (el !== undefined) {
          copy.push(el);
        } else {
          copy.push({
            documentId: new_document_list[ind][0],
            isAnalising: false,
          });
        }
      }
      setDocumentListProperties(copy);
    },
    [presetDocumentList, setDocumentListProperties, documentListProperties]
  );

  // Помощник в перечислении настроек
  const statedSettingList: StateSetting[] = useMemo(() => {
    return [
      {
        name: "current_division_type",
        state: [currentDivisionType, setCurrentDivisionType],
      },
      {
        name: "current_model_name",
        state: [currentModelName, setCurrentModelName],
      },
      {
        name: "current_result_getter_type",
        state: [currentResultGetterType, setCurrentResultGetterType],
      },
      {
        name: "current_smooth_type",
        state: [currentSmoothType, setCurrentSmoothType],
      },
      {
        name: "color_emotions",
        state: [colorEmotions, setColorEmotions],
      },
      {
        name: "text_selection_size",
        state: [textSelectionSize, setTextSelectionSize],
      },
      {
        name: "text_selection_step",
        state: [textSelectionStep, setTextSelectionStep],
      },
      { name: "encrypt_text", state: [encryptText, setEncryptText] },
    ];
  }, [
    currentDivisionType,
    currentModelName,
    currentResultGetterType,
    currentSmoothType,
    colorEmotions,
    textSelectionSize,
    textSelectionStep,
    encryptText,
  ]);

  // флаги
  const firstStartup = useRef<Boolean>(true);
  const currentOffset = useRef<number>(0);
  const currentAmount = useRef<number>(0);

  // апдейтеры
  const documentListUpdater = useCallback(
    (event: MessageEvent<any> | undefined = undefined) => {
      fetch("http://localhost:5000/api/database/document_list")
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          json = json.items;
          setDocumentList(json);
          if (currentDocument[0] === -1) {
            setCurrentDocument(json[0]);
          }
        });
    },
    [setDocumentList, currentDocument, setCurrentDocument]
  );

  const requestCurrentText = useCallback(
    (
      new_offset: number = currentOffset.current,
      amount: number = currentAmount.current
    ) => {
      currentAmount.current = amount;
      currentOffset.current = new_offset;
      if (currentDocument[0] === -1) return;
      fetch(`http://localhost:5000/api/database/document/${currentDocument[0]}`)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          setCurrentText(json);
        });
    },
    [currentDocument]
  );

  if (prevDocId !== currentDocument[0]) {
    prevDocId = currentDocument[0];
    requestCurrentText();
  }

  const onDocumentUpdate = useCallback(
    (event: MessageEvent<any>) => {
      const id = JSON.parse(event.data).document_id;
      const index = documentListProperties.findIndex(
        (el) => el.documentId === id
      );
      if (index !== -1) {
        let copy = [...documentListProperties];
        copy[index].isAnalising = false;
        setDocumentListProperties(copy);
      }
      if (event.data && id !== undefined) {
        if (id === currentDocument[0]) {
          requestCurrentText();
        }
        return;
      }
      console.log("sth-went-wrong");
      requestCurrentText();
    },
    [documentListProperties, currentDocument, requestCurrentText]
  );

  const onModelStatusUpdate = useCallback((event: MessageEvent<any>) => {
    const new_status = JSON.parse(event.data).status;
    if (event.data && new_status !== undefined) {
      setModelStatus(new_status);
      return;
    }
  }, []);

  const onSettingsUpdate = useCallback(
    (event: any | null, type: string = "", new_val: any = "") => {
      if (event === null && type && new_val !== "") {
        statedSettingList.forEach((val) => {
          if (val.name === type && typeof new_val === typeof val.state[0]) {
            val.state[1](new_val);
          }
        });
      } else {
        fetch(`http://localhost:5000/api/settings`)
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            statedSettingList.forEach((val) => {
              if (json[val.name] && json[val.name] !== val.state[0]) {
                val.state[1](json[val.name]);
              }
            });
          });
      }
    },
    [statedSettingList]
  );

  const settingsSaver = useCallback(() => {
    const settings = statedSettingList.reduce((acc: any, currentItem) => {
      acc[currentItem.name] = currentItem.state[0];
      return acc;
    }, {});
    db_update("settings", settings);
  }, [statedSettingList]);

  // при первом запуске
  if (firstStartup.current) {
    documentListUpdater();
    firstStartup.current = false;
    onSettingsUpdate("some not null value");
  }

  // Ивенты (автообновление)
  const eventSource = useRef<EventSource>(null);

  useEffect(() => {
    eventSource.current = new EventSource(
      `http://localhost:5000/api/database/update_caller`
    );
    eventSource.current.onopen = () => {
      console.log("SSE соединение установлено.");
    };

    eventSource.current.onerror = (error) => {
      console.error("Ошибка SSE:", error);
    };

    return () => {
      console.log("Закрытие SSE соединения.");
      if (eventSource.current) eventSource.current.close();
    };
  }, []);

  useEffect(() => {
    if (!eventSource.current) return;
    eventSource.current.addEventListener(
      "documents_table_update",
      documentListUpdater
    );

    eventSource.current.addEventListener("document_update", onDocumentUpdate);
    eventSource.current.addEventListener("model_status", onModelStatusUpdate);
    // eventSource.current.addEventListener("settings_update", onSettingsUpdate);
    return () => {
      if (!eventSource.current) return;
      eventSource.current.removeEventListener(
        "document_update",
        onDocumentUpdate
      );
      eventSource.current.removeEventListener(
        "documents_table_update",
        documentListUpdater
      );
      eventSource.current.removeEventListener(
        "model_status",
        onModelStatusUpdate
      );
      // eventSource.current.removeEventListener(
      //   "settings_update",
      //   onSettingsUpdate
      // );
    };
  }, [documentListUpdater, onDocumentUpdate, onModelStatusUpdate]);

  // Синхронизатор настроек
  useEffect(() => {
    settingsSaver();
    return () => {
      settingsSaver();
    };
  }, [settingsSaver]);

  // Мемоизатор поддерева
  const subComponents = useMemo(() => children, [children]);

  return (
    <SSEContext.Provider
      value={{
        settings: statedSettingList.reduce((acc: any, item) => {
          acc[item.name] = [
            item.state[0],
            (new_val: any) => onSettingsUpdate(null, item.name, new_val),
          ];
          return acc;
        }, {}),
        current_document: [
          currentDocument,
          (new_val: DatabaseDocument) => setCurrentDocument(new_val),
        ],
        document_list: [documentList, setDocumentList],
        documents_properties: [
          documentListProperties,
          setDocumentListProperties,
        ],
        current_text: [currentText, requestCurrentText],
        model_status: modelStatus,
      }}>
      {subComponents}
    </SSEContext.Provider>
  );
}

export default SSEContextProvider;
