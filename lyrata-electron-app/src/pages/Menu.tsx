import Reac, { useState, useEffect, useCallback, useRef } from "react";
import "./Menu.css";

interface MenuProps {
  menuPositions: { id: number; text: string | React.ReactNode }[];
  selectedId?: number;
  onItemActivate?: (id: number) => void;
  onSelectionChange?: (id: number) => void;
  enableEvents?: boolean;
}

function Menu({
  onItemActivate,
  menuPositions,
  onSelectionChange,
  selectedId = 0,
  enableEvents = true,
}: MenuProps) {
  const [locallySelectedId, setLocallySelectedId] = useState<number>(0);

  const handelKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableEvents) return;
      let buffSelection = locallySelectedId;
      let len = menuPositions[0].id;
      menuPositions.forEach((data) => {
        if (len < data.id) len = data.id;
      });
      len += 1;

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
          event.preventDefault();
          if (onItemActivate) onItemActivate(locallySelectedId);
          return;
      }
      setLocallySelectedId(buffSelection);
      if (onSelectionChange) onSelectionChange(buffSelection);
    },
    [locallySelectedId, menuPositions]
  );

  useEffect(() => {
    document.addEventListener("keydown", handelKeyDown);
    return () => {
      document.removeEventListener("keydown", handelKeyDown);
    };
  }, [handelKeyDown]);

  useEffect(() => {
    setLocallySelectedId(selectedId);
  }, [selectedId]);

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
            setLocallySelectedId(data.id);
            if (onSelectionChange) onSelectionChange(data.id);
          }}>
          {data.text}
        </div>
      ))}
    </div>
  );
}

export default Menu;
