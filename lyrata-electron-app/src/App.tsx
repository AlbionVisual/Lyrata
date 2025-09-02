import { useCallback, useState } from "react";
import "./App.css";
import MainMenu from "./pages/MainMenu";
import PageLayout from "./components/PageLayout";
import ReadingPage from "./pages/ReadingPage";
import TextSelectionPage from "./pages/TextSelectionPage";
import SSEContextProvider from "./utils/SSEContextProvider";

const AvailableSelections = ["menu", "read", "text", "music", "settings"];

function App() {
  const [currentPage, setCurrentPage] = useState<number>(0); // menu, read, text, music, settings
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
      <SSEContextProvider>
        {AvailableSelections[currentPage] === "menu" ? (
          <MainMenu onPageChange={handlePageChange}></MainMenu>
        ) : AvailableSelections[currentPage] === "read" ? (
          <PageLayout onGoBack={handlePageChange}>
            <ReadingPage></ReadingPage>
          </PageLayout>
        ) : AvailableSelections[currentPage] === "text" ? (
          <PageLayout onGoBack={handlePageChange}>
            <TextSelectionPage></TextSelectionPage>
          </PageLayout>
        ) : AvailableSelections[currentPage] === "music" ? (
          <PageLayout onGoBack={handlePageChange}>
            Эта сложная часть приложения пока в разработке...
          </PageLayout>
        ) : AvailableSelections[currentPage] === "settings" ? (
          <PageLayout onGoBack={handlePageChange}>
            Вы уже хотите изменений?! Но к сожалению настройки пока
            недоступны...
          </PageLayout>
        ) : (
          <PageLayout onGoBack={handlePageChange}>
            Ошибка... Этого не должно было произойти, но вы всё ещё можете
            вернуться на главную страницу
          </PageLayout>
        )}
      </SSEContextProvider>
    </div>
  );
}

export default App;
