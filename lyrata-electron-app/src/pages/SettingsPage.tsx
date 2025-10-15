import React, { useContext, useMemo, useState } from "react";
import "./SettingsPage.css";
import { SSEContext } from "../utils/SSEContext";
import Menu from "../components/Menu";
import SettingSelector, { SettingValue } from "../components/SettingSelector";
import NumberSettingSelector from "../components/NumberSettingSelector";

interface SettingSelectorDescription {
  id: number;
  name: string;
  values: SettingValue[];
  selected: [any, any];
}

interface NumberSettingSelectorDescription {
  id: number;
  name: string;
  value: [any, any];
  tooltip: string;
  minValue?: number;
  maxValue?: number;
  changeCoef?: number;
  isMultiply?: boolean;
  changeValue?: number;
}

const MODELS: SettingValue[] = [
  {
    actual_value: "Kostya165/rubert_emotion_slicer",
    visible_name: "Kostya165",
    tooltip:
      "Классификатор текстов на основе RuBERT, определяющий 5 эмоций (обучен на комментариях под постами): aggression, anxiety, positive, sarcasm, negative",
  },
  {
    actual_value: "cointegrated/rubert-tiny2-cedr-emotion-detection",
    visible_name: "cointegrated",
    tooltip:
      "Классификатор текстов на основе RuBERT, подвид Tiny. Определяет 5 эмоций, а также их отсутствие: no_emotion, joy, sadness, surprise, fear, anger",
  },
  {
    actual_value: "blanchefort/rubert-base-cased-sentiment",
    visible_name: "blanchefort",
    tooltip:
      "Стандартный классификатор текстов на основе RuBERT, определяющий положительность текстов. Возвращает: positive, neutral, negative",
  },
];

const DIVIDERS: SettingValue[] = [
  {
    actual_value: "sentence",
    visible_name: "По предложениям",
    tooltip:
      "Перед анализом нейронной сети текст будет делиться по предложениям и абзацам. Для этого будет подключена дополнительная нейронная сеть",
  },
  {
    actual_value: "paragraph",
    visible_name: "По абзацам",
    tooltip: "Текст будет делиться по абзацам перед анализом",
  },
  {
    actual_value: "tokened",
    visible_name: "По токенам",
    tooltip:
      'Текст будет делиться в зависимости от "токенов" (мельчайшая часть текста, понимаемая нейросетью) выбранной нейросети',
  },
];

const EMOTION_HIHGLIGHTER: SettingValue[] = [
  {
    actual_value: true,
    visible_name: "Включить",
    tooltip:
      "При чтении все, кроме выделенного куска, части будут подсвечены разными цветами в зависимости от эмоций: ",
  },
  {
    actual_value: false,
    visible_name: "Выключить",
  },
];

const SIGNS_GETTER: SettingValue[] = [
  {
    actual_value: "weighted",
    visible_name: "Взвешенный",
    tooltip:
      "Пересекаемые результаты работы нейронной сети будут преобразованы алгоритмом учитывающим, что ответ актуальнее в центре спрашиваемого текста. Несколько ответов одной и той же части складываются в зависимости от расстояния до центра запроса",
  },
  {
    actual_value: "average",
    visible_name: "Усреднённый",
    tooltip:
      "Все пересекаемые результаты работы нейронной сети будут усреднены для каждого из кусочков текста",
  },
];

const SMOOTHER: SettingValue[] = [
  {
    actual_value: "direct",
    visible_name: "Прямолинейный",
    tooltip:
      "Алгоритм просто смотрит на величину перепадов эмоций между двумя частями текста, и если она больше какого-то значения, то выставляется точка изменения",
  },
  {
    actual_value: "distanced",
    visible_name: "Косинусное расстояние",
    tooltip:
      "Алгоритм считает расстояние при помощи математической функции и на основе неё делает вывод о наличии изменения эмоции между двумя частями текста",
  },
];

const ENCRYPTOR: SettingValue[] = [
  {
    actual_value: true,
    visible_name: "Включить",
    tooltip:
      'Буквы в тексте спереди будут заменены с сохранением глассности звуков, т. о. "а" заменится на случайную глассную, которая может оказаться и самой буквой "а", но точно не сможет поменяться на согласную',
  },
  {
    actual_value: false,
    visible_name: "Выключить",
  },
];

function SettingsPage() {
  const storage = useContext(SSEContext);
  const [selected, setSelected] = useState(0);

  const setting_list: (
    | SettingSelectorDescription
    | NumberSettingSelectorDescription
  )[] = useMemo(
    () => [
      {
        id: 1,
        name: "Какую нейронную сеть вы хотите использовать для анализа?",
        values: MODELS,
        selected: storage.settings.current_model_name,
      },
      {
        id: 4,
        name: "Как будет делиться текст при анализе?",
        values: DIVIDERS,
        selected: storage.settings.current_division_type,
      },
      {
        id: 7,
        name: "Расскрашивать ли проанализированный текст?",
        values: EMOTION_HIHGLIGHTER,
        selected: storage.settings.color_emotions,
      },
      {
        id: 9,
        name: "Алгоритм извлечения признаков",
        values: SIGNS_GETTER,
        selected: storage.settings.current_result_getter_type,
      },
      {
        id: 11,
        name: "Алгоритм сглаживания",
        values: SMOOTHER,
        selected: storage.settings.current_smooth_type,
      },
      {
        id: 13,
        name: "Какого размера вы хотите выделение в тексте?",
        value: storage.settings.text_selection_size,
        tooltip:
          "Размер выделения при чтении текста в количестве символов. К этому значению будет стремится реальное выделение, которое будет увеличиваться, чтобы взять полностью наполовину выделенные слова",
        maxValue: 1024,
        minValue: 10,
      },
      {
        id: 16,
        name: "Насколько далеко вы хотите смещать выделение текста?",
        value: storage.settings.text_selection_step,
        tooltip:
          "На сколько символов перемещать выделение вперёд? Как и в настройке выше, к этому значению реальное выделение будет лишь стремиться",
        minValue: 5,
        maxValue: 1019,
      },
      {
        id: 19,
        name: '"Шифрование" текста (антиспойлер)',
        values: ENCRYPTOR,
        selected: storage.settings.encrypt_text,
      },
    ],
    [storage]
  );

  const maxId = useMemo(() => {
    let last_setting = setting_list[setting_list.length - 1];
    let maxIde = last_setting.id;
    if ("values" in last_setting) {
      last_setting = last_setting as SettingSelectorDescription;
      return maxIde + last_setting.values.length - 1;
    } else {
      return maxIde + 2;
    }
  }, [setting_list]);

  return (
    <div className="SettingsPage">
      <Menu
        maxId={maxId}
        selectedId={selected}
        useHigherIndexes={true}
        onSelectionChange={setSelected}
        menuPositions={[
          { id: 0, text: <h2>Что-то хотите изменить?</h2> },
          ...setting_list.map((el) => {
            return {
              id: el.id,
              text:
                "values" in el ? (
                  <SettingSelector
                    name={el.name}
                    values={el.values}
                    selectedId={[selected, setSelected]}
                    startId={el.id}
                    setSelected={el.selected[1]}
                    selected={el.selected[0]}></SettingSelector>
                ) : (
                  <NumberSettingSelector
                    name={el.name}
                    currenValue={el.value[0]}
                    setCurrentValue={el.value[1]}
                    tooltip={el.tooltip}
                    minValue={el.minValue}
                    maxValue={el.maxValue}
                    changeCoef={el.changeCoef}
                    changeValue={el.changeValue}
                    isMultiply={el.isMultiply ? el.isMultiply : undefined}
                    startId={el.id}
                    selectedId={[
                      selected,
                      setSelected,
                    ]}></NumberSettingSelector>
                ),
            };
          }),
        ]}></Menu>
    </div>
  );
}

export default SettingsPage;
