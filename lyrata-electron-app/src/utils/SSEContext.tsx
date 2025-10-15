import React from "react";
import {
  DatabaseDocument,
  DatabaseTextBlock,
  DocumentProperties,
} from "./DatabaseTypes";

export interface Settings {
  current_model_name: [string, (new_val: string) => void];
  current_result_getter_type: [string, (new_val: string) => void];
  current_smooth_type: [string, (new_val: string) => void];
  current_division_type: [string, (new_val: string) => void];
  color_emotions: [boolean, (new_val: boolean) => void];
  text_selection_size: [number, (new_val: number) => void];
  text_selection_step: [number, (new_val: number) => void];
  encrypt_text: [boolean, (new_val: boolean) => void];
}

interface ContextStorage {
  settings: Settings;
  current_document: [DatabaseDocument, (new_val: DatabaseDocument) => void];
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
    current_division_type: ["", () => {}],
    current_result_getter_type: ["", () => {}],
    current_model_name: ["", () => {}],
    current_smooth_type: ["", () => {}],
    color_emotions: [false, () => {}],
    text_selection_size: [120, () => {}],
    text_selection_step: [100, () => {}],
    encrypt_text: [false, () => {}],
  },
  current_document: [[-1, "", "", "", "", -1], () => {}],
  document_list: [[], () => {}],
  documents_properties: [[], () => {}],
  current_text: [[], () => {}],
});
