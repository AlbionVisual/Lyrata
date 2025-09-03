/**
 * Строка в базе данных, таблицы `documents`. `id`, `name`, `author`, `created_at`, `updated_at`
 */
export type DatabaseDocument = [number, string, string, string, string, number];

interface DatabaseTextPartDescription {
  id: number;
  positions: [number, number];
}

/**
 * Тип, для определения текстового запроса в базу данных
 */
export interface DatabaseText {
  text: string;
  parts: DatabaseTextPartDescription[];
}

/**
 * Тип-помощник для хранения локалько информации об активных документах
 */
export interface DocumentProperties {
  documentId: number;
  isAnalising: boolean;
}

/**
 * Строка в базе данных, таблицы `blocks`. `id`, `document_id`, `parent_id`, `order_in_parent`, `type`, `attrs_json`, `data_json`, `content_json`
 */
export type DatabaseTextBlock = [
  number,
  number,
  number,
  number,
  string,
  any,
  any,
  string
];
