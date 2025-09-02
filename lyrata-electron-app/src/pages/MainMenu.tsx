import { useContext, useMemo, useState } from "react";
import "./MainMenu.css";
import Menu from "./Menu";
import { SSEContext } from "../utils/SSEContext";
import { text } from "stream/consumers";

const AvailableSelections = ["name", "read", "text", "music", "settings"];

interface MainMenuProps {
  onPageChange: (id: string | number) => void;
}

function MainMenu({ onPageChange }: MainMenuProps) {
  const [selected, setSelected] = useState<number>(0); // name, read, text, music, settings

  const storage = useContext(SSEContext);

  const isTextChoosed = useMemo<Boolean>(
    () => storage.settings.current_document[0][0] !== -1,
    [storage.settings.current_document[0]]
  );

  const MenuPositions = [
    {
      id: 1,
      name: "read",
      text: isTextChoosed ? (
        `Читать (${storage.settings.current_document[0][1]})`
      ) : (
        <i>Для чтения выберите текст...</i>
      ),
    },
    { id: 2, name: "text", text: "Выбор текста" },
    { id: 3, name: "music", text: "Выбор музыки" },
    { id: 4, name: "settings", text: "Настройки" },
  ];

  return (
    <div className="MainMenu">
      <div
        className={
          AvailableSelections[selected] === "name"
            ? "AppName MenuItemSelected"
            : "AppName MenuItemDeselected"
        }
        onMouseEnter={(e) => {
          setSelected(0);
        }}>
        <div className="AppNameText">Lyrata</div>
        <div className="AppNameLabel">
          Читайте не только <b>под</b> свою любимую музыку, но ещё и синхронно с
          ней
        </div>
      </div>
      <Menu
        selectedId={selected}
        key={selected}
        onItemActivate={(newPage: number) => {
          if (!isTextChoosed && newPage === 1) return;
          onPageChange(newPage);
        }}
        menuPositions={MenuPositions}
        onSelectionChange={setSelected}></Menu>
    </div>
  );
}

export default MainMenu;
