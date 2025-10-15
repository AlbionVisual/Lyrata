import React, { useCallback } from "react";
// import "./NumberSettingSelector.css";
import Menu from "./Menu";

interface NumberSettingSelectorProps {
  name: string;
  currenValue: number;
  setCurrentValue: (new_val: number) => void;
  tooltip?: string;
  minValue?: number;
  maxValue?: number;
  changeCoef?: number;
  changeValue?: number;
  isMultiply?: boolean;
  startId?: number;
  selectedId?: [number, React.Dispatch<React.SetStateAction<number>>];
}

function NumberSettingSelector({
  name,
  currenValue,
  setCurrentValue,
  tooltip,
  minValue = 0,
  maxValue = 100,
  changeCoef = 1.2,
  changeValue = 5,
  isMultiply = true,
  startId = 0,
  selectedId,
}: NumberSettingSelectorProps) {
  const handleSettingChange = useCallback(
    (id: number) => {
      if (id - startId === 0) {
        let new_val = Math.round(
          isMultiply ? currenValue * changeCoef : currenValue + changeValue
        );
        if (new_val > maxValue) new_val = maxValue;
        setCurrentValue(new_val);
      } else if (id - startId === 2) {
        let new_val = Math.round(
          isMultiply ? currenValue / changeCoef : currenValue - changeValue
        );
        if (new_val < minValue) new_val = minValue;
        setCurrentValue(new_val);
      }
    },
    [
      startId,
      changeCoef,
      changeValue,
      currenValue,
      isMultiply,
      maxValue,
      minValue,
      setCurrentValue,
    ]
  );

  return (
    <div className="NumberSettingSelector">
      <div className="SettingName">{name}</div>
      <div className="SettingList">
        <Menu
          selectionMoveType="indexed"
          selectedId={selectedId && selectedId[0]}
          onSelectionChange={selectedId && selectedId[1]}
          enableEvents={false}
          onItemActivate={handleSettingChange}
          menuPositions={[
            { id: startId, text: "Увеличить" },
            {
              id: startId + 1,
              text: <div title={tooltip}>{currenValue}</div>,
            },
            { id: startId + 2, text: "Уменьшить" },
          ]}></Menu>
      </div>
    </div>
  );
}

export default NumberSettingSelector;
