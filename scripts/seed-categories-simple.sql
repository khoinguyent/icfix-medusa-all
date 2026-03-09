-- Seed Categories via Direct SQL
-- Note: This creates basic category records
-- Products should be created via Admin API or seed script

-- Insert categories
INSERT INTO product_category (id, name, handle, description, is_active, is_internal, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'Smartphones', 'smartphones', 'Latest smartphones and mobile devices', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Accessories', 'accessories', 'Phone cases, chargers, and more', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Components', 'components', 'Phone batteries, screens, and replacement parts', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Laptops', 'laptops', 'Laptops and computing devices', true, false, NOW(), NOW())
ON CONFLICT (handle) DO NOTHING;

SELECT 'Categories created successfully' as status;
