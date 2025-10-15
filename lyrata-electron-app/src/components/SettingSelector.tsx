import React, { useCallback } from "react";
import "./SettingSelector.css";
import Menu from "./Menu";

export interface SettingValue {
  visible_name: React.ReactNode;
  actual_value: any;
  tooltip?: string;
}

interface SettingSelectorProps {
  name: string;
  values: SettingValue[];
  selected: any;
  setSelected: (new_val: any) => void;
  startId?: number;
  selectedId?: [number, React.Dispatch<React.SetStateAction<number>>];
}

function SettingSelector({
  name,
  values,
  selected,
  setSelected,
  startId = 0,
  selectedId,
}: SettingSelectorProps) {
  const handleSettingChange = useCallback(
    (id: number) => {
      setSelected(values[id - startId].actual_value);
    },
    [setSelected, values, startId]
  );

  return (
    <div className="SettingSelector">
      <div className="SettingName">{name}</div>
      <div className="SettingList">
        <Menu
          selectionMoveType="indexed"
          selectedId={selectedId && selectedId[0]}
          onSelectionChange={selectedId && selectedId[1]}
          enableEvents={false}
          onItemActivate={handleSettingChange}
          menuPositions={values.map((el, ind) => {
            return {
              id: ind + startId,
              text:
                selected === el.actual_value ? (
                  <b title={el.tooltip}>{el.visible_name}</b>
                ) : (
                  <div title={el.tooltip}>{el.visible_name}</div>
                ),
            };
          })}></Menu>
      </div>
    </div>
  );
}

export default SettingSelector;
