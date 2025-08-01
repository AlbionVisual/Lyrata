import { useCallback, useState } from "react";
import "./App.css";
import MainMenu from "./pages/MainMenu";
import PageLayout from "./pages/PageLayout";
import ReadingPage from "./pages/ReadingPage";
import TextSelectionPage, {
  ReadingText,
  AvailableTexts,
} from "./pages/TextSelectionPage";

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string | null>;
    };
  }
}

const AvailableSelections = ["menu", "read", "text", "music", "settings"];

function App() {
  const [currentPage, setCurrentPage] = useState<number>(0); // menu, read, text, music, settings
  const [currentText, setCurrentText] = useState<ReadingText | undefined>(
    AvailableTexts[0]
  );

  const handlePageChange = useCallback((id: string | number = "menu") => {
    if (typeof id === "number") {
      if (id < AvailableSelections.length) setCurrentPage(id);
      return;
    }
    const ind = AvailableSelections.findIndex((val) => val === id);
    if (ind !== -1) setCurrentPage(ind);
  }, []);

  return (
    <div className="App">
      {AvailableSelections[currentPage] === "menu" ? (
        <MainMenu
          onPageChange={handlePageChange}
          currentTextName={currentText?.name}></MainMenu>
      ) : AvailableSelections[currentPage] === "read" ? (
        <PageLayout onGoBack={handlePageChange}>
          <ReadingPage
            currentText={
              currentText
                ? currentText
                : { name: "Ошибка", text: "Сначала выберите текст для чтения" }
            }></ReadingPage>
        </PageLayout>
      ) : AvailableSelections[currentPage] === "text" ? (
        <PageLayout onGoBack={handlePageChange}>
          <TextSelectionPage
            changeCurrentText={setCurrentText}
            currentText={currentText}></TextSelectionPage>
        </PageLayout>
      ) : AvailableSelections[currentPage] === "music" ? (
        <PageLayout onGoBack={handlePageChange}>
          Better preferences in music?
        </PageLayout>
      ) : AvailableSelections[currentPage] === "settings" ? (
        <PageLayout onGoBack={handlePageChange}>
          You want some changes?!
        </PageLayout>
      ) : (
        <PageLayout onGoBack={handlePageChange}>
          Sth went wrong, go back
        </PageLayout>
      )}
    </div>
  );
}

export default App;
