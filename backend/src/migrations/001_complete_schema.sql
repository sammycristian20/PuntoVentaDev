-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    rnc VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    business_profile_id UUID REFERENCES business_profiles(id),
    role_id UUID REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    stock INTEGER NOT NULL DEFAULT 0,
    business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES sales(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    notes TEXT,
    business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_business ON products(business_profile_id);
CREATE INDEX idx_sales_business ON sales(business_profile_id);
CREATE INDEX idx_inventory_business ON inventory_movements(business_profile_id);
CREATE INDEX idx_users_business ON users(business_profile_id);
CREATE INDEX idx_users_role ON users(role_id);

-- Enable RLS (Row Level Security) for all tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Business Profiles policies
CREATE POLICY "Users can view their own business profile"
    ON business_profiles
    FOR SELECT
    USING (id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

-- Products policies
CREATE POLICY "Users can view products from their business"
    ON products
    FOR SELECT
    USING (business_profile_id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Owners and admins can manage products"
    ON products
    FOR ALL
    USING (EXISTS (
        SELECT 1
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE auth.uid() = users.id
        AND roles.name IN ('owner', 'admin')
        AND users.business_profile_id = products.business_profile_id
    ));

-- Sales policies
CREATE POLICY "Users can view sales from their business"
    ON sales
    FOR SELECT
    USING (business_profile_id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Users can create sales for their business"
    ON sales
    FOR INSERT
    WITH CHECK (business_profile_id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

-- Sale Items policies
CREATE POLICY "Users can view sale items from their sales"
    ON sale_items
    FOR SELECT
    USING (sale_id IN (
        SELECT id
        FROM sales
        WHERE business_profile_id IN (
            SELECT business_profile_id
            FROM users
            WHERE auth.uid() = id
        )
    ));

-- Inventory Movements policies
CREATE POLICY "Users can view inventory movements from their business"
    ON inventory_movements
    FOR SELECT
    USING (business_profile_id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('owner', 'Business owner with full access'),
('admin', 'Administrator with management access'),
('cashier', 'Cashier with POS access')
ON CONFLICT (name) DO NOTHING;

-- Create functions for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_business_profiles_updated_at
    BEFORE UPDATE ON business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();