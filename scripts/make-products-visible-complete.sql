-- Complete Products Setup Script
-- Makes all products visible on the store by creating variants, prices, and inventory

BEGIN;

-- Step 1: Create 4 price sets (one for each variant)
DO $$
DECLARE
  ps_count int;
BEGIN
  SELECT COUNT(*) INTO ps_count FROM price_set WHERE deleted_at IS NULL;
  WHILE ps_count < 4 LOOP
    INSERT INTO price_set (id, created_at, updated_at) VALUES (gen_random_uuid()::text, NOW(), NOW());
    SELECT COUNT(*) INTO ps_count FROM price_set WHERE deleted_at IS NULL;
  END LOOP;
END $$;

-- Step 2: Link variants to price sets using explicit IDs
-- Get the 4 most recent price sets and link them to variants
DO $$
DECLARE
  ps1_id text;
  ps2_id text;
  ps3_id text;
  ps4_id text;
BEGIN
  -- Get 4 most recent price sets
  SELECT id INTO ps1_id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 0;
  SELECT id INTO ps2_id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 1;
  SELECT id INTO ps3_id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 2;
  SELECT id INTO ps4_id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 3;
  
  -- Link variants to price sets
  INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
  VALUES 
    ('dfd33cb6-83e5-49ec-a82a-fc59d71ce90a', ps1_id, gen_random_uuid()::text, NOW(), NOW()),
    ('84df59d3-ad1e-4bd8-a2d8-bab9a3613522', ps2_id, gen_random_uuid()::text, NOW(), NOW()),
    ('e8b58a38-765d-41de-a78c-97437262cc8e', ps3_id, gen_random_uuid()::text, NOW(), NOW()),
    ('2ee552b3-f1d9-474d-9186-3dd50b73d2ee', ps4_id, gen_random_uuid()::text, NOW(), NOW())
  ON CONFLICT (variant_id, price_set_id) DO NOTHING;
  
  -- Create prices for each price set
  INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, ps1_id, 'vnd', 28900000, '{"value": 28900000}'::jsonb, NOW(), NOW()),
    (gen_random_uuid()::text, ps2_id, 'vnd', 890000, '{"value": 890000}'::jsonb, NOW(), NOW()),
    (gen_random_uuid()::text, ps3_id, 'vnd', 27900000, '{"value": 27900000}'::jsonb, NOW(), NOW()),
    (gen_random_uuid()::text, ps4_id, 'vnd', 890000, '{"value": 890000}'::jsonb, NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- Step 3: Create inventory items
INSERT INTO inventory_item (id, sku, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'IPHONE15PRO-128-NAT', NOW(), NOW()),
  (gen_random_uuid()::text, 'CHARGER67W-ONLY', NOW(), NOW()),
  (gen_random_uuid()::text, 'MBA-M3-8-256-MID', NOW(), NOW()),
  (gen_random_uuid()::text, 'BATTERY-IP13', NOW(), NOW())
ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING;

-- Step 4: Create inventory levels
INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  ii.id,
  (SELECT id FROM stock_location LIMIT 1),
  CASE WHEN ii.sku = 'IPHONE15PRO-128-NAT' THEN 100 WHEN ii.sku = 'MBA-M3-8-256-MID' THEN 50 ELSE 200 END,
  0,
  CASE WHEN ii.sku = 'IPHONE15PRO-128-NAT' THEN 100 WHEN ii.sku = 'MBA-M3-8-256-MID' THEN 50 ELSE 200 END,
  NOW(),
  NOW()
FROM inventory_item ii
WHERE ii.sku IN ('IPHONE15PRO-128-NAT', 'CHARGER67W-ONLY', 'MBA-M3-8-256-MID', 'BATTERY-IP13')
  AND ii.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Step 5: Link variants to inventory items
INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
SELECT gen_random_uuid()::text, pv.id, ii.id, 1, NOW(), NOW()
FROM product_variant pv
JOIN inventory_item ii ON pv.sku = ii.sku
WHERE pv.deleted_at IS NULL AND ii.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Step 6: Link products to sales channel
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.deleted_at IS NULL AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

COMMIT;

-- Verification
SELECT 
  'Products' as type, COUNT(*)::text as count 
FROM product WHERE deleted_at IS NULL
UNION ALL
SELECT 'Variants', COUNT(*)::text 
FROM product_variant WHERE deleted_at IS NULL
UNION ALL
SELECT 'Price Sets', COUNT(*)::text 
FROM price_set WHERE deleted_at IS NULL
UNION ALL
SELECT 'Variant-Price Links', COUNT(*)::text 
FROM product_variant_price_set WHERE deleted_at IS NULL
UNION ALL
SELECT 'Prices', COUNT(*)::text 
FROM price WHERE deleted_at IS NULL
UNION ALL
SELECT 'Inventory Items', COUNT(*)::text 
FROM inventory_item WHERE deleted_at IS NULL
UNION ALL
SELECT 'Sales Channel Links', COUNT(*)::text 
FROM product_sales_channel WHERE deleted_at IS NULL;

-- Show products with prices
SELECT 
  p.title as product,
  pv.sku,
  pr.amount,
  pr.currency_code
FROM product p
JOIN product_variant pv ON p.id = pv.product_id
JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
JOIN price_set ps ON pvps.price_set_id = ps.id
JOIN price pr ON ps.id = pr.price_set_id
WHERE p.deleted_at IS NULL 
  AND pv.deleted_at IS NULL
ORDER BY p.title, pv.sku;
