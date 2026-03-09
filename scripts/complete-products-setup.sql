-- Complete Products Setup Script
-- Creates prices, inventory, and sales channel links for all product variants

BEGIN;

-- Step 1: Ensure we have 4 price sets (one for each variant)
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

-- Step 2: Link variants to price sets (one-to-one mapping)
-- Get variant IDs and price set IDs, then link them
DO $$
DECLARE
  v_record RECORD;
  ps_record RECORD;
  ps_array text[] := ARRAY[]::text[];
  idx int := 1;
BEGIN
  -- Collect price set IDs
  FOR ps_record IN 
    SELECT id FROM price_set WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 4
  LOOP
    ps_array := array_append(ps_array, ps_record.id);
  END LOOP;
  
  -- Link each variant to a price set
  FOR v_record IN 
    SELECT id, sku FROM product_variant 
    WHERE deleted_at IS NULL 
      AND sku IN ('IPHONE15PRO-128-NAT', 'CHARGER67W-ONLY', 'MBA-M3-8-256-MID', 'BATTERY-IP13')
    ORDER BY created_at
  LOOP
    IF idx <= array_length(ps_array, 1) THEN
      INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
      VALUES (v_record.id, ps_array[idx], gen_random_uuid()::text, NOW(), NOW())
      ON CONFLICT (variant_id, price_set_id) DO NOTHING;
      idx := idx + 1;
    END IF;
  END LOOP;
END $$;

-- Step 3: Create prices for each price set linked to a variant
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
    ELSE 0
  END,
  jsonb_build_object('value', CASE pv.sku
    WHEN 'IPHONE15PRO-128-NAT' THEN 28900000
    WHEN 'CHARGER67W-ONLY' THEN 890000
    WHEN 'MBA-M3-8-256-MID' THEN 27900000
    WHEN 'BATTERY-IP13' THEN 890000
    ELSE 0
  END),
  NOW(),
  NOW()
FROM product_variant_price_set pvps
JOIN product_variant pv ON pvps.variant_id = pv.id
WHERE pvps.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM price 
    WHERE price_set_id = pvps.price_set_id 
      AND deleted_at IS NULL
  );

-- Step 4: Create inventory items
INSERT INTO inventory_item (id, sku, created_at, updated_at)
SELECT gen_random_uuid()::text, pv.sku, NOW(), NOW()
FROM product_variant pv
WHERE pv.deleted_at IS NULL
  AND pv.sku IN ('IPHONE15PRO-128-NAT', 'CHARGER67W-ONLY', 'MBA-M3-8-256-MID', 'BATTERY-IP13')
  AND NOT EXISTS (
    SELECT 1 FROM inventory_item 
    WHERE sku = pv.sku 
      AND deleted_at IS NULL
  );

-- Step 5: Create inventory levels
INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  ii.id,
  (SELECT id FROM stock_location LIMIT 1),
  CASE 
    WHEN ii.sku LIKE 'IPHONE%' THEN 100
    WHEN ii.sku LIKE 'MBA%' THEN 50
    ELSE 200
  END,
  0,
  CASE 
    WHEN ii.sku LIKE 'IPHONE%' THEN 100
    WHEN ii.sku LIKE 'MBA%' THEN 50
    ELSE 200
  END,
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
WHERE pv.deleted_at IS NULL
  AND ii.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_variant_inventory_item 
    WHERE variant_id = pv.id 
      AND inventory_item_id = ii.id
  );

-- Step 7: Link all products to sales channel
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p
CROSS JOIN sales_channel sc
WHERE p.deleted_at IS NULL 
  AND sc.name = 'Default Sales Channel'
  AND NOT EXISTS (
    SELECT 1 FROM product_sales_channel 
    WHERE product_id = p.id 
      AND sales_channel_id = sc.id
  );

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
SELECT 'Inventory Levels', COUNT(*)::text 
FROM inventory_level
UNION ALL
SELECT 'Sales Channel Links', COUNT(*)::text 
FROM product_sales_channel WHERE deleted_at IS NULL;

-- Show products with prices
SELECT 
  p.title as product,
  pv.sku,
  pr.amount,
  pr.currency_code,
  ii.sku as inventory_sku,
  il.stocked_quantity
FROM product p
JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
LEFT JOIN price_set ps ON pvps.price_set_id = ps.id
LEFT JOIN price pr ON ps.id = pr.price_set_id
LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
LEFT JOIN inventory_item ii ON pvii.inventory_item_id = ii.id
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id
WHERE p.deleted_at IS NULL 
  AND pv.deleted_at IS NULL
ORDER BY p.title, pv.sku;
