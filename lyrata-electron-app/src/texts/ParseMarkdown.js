import { marked } from "marked";
// import { text_vanka } from "./vanka";

marked.use({
  extensions: [
    {
      name: "htmlComment",
      level: "block",
      start(src) {
        return src.match(/<!--/);
      },
      tokenizer(src, tokens) {
        const match = src.match(/^<!--([\s\S]*?)-->/);
        if (match) {
          return {
            type: "htmlComment",
            raw: match[0],
            text: match[1],
            tokens: [],
          };
        }
      },
      renderer(token) {
        return `<!--${token.text}-->`;
      },
    },
  ],
});

export default function parseMarkdown(text) {
  return marked.parse(text);
}
