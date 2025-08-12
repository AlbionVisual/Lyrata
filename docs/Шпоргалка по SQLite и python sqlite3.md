## Содержание

1. [SQLite](#sqlite)
	1. [1. Создание таблицы (`CREATE TABLE`)](#1-создание-таблицы-create-table)
	2. [2. Создание индекса (`CREATE INDEX`)](#2-создание-индекса-create-index)
	3. [Вставка данных (`INSERT INTO`)](#3-вставка-данных-insert-into)
	4. [Выборка данных (`SELECT`)](#4-выборка-данных-select)
	5. [Обновление данных (`UPDATE`)](#5-обновление-данных-update)
	6. [Удаление данных (`DELETE FROM`)](#6-удаление-данных-delete-from)
	7. [Удаление таблицы (`DROP TABLE`)](#7-удаление-таблицы-drop-table)
	8. [Общие табличные выражения (`WITH` / CTE)](#8-общие-табличные-выражения-with--cte)
		1. [Рекурсивные CTE (`WITH RECURSIVE`)](#рекурсивные-cte-with-recursive)
		2. [Структура рекурсивного CTE](#структура-рекурсивного-cte)
		3. [Как работает ваш запрос](#как-работает-ваш-запрос)
2. [Работа с SQLite в Python (`sqlite3` модуль)](#работа-с-sqlite-в-python-sqlite3-модуль)
	1. [Подключение к базе данных](#подключение-к-базе-данных)
	2. [Создание курсора](#создание-курсора)
	3. [Выполнение запросов](#выполнение-запросов)
	4. [Получение результатов (для `SELECT`)](#получение-результатов-для-select)
	5. [Сохранение изменений](#сохранение-изменений)
	6. [Закрытие соединения](#закрытие-соединения)

## SQLite

#### 1. Создание таблицы (`CREATE TABLE`)

Используется для определения новой таблицы в базе данных.

**Синтаксис:**

```sql
CREATE TABLE table_name (
    column1_name DATATYPE PRIMARY KEY,
    column2_name DATATYPE NOT NULL,
    column3_name DATATYPE DEFAULT default_value,
    FOREIGN KEY (column_name) REFERENCES other_table(other_column) ON DELETE CASCADE ON UPDATE CASCADE
);
```

#### 2. Создание индекса (`CREATE INDEX`)

Ускоряет поиск и сортировку по указанным столбцам.

**Синтаксис:**

```sql
CREATE INDEX index_name ON table_name (column1_name, column2_name DESC);
```

#### 3. Вставка данных (`INSERT INTO`)

Добавляет новые строки в таблицу.

**Синтаксис:**

```sql
INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...);
-- Или для всех столбцов:
INSERT INTO table_name VALUES (value1, value2, ...);
```

**Пример:**

```sql
INSERT INTO documents (id, name, author, created_at, updated_at)
VALUES ('doc_uuid_1', 'Мой первый документ', 'Автор А', '2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z');

INSERT INTO blocks (id, document_id, parent_id, order_in_parent, type, content_json)
VALUES ('block_uuid_1', 'doc_uuid_1', NULL, 0, 'paragraph', '{"type": "text", "text": "Привет, мир!"}');
```

#### 4. Выборка данных (`SELECT`)

Извлекает данные из одной или нескольких таблиц.

**Основной синтаксис:**

```sql
SELECT column1, column2 FROM table_name WHERE condition ORDER BY column_name1 ASC/DESC, column_name2 ASC/DESC LIMIT num OFFSET offset_num;
SELECT * FROM table_name; -- Выбрать все столбцы
```

#### 5. Обновление данных (`UPDATE`)

Изменяет существующие данные в таблице.

**Синтаксис:**

```sql
UPDATE table_name SET column1 = new_value1, column2 = new_value2 WHERE condition;
```

#### 6. Удаление данных (`DELETE FROM`)

Удаляет строки из таблицы.

**Синтаксис:**

```sql
DELETE FROM table_name WHERE condition;
```

#### 7. Удаление таблицы (`DROP TABLE`)

Полностью удаляет таблицу из базы данных.

**Синтаксис:**

```sql
DROP TABLE table_name;
```

#### 8. Общие табличные выражения (`WITH` / CTE)

Оператор `WITH`, также известный как Common Table Expression (CTE), позволяет создать временный именованный набор результатов, который существует только на время выполнения одного запроса. Это значительно улучшает читаемость и позволяет разбивать сложные запросы на более простые логические блоки.

###### Рекурсивные CTE (`WITH RECURSIVE`)

Это особая форма `WITH`, которая используется для выполнения запросов к иерархическим или графоподобным данным, таким как древовидные структуры комментариев, файловые системы или организационные диаграммы.

###### Структура рекурсивного CTE:

Рекурсивный CTE состоит из двух частей, объединенных оператором `UNION ALL`.

1. **Якорный член (Anchor Member):** Это первый `SELECT`-запрос. Он выполняется один раз и создает начальный набор строк (базовый случай рекурсии). В вашем примере это запрос, который находит все блоки верхнего уровня (`parent_id IS NULL`).
2. **Рекурсивный член (Recursive Member):** Это второй `SELECT`-запрос, который ссылается на имя самого CTE (в вашем случае `BlockHierarchy`). Эта часть выполняется многократно, на каждой итерации добавляя новые строки к результату на основе строк, полученных на предыдущем шаге. Рекурсия прекращается, когда рекурсивный член перестает возвращать новые строки. В вашем примере он находит дочерние блоки, присоединяя таблицу `blocks` к результатам предыдущей итерации `BlockHierarchy`.

###### Как работает ваш запрос:

Ваш запрос с `WITH RECURSIVE BlockHierarchy AS (...)` строит полную иерархию блоков для документа следующим образом:

1. **Якорь:** Сначала находятся все корневые блоки документа (`parent_id IS NULL`). Для них вычисляется начальная глубина (`depth = 1`) и путь для сортировки (`sort_path`).
2. **Рекурсия:** Затем запрос итеративно находит дочерние блоки для тех, что уже есть в `BlockHierarchy`. Для каждого найденного дочернего блока глубина (`depth`) увеличивается на 1, а его порядковый номер добавляется к `sort_path` родителя.
3. **Завершение:** Этот процесс повторяется, пока не будут найдены все вложенные блоки на всех уровнях иерархии.
4. **Финальная выборка:** Основной `SELECT` извлекает все данные из построенного CTE `BlockHierarchy` и сортирует их по `sort_path`, что гарантирует правильный порядок вывода: родительские элементы всегда идут перед дочерними.

## Работа с SQLite в Python (`sqlite3` модуль)

Модуль `sqlite3` встроен в Python, поэтому его не нужно устанавливать.

#### Подключение к базе данных:

Создает соединение с файлом БД. Если файла нет, он будет создан.

```python
import sqlite3
# Использование 'with' гарантирует, что соединение будет закрыто автоматически
with sqlite3.connect('mydatabase.db') as conn:
    # ... дальнейшая работа с БД ...
```

#### Создание курсора:

Курсор — это объект, который позволяет выполнять SQL-запросы.

```python
cursor = conn.cursor()
```

#### Выполнение запросов:

Используйте `execute()` для выполнения SQL. **Всегда** используйте параметризацию (`?`) для передачи данных, чтобы избежать SQL-инъекций.

```python
# Создание таблицы
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
)
''')

# Вставка данных (параметризованный запрос)
user_data = ('Alice', 'alice@example.com')
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", user_data)
```

#### Получение результатов (для `SELECT`):

- `cursor.fetchone()`: Получает одну следующую строку или `None`, если строк больше нет.
  ```python
  cursor.execute("SELECT * FROM users WHERE name = ?", ('Alice',))
  user = cursor.fetchone() # Возвращает кортеж, например: (1, 'Alice', 'alice@example.com')
  print(f"Найден пользователь: {user}")
  ```
- `cursor.fetchall()`: Получает все оставшиеся строки в виде списка кортежей.
  ```python
  cursor.execute("SELECT name, email FROM users ORDER BY name")
  all_users = cursor.fetchall() # Возвращает список: [('Alice', 'alice@example.com'), ...]
  for u in all_users:
      print(f"Пользователь: {u[0]}, Email: {u[1]}")
  ```

#### Сохранение изменений:

`conn.commit()` фиксирует транзакцию. Обязательно для `INSERT`, `UPDATE`, `DELETE`, `CREATE`.

```python
conn.commit() # Сохраняем изменения в базе данных
```

#### Закрытие соединения:

`conn.close()`. Если вы используете конструкцию `with sqlite3.connect(...) as conn:`, то `commit()` при успешном выполнении и `close()` вызываются автоматически.
