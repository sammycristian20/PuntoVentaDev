-- Enable RLS (Row Level Security) for all tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies for business_profiles
CREATE POLICY "Users can view their own business profile"
    ON business_profiles
    FOR SELECT
    USING (id IN (
        SELECT business_profile_id
        FROM users
        WHERE auth.uid() = id
    ));

-- Create policies for products
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

-- Create policies for sales
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

-- Create policies for sale_items
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

CREATE POLICY "Users can create sale items for their sales"
    ON sale_items
    FOR INSERT
    WITH CHECK (sale_id IN (
        SELECT id
        FROM sales
        WHERE business_profile_id IN (
            SELECT business_profile_id
            FROM users
            WHERE auth.uid() = id
        )
    ));

-- Create policies for inventory_movements
CREATE POLICY "Users can view inventory movements from their business"
    ON inventory_movements
    FOR SELECT
    USING (product_id IN (
        SELECT id
        FROM products
        WHERE business_profile_id IN (
            SELECT business_profile_id
            FROM users
            WHERE auth.uid() = id
        )
    ));

CREATE POLICY "Owners and admins can manage inventory movements"
    ON inventory_movements
    FOR ALL
    USING (EXISTS (
        SELECT 1
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE auth.uid() = users.id
        AND roles.name IN ('owner', 'admin')
        AND users.business_profile_id IN (
            SELECT business_profile_id
            FROM products
            WHERE id = inventory_movements.product_id
        )
    ));