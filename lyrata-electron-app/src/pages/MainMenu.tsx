import { useState, useEffect, useCallback } from "react";
import "./MainMenu.css";

const AvailableSelections = ["name", "read", "text", "music", "settings"];

interface MainMenuProps {
  onPageChange: (id: string) => void;
}

function MainMenu({ onPageChange }: MainMenuProps) {
  const [selected, setSelected] = useState<number>(0); // name, read, text, music, settings

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      let buffSelection = selected;
      const len = AvailableSelections.length;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          buffSelection =
            buffSelection + 1 >= len ? buffSelection : buffSelection + 1;
          event.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          buffSelection =
            buffSelection - 1 < 0 ? buffSelection : buffSelection - 1;
          event.preventDefault();
          break;
        case "Enter":
          if (AvailableSelections[selected] === "name") return;
          event.preventDefault();
          onPageChange(AvailableSelections[selected]);
          return;
      }

      setSelected(buffSelection);
    },
    [selected]
  );

  useEffect(() => {
    document.addEventListener("keydown", handelKeyDown);
    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

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
      <div
        className={
          AvailableSelections[selected] === "read"
            ? "MenuListItem MenuItemSelected"
            : "MenuListItem MenuItemDeselected"
        }
        onClick={() => onPageChange("read")}
        onMouseEnter={(e) => {
          setSelected(1);
        }}>
        Читать (Демо)
      </div>
      <div
        className={
          AvailableSelections[selected] === "text"
            ? "MenuListItem MenuItemSelected"
            : "MenuListItem MenuItemDeselected"
        }
        onClick={() => onPageChange("text")}
        onMouseEnter={(e) => {
          setSelected(2);
        }}>
        Новый текст
      </div>
      <div
        className={
          AvailableSelections[selected] === "music"
            ? "MenuListItem MenuItemSelected"
            : "MenuListItem MenuItemDeselected"
        }
        onClick={() => onPageChange("music")}
        onMouseEnter={(e) => {
          setSelected(3);
        }}>
        Новая музыка
      </div>
      <div
        className={
          AvailableSelections[selected] === "settings"
            ? "MenuListItem MenuItemSelected"
            : "MenuListItem MenuItemDeselected"
        }
        onClick={() => onPageChange("settings")}
        onMouseEnter={(e) => {
          setSelected(4);
        }}>
        Настройки
      </div>
    </div>
  );
}

export default MainMenu;
