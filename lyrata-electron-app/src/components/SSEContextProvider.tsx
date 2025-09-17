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
  const [currentText, setCurrentText] = useState<DatabaseTextBlock[]>([]);
  const [documentList, presetDocumentList] = useState<DatabaseDocument[]>([]);
  const [currentDivisionType, setCurrentDivisionType] = useState("");
  const [currentSmoothType, setCurrentSmoothType] = useState("");
  const [currentResultGetterType, setCurrentResultGetterType] = useState("");
  const [currentModelName, setCurrentModelName] = useState(0);
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

  const onSettingsUpdate = useCallback(
    (
      event: any | null,
      type: string = "",
      new_val: string | number | DatabaseDocument = ""
    ) => {
      if (event === null && type && new_val) {
        if (type === "division_type" && typeof new_val === "string") {
          setCurrentDivisionType(new_val);
        }
        if (type === "model_name" && typeof new_val === "number") {
          setCurrentModelName(new_val);
        }
        if (type === "result_getter_type" && typeof new_val === "string") {
          setCurrentResultGetterType(new_val);
        }
        if (type === "smooth_type" && typeof new_val === "string") {
          setCurrentSmoothType(new_val);
        }
        if (
          type === "current_document" &&
          typeof new_val !== "string" &&
          typeof new_val !== "number"
        ) {
          setCurrentDocument(new_val);
        }
      } else {
        fetch(`http://localhost:5000/api/settings`)
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            if (
              json.division_type &&
              json.division_type !== currentDivisionType
            )
              setCurrentDivisionType(json.division_type);
            if (json.model_name && json.model_name !== currentModelName)
              setCurrentModelName(json.model_name);
            if (
              json.result_getter_type &&
              json.result_getter_type !== currentResultGetterType
            )
              setCurrentResultGetterType(json.result_getter_type);
            if (json.smooth_type && json.smooth_type !== currentSmoothType)
              setCurrentSmoothType(json.smooth_type);
          });
      }
    },
    [
      currentDivisionType,
      currentModelName,
      currentResultGetterType,
      currentSmoothType,
    ]
  );

  const settingsSaver = useCallback(() => {
    const settings = {
      division_type: currentDivisionType,
      model_name: currentModelName,
      result_getter_type: currentResultGetterType,
      smooth_type: currentSmoothType,
    };
    db_update("settings", settings);
  }, [
    currentDivisionType,
    currentModelName,
    currentResultGetterType,
    currentSmoothType,
  ]);

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
      settingsSaver();
    };
  }, []);

  useEffect(() => {
    if (!eventSource.current) return;
    eventSource.current.addEventListener(
      "documents_table_update",
      documentListUpdater
    );

    eventSource.current.addEventListener("document_update", onDocumentUpdate);
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
      // eventSource.current.removeEventListener(
      //   "settings_update",
      //   onSettingsUpdate
      // );
    };
  }, [documentListUpdater, onDocumentUpdate, onSettingsUpdate]);

  // Синхронизатор настроек
  useEffect(() => {
    settingsSaver();
  }, [settingsSaver]);

  // Мемоизатор поддерева
  const subComponents = useMemo(() => children, [children]);

  return (
    <SSEContext.Provider
      value={{
        settings: {
          current_document: [
            currentDocument,
            (new_val: DatabaseDocument) =>
              onSettingsUpdate(null, "current_document", new_val),
          ],
          current_division_type: [
            currentDivisionType,
            (new_val: string) =>
              onSettingsUpdate(null, "division_type", new_val),
          ],
          current_model_name: [
            currentModelName,
            (new_val: number) =>
              onSettingsUpdate(null, "division_type", new_val),
          ],
          current_smooth_type: [
            currentSmoothType,
            (new_val: string) => onSettingsUpdate(null, "smooth_type", new_val),
          ],
          current_result_getter_type: [
            currentResultGetterType,
            (new_val: string) =>
              onSettingsUpdate(null, "result_getter_type", new_val),
          ],
        },
        document_list: [documentList, setDocumentList],
        documents_properties: [
          documentListProperties,
          setDocumentListProperties,
        ],
        current_text: [currentText, requestCurrentText],
      }}>
      {subComponents}
    </SSEContext.Provider>
  );
}

export default SSEContextProvider;
