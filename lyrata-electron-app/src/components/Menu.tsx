import { useState, useEffect, useCallback, useMemo } from "react";
import "./Menu.css";

interface MenuProps {
  menuPositions: { id: number; text: React.ReactNode }[];
  selectedId?: number;
  maxId?: number;
  onItemActivate?: (id: number) => void;
  onSelectionChange?: (id: number) => void;
  enableEvents?: boolean;
  useHigherIndexes?: boolean;
  selectionMoveType?: "indexed" | "elemented";
}

function Menu({
  menuPositions,
  onItemActivate,
  onSelectionChange,
  selectedId,
  maxId,
  enableEvents = true,
  selectionMoveType = "indexed",
  useHigherIndexes = false,
}: MenuProps) {
  const [locallySelectedId, setLocallySelectedId] = useState<number>(
    selectedId === undefined ? menuPositions[0].id : selectedId
  );

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableEvents) return;
      let buffSelection =
        selectedId !== undefined ? selectedId : locallySelectedId;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          if (selectionMoveType === "indexed") {
            let len = menuPositions[0].id;
            if (!maxId) {
              menuPositions.forEach((data) => {
                if (len < data.id) len = data.id;
              });
              len += 1;
            } else len = maxId + 1;
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
      setLocallySelectedId(buffSelection);
    },
    [
      locallySelectedId,
      menuPositions,
      enableEvents,
      maxId,
      onItemActivate,
      onSelectionChange,
      selectionMoveType,
      selectedId,
    ]
  );

  // Вешание ивентов на окно
  useEffect(() => {
    document.addEventListener("keydown", handelKeyDown);

    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  const real_selected = useMemo(() => {
    const selection = selectedId !== undefined ? selectedId : locallySelectedId;
    if (useHigherIndexes) {
      let last_id = menuPositions[0].id;
      menuPositions.forEach((data) => {
        if (last_id < data.id && data.id <= selection) last_id = data.id;
      });
      return last_id;
    } else return selection;
  }, [locallySelectedId, selectedId, menuPositions, useHigherIndexes]);

  return (
    <div className="Menu">
      {menuPositions.map((data, index) => (
        <div
          key={index}
          className={
            real_selected === data.id
              ? "MenuListItem MenuItemselected"
              : "MenuListItem MenuItemDeselected"
          }
          onClick={() => {
            if (onItemActivate) onItemActivate(data.id);
          }}
          onMouseEnter={(e) => {
            if (onSelectionChange) onSelectionChange(data.id);
            setLocallySelectedId(data.id);
          }}>
          {data.text}
        </div>
      ))}
    </div>
  );
}

export default Menu;
