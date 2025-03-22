-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new business profile if the user is registering as an owner
    IF NEW.raw_user_meta_data->>'role' = 'owner' THEN
        INSERT INTO business_profiles (business_name, rnc, email)
        VALUES (
            NEW.raw_user_meta_data->>'business_name',
            NEW.raw_user_meta_data->>'rnc',
            NEW.email
        )
        RETURNING id INTO NEW.raw_user_meta_data->>'business_profile_id';
    END IF;

    -- Create a user record
    INSERT INTO users (id, email, business_profile_id, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        (NEW.raw_user_meta_data->>'business_profile_id')::uuid,
        (SELECT id FROM roles WHERE name = NEW.raw_user_meta_data->>'role')
    );

    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to handle new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete user record
    DELETE FROM users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ language plpgsql security definer;

-- Trigger to handle user deletion
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_deletion();