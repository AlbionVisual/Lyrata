import React from "react";
import {
  DatabaseDocument,
  DatabaseTextBlock,
  DocumentProperties,
} from "./DatabaseTypes";

interface Settings {
  current_document: [
    DatabaseDocument,
    React.Dispatch<React.SetStateAction<DatabaseDocument>>
  ];
}

interface ContextStorage {
  settings: Settings;
  document_list: [DatabaseDocument[], (new_val: DatabaseDocument[]) => void];
  documents_properties: [
    DocumentProperties[],
    React.Dispatch<React.SetStateAction<DocumentProperties[]>>
  ];
  current_text: [
    DatabaseTextBlock[],
    (new_offset: number, amount: number) => void
  ];
}

/**
 * Объявление контекста с значениями по умолчанию
 */
export const SSEContext = React.createContext<ContextStorage>({
  settings: { current_document: [[-1, "", "", "", "", -1], () => {}] },
  document_list: [[], () => {}],
  documents_properties: [[], () => {}],
  current_text: [[], () => {}],
});
