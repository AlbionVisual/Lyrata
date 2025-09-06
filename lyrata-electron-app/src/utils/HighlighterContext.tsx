import React from "react";

interface HighlighterStorage {
  startPos: number;
  endPos: number;
  updatePosFunc: (selectionPos: HTMLDivElement) => void;
}

export const HighlighterContext = React.createContext<HighlighterStorage>({
  startPos: 0,
  endPos: 10,
  updatePosFunc: (selectionPos) => {},
});
