import React from "react";
import {
  DatabaseDocument,
  DatabaseTextBlock,
  DocumentProperties,
} from "./DatabaseTypes";

interface Settings {
  current_document: [DatabaseDocument, (new_val: DatabaseDocument) => void];
  current_model_name: [number, (new_val: number) => void];
  current_result_getter_type: [string, (new_val: string) => void];
  current_smooth_type: [string, (new_val: string) => void];
  current_division_type: [string, (new_val: string) => void];
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
 * Объявление контекста со значениями по умолчанию
 */
export const SSEContext = React.createContext<ContextStorage>({
  settings: {
    current_document: [[-1, "", "", "", "", -1], () => {}],
    current_division_type: ["", () => {}],
    current_result_getter_type: ["", () => {}],
    current_model_name: [0, () => {}],
    current_smooth_type: ["", () => {}],
  },
  document_list: [[], () => {}],
  documents_properties: [[], () => {}],
  current_text: [[], () => {}],
});
