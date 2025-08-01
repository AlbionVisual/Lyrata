import { useState, useEffect, useCallback } from "react";
import "./MainMenu.css";
import Menu from "./Menu";

const AvailableSelections = ["name", "read", "text", "music", "settings"];

interface MainMenuProps {
  onPageChange: (id: string | number) => void;
  currentTextName?: string;
}

function MainMenu({ onPageChange, currentTextName = "Ошибка" }: MainMenuProps) {
  const [selected, setSelected] = useState<number>(0); // name, read, text, music, settings

  const MenuPositions = [
    { id: 1, name: "read", text: `Читать (${currentTextName})` },
    { id: 2, name: "text", text: "Новый текст" },
    { id: 3, name: "music", text: "Новая музыка" },
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
        onItemActivate={onPageChange}
        menuPositions={MenuPositions}
        onSelectionChange={setSelected}></Menu>
    </div>
  );
}

export default MainMenu;
