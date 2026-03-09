-- Seed Products and Assign to Categories
-- Creates products with variants, prices, and category assignments

-- Get IDs
\set sales_channel_id `docker exec medusa-postgres-local psql -U postgres -d medusa -t -c "SELECT id FROM sales_channel WHERE name = 'Default Sales Channel' LIMIT 1;"`

-- Product 1: iPhone 15 Pro (Smartphones)
INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'iPhone 15 Pro',
  'iphone-15-pro',
  'iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system.',
  'published',
  '187',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (handle) WHERE deleted_at IS NULL DO NOTHING
RETURNING id INTO product_id;

-- Assign to Smartphones category
INSERT INTO product_category_product (product_id, product_category_id)
SELECT p.id, pc.id
FROM product p, product_category pc
WHERE p.handle = 'iphone-15-pro' AND pc.name = 'Smartphones'
ON CONFLICT (product_id, product_category_id) DO NOTHING;

-- Link to sales channel
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.handle = 'iphone-15-pro' AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

-- Product 2: USB-C Fast Charger 67W (Accessories)
INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'USB-C Fast Charger 67W',
  'usbc-fast-charger-67w',
  'High-speed 67W USB-C power adapter with GaN technology.',
  'published',
  '150',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (handle) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO product_category_product (product_id, product_category_id)
SELECT p.id, pc.id
FROM product p, product_category pc
WHERE p.handle = 'usbc-fast-charger-67w' AND pc.name = 'Accessories'
ON CONFLICT (product_id, product_category_id) DO NOTHING;

INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.handle = 'usbc-fast-charger-67w' AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

-- Product 3: MacBook Air M3 (Laptops)
INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'MacBook Air M3',
  'macbook-air-m3',
  'MacBook Air with M3 chip delivers exceptional performance and battery life.',
  'published',
  '1240',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (handle) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO product_category_product (product_id, product_category_id)
SELECT p.id, pc.id
FROM product p, product_category pc
WHERE p.handle = 'macbook-air-m3' AND pc.name = 'Laptops'
ON CONFLICT (product_id, product_category_id) DO NOTHING;

INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.handle = 'macbook-air-m3' AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

-- Product 4: iPhone Battery Replacement Kit (Components)
INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'iPhone Battery Replacement Kit',
  'iphone-battery-replacement',
  'High-capacity replacement battery for iPhone with professional installation kit.',
  'published',
  '50',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (handle) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO product_category_product (product_id, product_category_id)
SELECT p.id, pc.id
FROM product p, product_category pc
WHERE p.handle = 'iphone-battery-replacement' AND pc.name = 'Components'
ON CONFLICT (product_id, product_category_id) DO NOTHING;

INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.handle = 'iphone-battery-replacement' AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

-- Verify products and categories
SELECT p.id, p.title, p.handle, p.status, pc.name as category
FROM product p
LEFT JOIN product_category_product pcp ON p.id = pcp.product_id
LEFT JOIN product_category pc ON pcp.product_category_id = pc.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at;
