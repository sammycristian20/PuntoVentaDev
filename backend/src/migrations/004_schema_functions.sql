-- Create functions for database schema inspection
CREATE OR REPLACE FUNCTION get_tables_info(schema_name text)
RETURNS TABLE (
    table_name text,
    table_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.relname::text as table_name,
        CASE c.relkind
            WHEN 'r' THEN 'table'
            WHEN 'v' THEN 'view'
            WHEN 'm' THEN 'materialized view'
            ELSE c.relkind::text
        END as table_type
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = schema_name
    AND c.relkind IN ('r','v','m')
    ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_columns_info(schema_name text, table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text,
    column_default text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.attname::text as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod)::text as data_type,
        CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable,
        COALESCE(pg_get_expr(d.adbin, d.adrelid), '')::text as column_default
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_catalog.pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
    WHERE n.nspname = schema_name
    AND c.relname = table_name
    AND a.attnum > 0
    AND NOT a.attisdropped
    ORDER BY a.attnum;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tables_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_columns_info(text, text) TO authenticated;