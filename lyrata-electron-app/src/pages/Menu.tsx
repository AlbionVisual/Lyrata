import { useState, useEffect, useCallback } from "react";
import "./Menu.css";

interface MenuProps {
  menuPositions: { id: number; text: string | React.ReactNode }[];
  selectedId?: number;
  onItemActivate?: (id: number) => void;
  onSelectionChange?: (id: number) => void;
  enableEvents?: boolean;
  selectionMoveType?: "indexed" | "elemented";
}

function Menu({
  menuPositions,
  onItemActivate,
  onSelectionChange,
  selectedId = 0,
  enableEvents = true,
  selectionMoveType = "indexed",
}: MenuProps) {
  const [locallySelectedId, setLocallySelectedId] =
    useState<number>(selectedId);

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableEvents) return;
      let buffSelection = locallySelectedId;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          if (selectionMoveType === "indexed") {
            let len = menuPositions[0].id;
            menuPositions.forEach((data) => {
              if (len < data.id) len = data.id;
            });
            len += 1;
            buffSelection =
              buffSelection + 1 >= len ? buffSelection : buffSelection + 1;
          } else {
            const current_ind = menuPositions.findIndex(
              (el) => el.id === buffSelection
            );
            buffSelection =
              current_ind < menuPositions.length - 1
                ? menuPositions[current_ind + 1].id
                : menuPositions[menuPositions.length - 1].id;
          }
          // event.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          if (selectionMoveType === "indexed") {
            buffSelection =
              buffSelection - 1 < 0 ? buffSelection : buffSelection - 1;
          } else {
            const current_ind = menuPositions.findIndex(
              (el) => el.id === buffSelection
            );
            buffSelection =
              current_ind > 0
                ? menuPositions[current_ind - 1].id
                : menuPositions[0].id;
          }
          // event.preventDefault();
          break;
        case "Enter":
          // event.preventDefault();
          if (onItemActivate) onItemActivate(locallySelectedId);
          return;
      }
      if (onSelectionChange) onSelectionChange(buffSelection);
      else setLocallySelectedId(buffSelection);
    },
    [locallySelectedId, menuPositions]
  );

  // Вешание ивентов на окно
  useEffect(() => {
    document.addEventListener("keydown", handelKeyDown);

    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  return (
    <div className="Menu">
      {menuPositions.map((data, index) => (
        <div
          key={index}
          className={
            locallySelectedId === data.id
              ? "MenuListItem MenuItemselected"
              : "MenuListItem MenuItemDeselected"
          }
          onClick={() => {
            if (onItemActivate) onItemActivate(data.id);
          }}
          onMouseEnter={(e) => {
            if (onSelectionChange) onSelectionChange(data.id);
            else setLocallySelectedId(data.id);
          }}>
          {data.text}
        </div>
      ))}
    </div>
  );
}

export default Menu;
