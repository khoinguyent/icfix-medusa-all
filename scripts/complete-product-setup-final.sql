-- Complete Product Setup - Final Script
-- Makes all products visible on the store

BEGIN;

-- Step 1: Ensure we have 4 price sets
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

-- Step 2: Link all 4 variants to price sets (one by one to avoid conflicts)
INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
SELECT 
  'dfd33cb6-83e5-49ec-a82a-fc59d71ce90a',
  (SELECT id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 0),
  gen_random_uuid()::text,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM product_variant_price_set WHERE variant_id = 'dfd33cb6-83e5-49ec-a82a-fc59d71ce90a' AND deleted_at IS NULL);

INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
SELECT 
  '84df59d3-ad1e-4bd8-a2d8-bab9a3613522',
  (SELECT id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 1),
  gen_random_uuid()::text,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM product_variant_price_set WHERE variant_id = '84df59d3-ad1e-4bd8-a2d8-bab9a3613522' AND deleted_at IS NULL);

INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
SELECT 
  'e8b58a38-765d-41de-a78c-97437262cc8e',
  (SELECT id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 2),
  gen_random_uuid()::text,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM product_variant_price_set WHERE variant_id = 'e8b58a38-765d-41de-a78c-97437262cc8e' AND deleted_at IS NULL);

INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
SELECT 
  '2ee552b3-f1d9-474d-9186-3dd50b73d2ee',
  (SELECT id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 OFFSET 3),
  gen_random_uuid()::text,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM product_variant_price_set WHERE variant_id = '2ee552b3-f1d9-474d-9186-3dd50b73d2ee' AND deleted_at IS NULL);

-- Step 3: Create prices for all price sets linked to variants
INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  pvps.price_set_id,
  'vnd',
  CASE pv.sku
    WHEN 'IPHONE15PRO-128-NAT' THEN 28900000
    WHEN 'CHARGER67W-ONLY' THEN 890000
    WHEN 'MBA-M3-8-256-MID' THEN 27900000
    WHEN 'BATTERY-IP13' THEN 890000
  END,
  jsonb_build_object('value', CASE pv.sku
    WHEN 'IPHONE15PRO-128-NAT' THEN 28900000
    WHEN 'CHARGER67W-ONLY' THEN 890000
    WHEN 'MBA-M3-8-256-MID' THEN 27900000
    WHEN 'BATTERY-IP13' THEN 890000
  END),
  NOW(),
  NOW()
FROM product_variant_price_set pvps
JOIN product_variant pv ON pvps.variant_id = pv.id
WHERE pvps.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM price WHERE price_set_id = pvps.price_set_id AND deleted_at IS NULL);

-- Step 4: Create inventory items
INSERT INTO inventory_item (id, sku, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'IPHONE15PRO-128-NAT', NOW(), NOW()),
  (gen_random_uuid()::text, 'CHARGER67W-ONLY', NOW(), NOW()),
  (gen_random_uuid()::text, 'MBA-M3-8-256-MID', NOW(), NOW()),
  (gen_random_uuid()::text, 'BATTERY-IP13', NOW(), NOW())
ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING;

-- Step 5: Create inventory levels
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
  AND NOT EXISTS (
    SELECT 1 FROM inventory_level 
    WHERE inventory_item_id = ii.id 
      AND location_id = (SELECT id FROM stock_location LIMIT 1)
  );

-- Step 6: Link variants to inventory items
INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
SELECT gen_random_uuid()::text, pv.id, ii.id, 1, NOW(), NOW()
FROM product_variant pv
JOIN inventory_item ii ON pv.sku = ii.sku
WHERE pv.deleted_at IS NULL AND ii.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_variant_inventory_item 
    WHERE variant_id = pv.id AND inventory_item_id = ii.id
  );

-- Step 7: Link products to sales channel
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.deleted_at IS NULL AND sc.name = 'Default Sales Channel'
  AND NOT EXISTS (
    SELECT 1 FROM product_sales_channel 
    WHERE product_id = p.id AND sales_channel_id = sc.id
  );

COMMIT;

-- Final verification
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
