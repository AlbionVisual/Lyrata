import DOMPurify from "dompurify";

const purifyConfigHard = {
  ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div"],
  ALLOWED_ATTR: ["style", "class", "lyrata"],
};

const blockElements = [
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "br",
];

const purifyConfig = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
  ALLOWED_ATTR: ["style", "class", "lyrata"],
  FORBID_TAGS: [
    "img",
    "table",
    "script",
    "iframe",
    "form",
    "input",
    "button",
    "a",
    "ul",
    "ol",
    "li",
  ],
};

export function sanitizeHTML(htmlToSanitize) {
  const sanitizedHtml = DOMPurify.sanitize(htmlToSanitize, purifyConfig);
  return sanitizedHtml;
}

export default function parseHTML(htmlString) {
  const parser = new DOMParser();
  const sanitizedHTML = sanitizeHTML(htmlString);
  const doc = parser.parseFromString(sanitizedHTML, "text/html");
  const body = doc.body;

  // Реккурсивная функция для извлечения чистого текста из ноды
  function getNodeText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    else if (node.nodeType === Node.ELEMENT_NODE) {
      let res = "";
      node.childNodes.forEach((subnode) => {
        res += getNodeText(subnode);
      });
      return res;
    } else return "";
  }

  // Обход тела текста
  let blockedData = [];
  body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const text = getNodeText(node);
      if (blockElements.includes(tagName)) {
        blockedData = blockedData.concat({ tagName: tagName, text: text });
      }
    } else return;
  });

  return blockedData;
}

export function HTMLToString(htmlString) {
  // Создаем экземпляр парсера
  const parser = new DOMParser();

  // Парсим HTML-строку
  const sanitizedHTML = sanitizeHTML(htmlString);
  const doc = parser.parseFromString(sanitizedHTML, "text/html");

  // Теперь doc - это объект Document, как если бы это была целая HTML-страница.
  const body = doc.body;
  let resultingString = "";

  // Функция для рекурсивного обхода DOM-дерева
  function traverseNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      resultingString += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      // Добавляем перенос строки для блочных элементов

      if (
        blockElements.includes(tagName) &&
        resultingString.length > 0 &&
        !resultingString.endsWith("\n")
      ) {
        resultingString += "\n";
      }

      // Рекурсивно обходим дочерние узлы
      node.childNodes.forEach(traverseNodes);

      // Добавляем перенос строки после блочных элементов (если это не <br>)
      if (
        blockElements.includes(tagName) &&
        tagName !== "br" &&
        resultingString.length > 0 &&
        !resultingString.endsWith("\n")
      ) {
        resultingString += "\n";
      }
    }
  }

  // Начинаем обход с дочерних узлов body
  body.childNodes.forEach(traverseNodes);

  // Очищаем лишние переносы строк
  // resultingString = resultingString.replace(/\n\s*\n/g, "\n").trim();

  return resultingString;
}
