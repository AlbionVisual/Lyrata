import { useCallback, useState } from "react";
import "./App.css";
import MainMenu from "./pages/MainMenu";
import PageLayout from "./pages/PageLayout";
import ReadingPage from "./pages/ReadingPage";

const AvailableSelections = ["menu", "read", "text", "music", "settings"];

function App() {
  const [currentPage, setCurrentPage] = useState<number>(0); // menu, read, text, music, settings

  const handlePageChange = useCallback((id: string = "menu") => {
    const ind = AvailableSelections.findIndex((val) => val === id);
    if (ind !== -1) setCurrentPage(ind);
  }, []);

  return (
    <div className="App">
      {AvailableSelections[currentPage] === "menu" ? (
        <MainMenu onPageChange={handlePageChange}></MainMenu>
      ) : AvailableSelections[currentPage] === "read" ? (
        <PageLayout onGoBack={handlePageChange}>
          <ReadingPage></ReadingPage>
        </PageLayout>
      ) : AvailableSelections[currentPage] === "text" ? (
        <PageLayout onGoBack={handlePageChange}>Wow! New text?</PageLayout>
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
