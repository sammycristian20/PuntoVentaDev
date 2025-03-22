-- Create migrations table to track executed migrations
CREATE TABLE IF NOT EXISTS migrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to record a migration execution
CREATE OR REPLACE FUNCTION record_migration(migration_name VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO migrations (name)
    VALUES (migration_name)
    ON CONFLICT (name) DO NOTHING;
END;
$$ language plpgsql;

-- Function to check if a migration has been executed
CREATE OR REPLACE FUNCTION is_migration_executed(migration_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM migrations
        WHERE name = migration_name
    );
END;
$$ language plpgsql;