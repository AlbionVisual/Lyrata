# React Cheetsheet

## Содержание

1. [Что как делать по этапам?](#что-как-делать-по-этапам-возможно-потребует-редактирования)
2. [Как выглядит отдельный компонент React-а и какова его структура и возможности](#как-в-общем-выглядит-отдельный-компонент-react-а-и-каковы-его-структура-и-возможности)
3. [Встраивание Typescript](#встраивание-typescript)
   1. [Настройка проекта](#1-настройка-проекта)
   2. [Базовые типы Typescript](#2-базовые-типы-typescript)
   3. [Типизация компонентов](#3-типизация-компонентов)
   4. [Типизация состояния UseState-hook](#4-типизация-состояния-usestate-hook)
   5. [Типизация обработчиков событий (Event handlers)](#5-типизация-обработчиков-событий-event-handlers)
   6. [Типизация ссылок refs](#6-типизация-ссылок-refs)
   7. [Распространённый типы JSX и React](#7-распространенные-типы-jsx-и-react)
   8. [Советы и лучшие практики](#8-советы-и-лучшие-практики)
4. [Подробное описание технологий, которые нам придётся использовать, с примерами](#подробное-описание-технологий-которые-нам-придётся-использовать-с-примерами)
   1. [Функциональные компоненты](#функциональные-компоненты)
   2. [JSX (JavaScript XML)](#jsx-javascript-xml)
   3. [useState Hook](#usestate-hook)
   4. [Conditional Rendering (Условный рендеринг)](#conditional-rendering-условный-рендеринг)
   5. [List Rendering (Рендеринг списков)](#list-rendering-рендеринг-списков)
   6. [useEffect Hook](#useeffect-hook)
   7. [Event Handling (Обработка событий)](#event-handling-обработка-событий)
   8. [HTTP-клиент (запросы на бэк)](#http-клиент-запросы-на-бэк)
5. [React в общем](#react-в-общем)
   1. [Как выглядит Workflow на React-е](#как-выглядит-workflow-на-react-е)
   2. [Как программист добавляет элементы, файлы, компоненты, как кастомизирует их](#как-программист-добавляет-элементы-файлы-компоненты-как-кастомизирует-их)
   3. [В чём преимущество React перед всеми остальными](#в-чём-преимущество-react-перед-всеми-остальными)

## Что как делать по этапам? (возможно потребует редактирования)

### Начало

1. Переходим в `frontend` папочку и запускаем сервер посредством `npm start` (после запуска должна открыться страница с нашим приложением, обычно это `http://localhost:3000/`)
2. Заходим в `src` - наш основной каталог для работы. Тут мы можем спокойно изменять `App.js`, `App.css`, а также добавлять свои файлы и папки
3. Собираемся создать новый тип компонента? - создаём папку (например `pages`)

### Создание нового компонента

#### 1. Создание нового файла

(например `src/pages/ChooseChatPage.js`), если нужны стили, то можно дополнительно добавить .css файл с таким же названием и путём, а в js-файл добавить `import "./ChooseChatPage.css";` в начале.

#### 2. Наполнение файла

В этом .md файле есть куча примеров, каждый из которых можно использовать в качестве шаблона. Хорошим правилом будет создание компонента с названием совпадающим с названием файла. В общем случае код будет как минимум такой:

```jsx
import React from "react";

function ChooseChatPage(props) {
  return <div className="chat-list"></div>;
}

export default ChooseChatPage;
```

Чтобы отобразить новый компонент в приложении, нужно добавить его в один из уже отрисовывающихся компонентов, либо в `App.js`:

```jsx
import "./App.css";
import ChooseChatPage from "./pages/ChooseChatPage.js";

function App() {
  return (
    <div className="App">
      <ChooseChatPage></ChooseChatPage>
    </div>
  );
}

export default App;
```

Наш компонент ничего не рисует, поэтому его не будет сразу видно на экране. Чтобы его увидеть можно открыть панель разработчика (нажать `F12`) и перейти во вкладку `Elements` - тут будет видна вся наша структура.

#### 3. Добавление элементов

Элементы добавляются как обычный html. К примеру я нарисую кнопку и заголовок к ней:

```jsx
import React from "react";

function ChooseChatPage(props) {
  return (
    <div className="chat-list">
      <h3>Заголовок</h3>
      <button onClick={() => alert("Yay)")}>CLiiiick meeee!</button>
    </div>
  );
}

export default ChooseChatPage;
```

Как только этот файл сохранить, изменения сразу отрисуются на странице, которая открылась при старте сервера.

#### 4. Использование технологий `React`-а

Я хочу сделать список таких заголовков и кнопок. Для этого переходим в соответствующий раздел (List Rendering (Рендеринг списков)) и смотрим как это делается:

```jsx
messages.map((msg) => (
  // key должен быть уникальным для каждого элемента в списке
  // Обычно это ID записи из базы данных
  <div key={msg.id} className={`message ${msg.sender}`}>
    <strong>{msg.sender === "user" ? "Вы" : "AI"}:</strong> {msg.content}
  </div>
));
```

Обёртываем наш код по такой же технологии:

```jsx
import React from "react";

function ChooseChatPage(props) {
  const lst = [1, 2, 3];

  return (
    <div className="chat-list">
      {lst.map((key) =>
          <div key={key}>
              <h3>Заголовок {key}</h3>
              <button onClick={() => alert("Yay)")}>CLiiiick meeee!</button>
          </div>
        );
      }
    </div>
  );
}

export default ChooseChatPage;
```

Теперь я хочу их выбирать и повесить ивенты. Смотрим "`useState` Hook", "Conditional Rendering (Условный рендеринг)" и "Event Handling (Обработка событий)". Придумываем как это использовать и вставляем:

```jsx
import React, { useState } from "react";

function ChooseChatPage(props) {
  const [chosenChat, setChosenChat] = useState(null);
  const [chatList, setChatList] = useState([1, 2, 4]);

  return (
    <div className="chat-list">
      {chatList.map((key) => {
        return (
          <div key={key}>
            {key == chosenChat ? (
              <h1>Элемент списка: {key}</h1>
            ) : (
              <h3>Элемент списка: {key}</h3>
            )}
            <button onClick={() => setChosenChat(key)}>Сделать активным</button>
            <br></br>
          </div>
        );
      })}
    </div>
  );
}

export default ChooseChatPage;
```

### Встраивание Typescript

TypeScript (TS) в комбинации с React значительно улучшает процесс разработки, делая код более надежным, читаемым и удобным в поддержке. Он добавляет статическую типизацию в JavaScript, что позволяет обнаруживать ошибки на этапе компиляции, а не в рантайме.

Вот подробный обзор TypeScript в сочетании с React:

#### 1. Настройка проекта

**Создание нового проекта:**
Самый простой способ начать — использовать Create React App или Vite с шаблоном TypeScript:

- **Create React App:**
  ```bash
  npx create-react-app my-app --template typescript
  cd my-app
  npm start
  ```

#### 2. Базовые типы TypeScript

- **Примитивы:** `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.
- **Массивы:** `number[]` или `Array<number>`.
- **Объекты:** Определяются с помощью `interface` или `type`.
- **Union Types:** `string | number` (значение может быть строкой или числом).
- **Literal Types:** `("success" | "error")` (значение может быть только "success" или "error").
- **Interfaces vs. Types:**
  - `interface` лучше подходит для определения формы объектов и классов, поддерживает "declaration merging" и `extends`.
  - `type` более гибок, может использоваться для псевдонимов примитивов, объединений, пересечений и кортежей.

#### 3. Типизация компонентов

**Определение пропсов:**
Используйте `interface` или `type` для описания ожидаемых пропсов компонента.

```typescript
// Option 1: Using an interface
interface MyComponentProps {
  name: string;
  age: number;
  isStudent?: boolean;
}

const MyComponent = ({ name, age, isStudent }: MyComponentProps) => {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      {isStudent && <p>Student</p>}
    </div>
  );
};

// Option 2: Using a type alias (аналогично)
type MyOtherComponentProps = {
  title: string;
  count: number;
};

const MyOtherComponent = ({ title, count }: MyOtherComponentProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>Count: {count}</p>
    </div>
  );
};
```

**Пропс `children`:**
Если ваш компонент принимает `children`, вы можете типизировать его с помощью `React.ReactNode`.

```typescript
import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card = ({ title, children }: CardProps) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
};
```

Предпочтительный способ (если `children` не нужен или явно типизирован):

```typescript
interface GreetingProps {
  message: string;
}

const Greeting = ({ message }: GreetingProps) => {
  return <h1>{message}</h1>;
};
```

#### 4. Типизация состояния (useState Hook)

TypeScript обычно хорошо выводит тип состояния из начального значения.

```typescript
import React, { useState } from "react";

const MyCounter = () => {
  const [count, setCount] = useState(0); // count: number, setCount: React.Dispatch<React.SetStateAction<number>>

  const [name, setName] = useState(""); // name: string, setName: React.Dispatch<React.SetStateAction<string>>

  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  // user: { id: number; name: string } | null
  // setUser: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>

  // Явное указание типа, если начальное значение не дает достаточной информации
  const [items, setItems] = useState<string[]>([]); // items: string[]

  const fetchUser = async () => {
    const response = await fetch("/api/user");
    const data = await response.json();
    setUser(data);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Name: {name}</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {user ? <p>User: {user.name}</p> : <p>No user</p>}
      <button onClick={fetchUser}>Fetch User</button>
    </div>
  );
};
```

#### 5. Типизация обработчиков событий (Event Handlers)

React предоставляет синтетические события, которые являются обертками над нативными событиями браузера. TypeScript имеет встроенные типы для этих событий.

```typescript
import React from "react";

const EventExample = () => {
  // Типизация события клика (например, для кнопки)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked!", event.currentTarget);
  };

  // Типизация события изменения (например, для input)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input value:", event.target.value);
  };

  // Типизация события отправки формы
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    console.log("Form submitted!");
  };

  // Типизация события клавиатуры
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("Enter pressed!", event.currentTarget.value);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button onClick={handleClick}>Click Me</button>
      <input type="text" onChange={handleChange} placeholder="Type something" />
      <input
        type="text"
        onKeyPress={handleKeyPress}
        placeholder="Press Enter"
      />
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

Если TypeScript может вывести тип события (например, для инлайн-обработчиков), явное указание типа не всегда требуется. Однако для именованных функций-обработчиков это хорошая практика.

#### 6. Типизация ссылок (Refs)

Хук `useRef` используется для доступа к DOM-элементам или для хранения изменяемых значений, которые не вызывают повторный рендеринг.

**Доступ к DOM-элементам:**

```typescript
import React, { useRef, useEffect } from "react";

const MyInput = () => {
  // Типизация ref для HTMLInputElement. Изначально ref.current будет null.
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Проверяем, что ref.current существует, прежде чем использовать его
    if (inputRef.current) {
      inputRef.current.focus(); // Фокусируем инпут при монтировании компонента
    }
  }, []);

  return <input ref={inputRef} type="text" placeholder="I will be focused" />;
};
```

**Хранение изменяемых значений:**

```typescript
import React, { useRef, useState } from "react";

const ClickCounter = () => {
  // Ref для хранения количества кликов, не вызывая ререндер
  const clickCountRef = useRef(0); // clickCountRef.current: number

  const [renderCount, setRenderCount] = useState(0); // Для демонстрации ререндера

  const handleClick = () => {
    clickCountRef.current++; // Изменяем значение ref
    console.log("Total clicks (via ref):", clickCountRef.current);
    setRenderCount((prev) => prev + 1); // Вызываем ререндер для обновления UI
  };

  return (
    <div>
      <button onClick={handleClick}>Click Me</button>
      <p>Component has re-rendered {renderCount} times.</p>
      {/* Значение ref не отображается напрямую, так как оно не вызывает ререндер */}
      <p>Check console for total clicks via ref.</p>
    </div>
  );
};
```

#### 7. Распространенные типы JSX и React

При работе с JSX в TypeScript вы столкнетесь с несколькими важными типами:

- **`React.ReactNode`:**

  - **Что это:** Это самый общий тип, который может быть чем угодно, что React может отобразить. Он включает: JSX-элементы (`<div />`), строки (`"Hello"`), числа (`123`), булевы значения (`true`/`false`), `null`, `undefined`, фрагменты (`<>...</>`), порталы, а также массивы из всех этих типов.
  - **Когда использовать:** Идеально подходит для типизации пропса `children` или любого другого пропса, который может принимать различное содержимое для рендеринга.
  - **Пример:**

    ```typescript
    interface ContainerProps {
      header: React.ReactNode; // Может быть строкой, элементом, или ничем
      children: React.ReactNode; // Может быть любым содержимым
      footer?: React.ReactNode; // Опциональный футер
    }

    const Container = ({ header, children, footer }: ContainerProps) => (
      <div>
        <div className="header">{header}</div>
        <main>{children}</main>
        {footer && <div className="footer">{footer}</div>}
      </div>
    );

    // Использование:
    <Container header={<h2>My Title</h2>}>
      <p>Some content.</p>
      <p>More content.</p>
    </Container>

    <Container header="Simple Header">
      <span>Just a span.</span>
    </Container>
    ```

- **`React.ComponentProps<typeof MyComponent>` или `<'div'>`:**

  - **Что это:** Утилитарный тип, который позволяет получить типы пропсов существующего компонента или встроенного HTML-элемента.
  - **Когда использовать:** Полезно для переиспользования типов пропсов или для создания оберток, которые передают все пропсы дочернему компоненту.
  - **Пример:**

    ```typescript
    import React from "react";

    interface CustomButtonProps {
      label: string;
      onClick: () => void;
    }

    const CustomButton = ({ label, onClick }: CustomButtonProps) => (
      <button onClick={onClick}>{label}</button>
    );

    // Получаем типы пропсов CustomButton
    type InheritedButtonProps = React.ComponentProps<typeof CustomButton>;

    // Или для стандартного HTML-элемента
    type DivProps = React.ComponentProps<"div">;

    const SpecialDiv = (props: DivProps) => (
      <div {...props} style={{ border: "1px solid black", padding: "10px" }}>
        {props.children}
      </div>
    );

    // Использование:
    <SpecialDiv id="my-id" className="my-class">
      This is a special div.
    </SpecialDiv>;
    ```

#### 8. Советы и лучшие практики

- **Включайте `strict` mode:** Установите `strict: true` в вашем `tsconfig.json`. Это включает все строгие проверки типов и значительно повышает надежность вашего кода.
- **Избегайте `any`:** По возможности избегайте использования типа `any`. `any` отключает все проверки типов для переменной, что сводит на нет преимущества TypeScript.
- **Используйте `interface` или `type` для пропсов и состояния:** Всегда явно определяйте типы для пропсов и состояния ваших компонентов.
- **Generics (Обобщения):** Используйте обобщения для создания переиспользуемых компонентов или хуков, которые могут работать с разными типами данных, сохраняя при этом типобезопасность.
- **Осторожное использование утверждений типа (`as`):** Используйте `as` (type assertion) только тогда, когда вы абсолютно уверены в типе переменной, и TypeScript не может вывести его самостоятельно. Чрезмерное использование `as` может скрыть реальные ошибки.

## Как в общем выглядит отдельный компонент `React`-а и каковы его структура и возможности

В современном React компоненты чаще всего пишутся как **функциональные компоненты** с использованием **хуков (Hooks)**.

**Базовая структура функционального компонента:**

```jsx
// 1. Импорт необходимых библиотек/хуков
import React, { useState, useEffect } from "react";
import "./MyComponent.css"; // Опционально: импорт стилей

// 2. Определение компонента как функции
// Имя функции компонента всегда начинается с заглавной буквы
function MyComponent(props) {
  // 'props' - объект, содержащий переданные свойства
  // 3. Использование хуков для управления состоянием и сайд-эффектами
  const [count, setCount] = useState(0); // Пример состояния
  const [data, setData] = useState(null); // Пример состояния для данных

  useEffect(() => {
    // Пример сайд-эффекта: выполняется после каждого рендера
    // Можно использовать для запросов к API, подписок и т.д.
    console.log("Компонент MyComponent был отрендерен или обновлен!");

    // Пример очистки сайд-эффекта (например, отписка от событий)
    return () => {
      console.log("Компонент MyComponent будет размонтирован!");
    };
  }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз при монтировании

  // 4. Возврат JSX-разметки
  // JSX должен возвращать один корневой элемент (или фрагмент <></>)
  return (
    <div className="my-component-container">
      <h1>Привет, {props.name || "Мир"}!</h1>
      <p>Текущее значение счетчика: {count}</p>
      <button onClick={() => setCount(count + 1)}>Увеличить счетчик</button>
      {/* Условный рендеринг */}
      {data ? <p>Данные загружены: {data}</p> : <p>Загрузка данных...</p>}
      {/* Дочерние компоненты */}
      {props.children}{" "}
      {/* Это позволяет передавать JSX как "детей" компонента */}
    </div>
  );
}

// 5. Экспорт компонента для использования в других файлах
export default MyComponent;
```

**Структура и возможности:**

- **Функция:** Компонент — это обычная JavaScript-функция.
- **Props (свойства):** Функция принимает один аргумент — объект `props`. Через него родительский компонент передает данные дочернему. Пропсы доступны только для чтения внутри компонента.
- **JSX (JavaScript XML):** То, что возвращает функция. Это синтаксис, похожий на HTML, но позволяющий встраивать JavaScript-выражения с помощью фигурных скобок `{}`. React преобразует JSX в вызовы `React.createElement()`, которые затем создают элементы виртуального DOM.
- **State (состояние):** Управляется с помощью хука `useState`. Позволяет компоненту хранить и обновлять внутренние данные, которые влияют на его рендеринг. Изменение состояния вызывает перерисовку компонента.
- **Lifecycle (жизненный цикл) и Side Effects (побочные эффекты):** Управляются с помощью хука `useEffect`. Позволяет выполнять код после каждого рендеринга, при монтировании/размонтировании компонента, или при изменении определенных зависимостей. Используется для взаимодействия с внешним миром (запросы к API, манипуляции с DOM, подписки).
- **Conditional Rendering (условный рендеринг):** Возможность отображать разные части UI в зависимости от условий (например, `if/else`, тернарный оператор, логические `&&`).
- **List Rendering (рендеринг списков):** Использование метода `map()` для итерации по массиву данных и рендеринга списка элементов. **Важно использовать `key` пропс** для каждого элемента в списке для оптимизации React.
- **Event Handling (обработка событий):** Прикрепление функций-обработчиков к элементам UI (например, `onClick`, `onChange`, `onSubmit`).

## Подробное описание технологий, которые нам придётся использовать, с примерами

### Функциональные компоненты

Обычные JavaScript-функции, которые принимают `props` и возвращают JSX. Это основной способ создания компонентов в современном React.

Будет использоваться нами повсеместно - это основа всего.

**Props** (component properties): будет использоваться для передачи данных между компонентами:

- Передача сообщения от `MessageInput` к родительскому `ChatWindow`.
- Передача списка сообщений от `ChatWindow` к `MessageList`.
- Передача данных о конкретном сообщении (`sender`, `content`) к компоненту `Message`.

```jsx
// src/components/Greeting.jsx
import React from "react";

// Компонент, который принимает пропс 'name'
function Greeting(props) {
  return <p>Привет, {props.name}!</p>;
}

export default Greeting;
```

Использование во внешнем компоненте:

```jsx
// src/App.js
import React from "react";
import Greeting from "./components/Greeting";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Greeting name="Разработчик" />{" "}
      {/* Передаем значение "Разработчик" в пропс 'name'*/}
    </div>
  );
}

export default App;
```

### JSX (JavaScript XML)

JSX позволяет писать HTML-подобную разметку прямо внутри JavaScript. React использует его для описания структуры пользовательского интерфейса.

Также будет использоваться нами повсеместно - это основа всего.

```jsx
// src/components/Header.jsx
import React from "react";

function Header() {
  const appName = "AI Chat Service"; // Можно использовать JS-переменные внутри JSX

  return (
    <header className="app-header">
      {/* Вставляем JS-выражения в фигурных скобках {} */}
      <h1>Добро пожаловать в {appName}!</h1>
      <p>Ваш централизованный сервис для общения с AI.</p>
      {/* Атрибуты HTML-тегов в JSX пишутся в camelCase (например, className вместо class) */}
    </header>
  );
}

export default Header;
```

### `useState` Hook

Позволяет функциональным компонентам иметь "состояние" — данные, которые могут меняться со временем и вызывать перерисовку компонента.

Будет использоваться нами для управления состоянием:

- Текст ввода пользователя.
- Список сообщений в текущем диалоге.
- Список доступных диалогов.
- Идентификатор текущего активного диалога. \* Состояние загрузки (например, при отправке сообщения или получении данных).

```jsx
// src/components/Counter.jsx
import React, { useState } from "react";

function Counter() {
  // useState возвращает массив:
  // 1. Текущее значение состояния (count)
  // 2. Функция для обновления состояния (setCount)
  const [count, setCount] = useState(0); // Инициализируем состояние 'count' значением 0

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>Увеличить</button>
      <button onClick={() => setCount(count - 1)}>Уменьшить</button>
      <button onClick={() => setCount(0)}>Сбросить</button>
    </div>
  );
}

export default Counter;
```

### Conditional Rendering (Условный рендеринг)

Отображение разных элементов или компонентов в зависимости от условия.

Будет использоваться нами для:

- Отображения "Загрузка..." пока данные не получены.
- Показа разных UI-элементов в зависимости от того, выбран ли диалог или создается новый.
- Отображения сообщений пользователя и AI по-разному.

```jsx
// src/components/AuthStatus.jsx
import React, { useState } from "react";

function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {isLoggedIn ? (
        // Если isLoggedIn true, показываем это
        <p>Вы вошли в систему!</p>
      ) : (
        // Иначе показываем это
        <p>Пожалуйста, войдите в систему.</p>
      )}
      <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
        {isLoggedIn ? "Выйти" : "Войти"}
      </button>
    </div>
  );
}

export default AuthStatus;
```

### List Rendering (Рендеринг списков)

Отображение коллекций данных (массивов) с использованием метода `map()`. **Ключевой пропс `key` обязателен!**

Будет использоваться нами для:

- Отображения списка диалогов в боковой панели.
- Отображения списка сообщений в окне чата.

```jsx
// src/components/MessageList.jsx
import React from "react";

function MessageList({ messages }) {
  // Получаем массив сообщений через пропсы
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <p>Нет сообщений в этом диалоге.</p>
      ) : (
        messages.map((msg) => (
          // key должен быть уникальным для каждого элемента в списке
          // Обычно это ID записи из базы данных
          <div key={msg.id} className={`message ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "Вы" : "AI"}:</strong>{" "}
            {msg.content}
          </div>
        ))
      )}
    </div>
  );
}

export default MessageList;
```

### `useEffect` Hook

Позволяет выполнять "побочные эффекты" (side effects) в функциональных компонентах. Это могут быть запросы к API, подписки на события, прямое манипулирование DOM и т.д. `useEffect` запускается после каждого рендера, если не указаны зависимости.

Будет использоваться нами для сайд-эффектов:

- Выполнение HTTP-запросов к вашему Flask API при загрузке компонента (например, для получения списка диалогов или сообщений для выбранного диалога).
- Возможно, для прокрутки чата вниз при получении нового сообщения.

```jsx
// src/components/DataLoader.jsx
import React, { useState, useEffect } from "react";
import axios from "axios"; // Предполагаем, что axios установлен: npm install axios

function DataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Этот эффект запускается один раз после первого рендера (аналог componentDidMount)
    // потому что массив зависимостей [] пуст.
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/conversations"
        ); // Запрос к вашему Flask API
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Опционально: функция очистки, выполняется при размонтировании компонента (аналог componentWillUnmount)
    return () => {
      console.log("Компонент DataLoader размонтирован.");
      // Здесь можно отменить подписки, очистить таймеры и т.д.
    };
  }, []); // Пустой массив зависимостей

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p>Ошибка при загрузке: {error.message}</p>;

  return (
    <div>
      <h2>Список диалогов:</h2>
      <ul>
        {data.map((conv) => (
          <li key={conv.id}>
            {conv.title} (ID: {conv.id})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DataLoader;
```

### Event Handling (Обработка событий)

Реагирование на действия пользователя, такие как клики, ввод текста и т.д.

Будет использоваться нами так:

- `onChange` для поля ввода сообщения.
- `onClick` для кнопки "Отправить" или выбора диалога.
- `onKeyPress` для отправки сообщения по Enter.

```jsx
// src/components/MessageInput.jsx
import React, { useState } from "react";

function MessageInput({ onSendMessage }) {
  // onSendMessage - функция, переданная из родителя
  const [messageText, setMessageText] = useState("");

  const handleChange = (event) => {
    setMessageText(event.target.value);
  };

  const handleSubmit = () => {
    if (messageText.trim()) {
      // Проверяем, что сообщение не пустое
      onSendMessage(messageText); // Вызываем функцию из родителя
      setMessageText(""); // Очищаем поле ввода
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={messageText}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Введите ваше сообщение..."
      />
      <button onClick={handleSubmit}>Отправить</button>
    </div>
  );
}

export default MessageInput;
```

### HTTP-клиент (запросы на бэк)

Хотя React сам по себе не предоставляет встроенных средств для HTTP-запросов, вы будете активно использовать `fetch` API браузера для взаимодействия с вашим Flask API.

```jsx
// src/components/ChatWindow.jsx
import React, { useState, useEffect } from "react";

function ChatWindow({ currentConversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Если нет выбранного диалога, очищаем сообщения
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null); // Сбрасываем ошибку
      try {
        const response = await fetch(
          `http://localhost:5000/api/conversations/${currentConversationId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Ошибка загрузки сообщений:", err);
        setError(err);
        setMessages([]); // Очищаем сообщения при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentConversationId]); // Зависимость: эффект запустится при изменении currentConversationId

  if (loading) return <p>Загрузка сообщений...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  if (messages.length === 0)
    return <p>Начните новый диалог или выберите существующий.</p>;

  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender}`}>
          <p>
            <strong>{msg.sender === "user" ? "Вы" : "AI"}:</strong>{" "}
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ChatWindow;
```

## React в общем

### Как выглядит Workflow на React-е

**Workflow (рабочий процесс) на React** — это процесс создания пользовательских интерфейсов путем сборки независимых, многократно используемых блоков, называемых **компонентами**.

**Типичный Workflow:**

1.  **Инициализация проекта:** Обычно начинается с использования инструмента, такого как `Create React App` (или `Vite` для более современных проектов), который создает базовую структуру проекта с настроенными инструментами сборки (Webpack, Babel).
    - `npx create-react-app my-app`
2.  **Разработка компонентов:**
    - **Создание файлов:** Каждый компонент обычно находится в своем собственном файле (например, `MyComponent.js` или `MyComponent.jsx`). Для стилей могут быть отдельные файлы (`MyComponent.css` или `MyComponent.module.css`).
    - **Определение компонента:** Внутри файла определяется функция (или класс) React-компонента.
    - **Возврат JSX:** Компонент возвращает JSX — синтаксическое расширение JavaScript, которое позволяет описывать структуру UI, очень похожую на HTML.
    - **Импорт/Экспорт:** Компоненты экспортируются из своих файлов и импортируются в другие компоненты, где они будут использоваться.
3.  **Сборка UI из компонентов:** Более крупные компоненты собираются из более мелких. Например, компонент `ChatWindow` может состоять из `MessageList`, `MessageInput` и `Message`.
4.  **Управление состоянием (State):** Компоненты управляют своими внутренними данными (состоянием) с помощью хуков (например, `useState`). Изменение состояния вызывает перерисовку компонента.
5.  **Передача данных (Props):** Данные передаются от родительских компонентов к дочерним через "пропсы" (props - свойства). Это однонаправленный поток данных, что делает отладку предсказуемой.
6.  **Обработка событий:** К элементам UI прикрепляются обработчики событий (например, `onClick`, `onChange`), которые вызывают функции, изменяющие состояние или выполняющие другие действия.
7.  **Сайд-эффекты (`useEffect`):** Для выполнения действий, которые не являются прямой частью рендеринга (например, запросы к API, подписки на события), используется хук `useEffect`.
8.  **Сборка и развертывание:** В конце разработки проект собирается в статические HTML, CSS и JavaScript файлы, которые затем могут быть развернуты на веб-сервере.

### Как программист добавляет элементы, файлы, компоненты, как кастомизирует их

- **Элементы:** Добавляются непосредственно в JSX, используя синтаксис, похожий на HTML (например, `<div>`, `<p>`, `<input>`).
- **Файлы:** Создаются обычные JavaScript-файлы (`.js` или `.jsx`) в структурированных папках (например, `src/components`, `src/pages`, `src/utils`).
- **Компоненты:** Определяются как JavaScript-функции (функциональные компоненты) или классы (классовые компоненты, менее распространены в современном React). Они импортируются и используются как обычные HTML-теги в JSX: `<MyComponent />`.
- **Кастомизация:**
  - **Через Props:** Передача различных значений в пропсы компонента для изменения его поведения или внешнего вида (например, `<Button color="blue" />`).
  - **Через State:** Внутреннее состояние компонента позволяет ему меняться со временем в ответ на действия пользователя или другие события (например, открывающийся/закрывающийся выпадающий список).
  - **Через CSS/Styling:**
    - **Обычный CSS:** Импорт `.css` файлов.
    - **CSS Modules:** Позволяют изолировать стили для каждого компонента, избегая конфликтов имен классов.
    - **Styled-components/Emotion:** CSS-in-JS библиотеки, которые позволяют писать CSS прямо в JavaScript-коде, создавая компоненты со стилями.
    - **Utility-first CSS (Tailwind CSS):** Предоставляет набор готовых CSS-классов для быстрой стилизации.

### В чём преимущество React перед всеми остальными

React не единственный фреймворк, но у него есть ряд ключевых преимуществ, которые сделали его очень популярным:

1.  **Компонентно-ориентированный подход:**
    - **Модульность:** UI разбивается на независимые, многократно используемые компоненты. Это упрощает разработку, тестирование и поддержку больших приложений.
    - **Переиспользование:** Один и тот же компонент можно использовать в разных частях приложения или даже в разных проектах.
2.  **Декларативный синтаксис:**
    - Вы описываете, _что_ должен отображать UI в конкретный момент времени, а не _как_ его изменить. React сам эффективно обновляет DOM, когда данные меняются. Это делает код более предсказуемым и легким для понимания.
3.  **Виртуальный DOM (Virtual DOM):**
    - React создает легковесную копию реального DOM в памяти. Когда состояние компонента меняется, React сначала обновляет виртуальный DOM, сравнивает его с предыдущей версией (процесс "diffing") и затем применяет только минимальные изменения к реальному DOM. Это значительно повышает производительность, так как прямое манипулирование реальным DOM является дорогостоящей операцией.
4.  **Однонаправленный поток данных:**
    - Данные передаются "сверху вниз" (от родителя к дочернему компоненту через пропсы). Это делает поток данных предсказуемым и упрощает отладку, так как понятно, откуда приходят данные.
5.  **Большая экосистема и сообщество:**
    - Огромное количество готовых библиотек, инструментов, компонентов и ресурсов.
    - Активное сообщество, которое обеспечивает поддержку, делится знаниями и способствует развитию фреймворка.
6.  **"Learn once, write anywhere":**
    - Концепции React применимы не только для веб-разработки (React DOM), но и для мобильной (React Native) и даже десктопной (Electron + React) разработки, что позволяет использовать одни и те же знания на разных платформах.
