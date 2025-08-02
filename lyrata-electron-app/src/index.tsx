import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./fonts/fonts.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

export interface settings {
  AvailableTextsNames?: string[];
  demoDeleted?: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string | null>;
    };
    appSettingsAPI: {
      getSettings: () => Promise<settings>;
      updateSettings: (newSettings: settings) => { success: boolean };
    };
    appFileAPI: {
      loadTextFile: (
        fileName: string
      ) => Promise<{ success: boolean; content?: string; error?: string }>;
      deleteTextFile: (
        fileName: string
      ) => Promise<{ success: boolean; error?: string }>;
      saveTextFile: (
        fileName: string,
        content: string
      ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
