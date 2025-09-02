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
    sort_path"""

hierarchichal_sort_with_limit = hierarchichal_sort + "\nLIMIT ?"
hierarchichal_sort_with_range = hierarchichal_sort_with_limit + "\nOFFSET ?"

hierarchichal_sort += ";"
hierarchichal_sort_with_limit += ";"
hierarchichal_sort_with_range += ";"