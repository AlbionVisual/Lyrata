create_table_documents = """CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    author TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    reading_progress INTEGER
);"""

create_table_blocks = """CREATE TABLE blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    parent_id INTEGER,
    order_in_parent INTEGER NOT NULL,
    type TEXT NOT NULL,
    attrs_json TEXT,
    data_json TEXT,
    content_json TEXT,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES blocks (id) ON DELETE CASCADE
);"""

hierarchichal_sort = """WITH RECURSIVE BlockHierarchy AS (
    SELECT
        b.id,
        b.document_id,
        b.parent_id,
        b.order_in_parent,
        b.type,
        b.attrs_json,
        b.data_json,
        b.content_json,
        1 AS depth,
        printf('%04d', b.order_in_parent) AS sort_path
    FROM
        blocks AS b
    WHERE
        b.document_id = ? AND b.parent_id IS NULL

    UNION ALL

    SELECT
        b.id,
        b.document_id,
        b.parent_id,
        b.order_in_parent,
        b.type,
        b.attrs_json,
        b.data_json,
        b.content_json,
        bh.depth + 1 AS depth,
        bh.sort_path || '.' || printf('%04d', b.order_in_parent) AS sort_path
    FROM
        blocks AS b
    JOIN
        BlockHierarchy AS bh ON b.parent_id = bh.id
    WHERE
        b.document_id = ?
)
SELECT
    id,
    document_id,
    parent_id,
    order_in_parent,
    type,
    attrs_json,
    data_json,
    content_json,
    depth
FROM
    BlockHierarchy
ORDER BY
    sort_path;"""

hierarchichal_sort_with_range = """WITH RECURSIVE FullBlockHierarchy AS (
    -- Якорный член: Начинаем с корневых блоков для указанного документа
    SELECT
        b.id,
        b.document_id,
        b.parent_id,
        b.order_in_parent,
        b.type,
        b.attrs_json,
        b.data_json,
        b.content_json,
        1 AS depth,
        printf('%04d', b.order_in_parent) AS sort_path
    FROM
        blocks AS b
    WHERE
        b.document_id = ? AND b.parent_id IS NULL

    UNION ALL

    -- Рекурсивный член: Присоединяемся к иерархии для поиска дочерних элементов
    SELECT
        b.id,
        b.document_id,
        b.parent_id,
        b.order_in_parent,
        b.type,
        b.attrs_json,
        b.data_json,
        b.content_json,
        fbh.depth + 1 AS depth,
        fbh.sort_path || '.' || printf('%04d', b.order_in_parent) AS sort_path
    FROM
        blocks AS b
    JOIN
        FullBlockHierarchy AS fbh ON b.parent_id = fbh.id
    WHERE
        b.document_id = ?
),
LimitedBlocks AS (
    -- Выбираем N основных блоков на основе offset и limit
    SELECT
        id, document_id, parent_id, order_in_parent, type,
        attrs_json, data_json, content_json, depth, sort_path
    FROM
        FullBlockHierarchy
    ORDER BY
        sort_path
    LIMIT ? OFFSET ?
),
RequiredParents AS (
    -- Якорный член для родителей: Начинаем с parent_id из LimitedBlocks, которые сами не находятся в LimitedBlocks
    SELECT
        fbh.id, fbh.document_id, fbh.parent_id, fbh.order_in_parent, fbh.type,
        fbh.attrs_json, fbh.data_json, fbh.content_json, fbh.depth, fbh.sort_path
    FROM
        FullBlockHierarchy AS fbh
    JOIN
        LimitedBlocks AS lb ON fbh.id = lb.parent_id
    WHERE
        fbh.id NOT IN (SELECT id FROM LimitedBlocks)

    UNION ALL

    -- Рекурсивный член для родителей: Находим предков текущего набора необходимых родителей
    SELECT
        fbh.id, fbh.document_id, fbh.parent_id, fbh.order_in_parent, fbh.type,
        fbh.attrs_json, fbh.data_json, fbh.content_json, fbh.depth, fbh.sort_path
    FROM
        FullBlockHierarchy AS fbh
    JOIN
        RequiredParents AS rp ON fbh.id = rp.parent_id
    WHERE
        fbh.id NOT IN (SELECT id FROM LimitedBlocks)
)
-- Окончательная выборка с использованием подзапроса для корректной сортировки
SELECT
    id, document_id, parent_id, order_in_parent, type,
    attrs_json, data_json, content_json
FROM (
    -- Начало подзапроса
    SELECT
        id, document_id, parent_id, order_in_parent, type,
        attrs_json, data_json, content_json, depth, sort_path
    FROM
        LimitedBlocks
    UNION
    SELECT
        id, document_id, parent_id, order_in_parent, type,
        attrs_json, data_json, content_json, depth, sort_path
    FROM
        RequiredParents
    -- Конец подзапроса
)
ORDER BY
    sort_path;"""