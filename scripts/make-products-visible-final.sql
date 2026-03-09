-- Make Products Visible on Store
-- Creates variants, prices, and inventory for all products

-- Step 1: Create stock location
INSERT INTO stock_location (id, name, address, created_at, updated_at)
SELECT gen_random_uuid()::text, 'Main Warehouse', '{"address_1": "123 Main St", "city": "Ho Chi Minh City", "country_code": "vn"}'::jsonb, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stock_location LIMIT 1);

-- Step 2: Create variants for all products
-- iPhone 15 Pro
INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
SELECT gen_random_uuid()::text, '128GB / Natural Titanium', 'IPHONE15PRO-128-NAT', id, true, false, NOW(), NOW()
FROM product WHERE handle = 'iphone-15-pro' AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- USB-C Charger
INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
SELECT gen_random_uuid()::text, 'Charger Only', 'CHARGER67W-ONLY', id, true, false, NOW(), NOW()
FROM product WHERE handle = 'usbc-fast-charger-67w' AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- MacBook Air M3
INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
SELECT gen_random_uuid()::text, '8GB RAM / 256GB SSD / Midnight', 'MBA-M3-8-256-MID', id, true, false, NOW(), NOW()
FROM product WHERE handle = 'macbook-air-m3' AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- iPhone Battery
INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
SELECT gen_random_uuid()::text, 'iPhone 13', 'BATTERY-IP13', id, true, false, NOW(), NOW()
FROM product WHERE handle = 'iphone-battery-replacement' AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Step 3: Create prices for all variants
DO $$
DECLARE
  variant_record RECORD;
  price_set_id text;
  price_id text;
BEGIN
  FOR variant_record IN 
    SELECT pv.id, pv.sku, 
           CASE 
             WHEN pv.sku = 'IPHONE15PRO-128-NAT' THEN 28900000
             WHEN pv.sku = 'CHARGER67W-ONLY' THEN 890000
             WHEN pv.sku = 'MBA-M3-8-256-MID' THEN 27900000
             WHEN pv.sku = 'BATTERY-IP13' THEN 890000
           END as price_amount
    FROM product_variant pv
    WHERE pv.deleted_at IS NULL
      AND pv.sku IN ('IPHONE15PRO-128-NAT', 'CHARGER67W-ONLY', 'MBA-M3-8-256-MID', 'BATTERY-IP13')
  LOOP
    -- Create price set
    price_set_id := gen_random_uuid()::text;
    INSERT INTO price_set (id, created_at, updated_at) 
    VALUES (price_set_id, NOW(), NOW());
    
    -- Link variant to price set
    INSERT INTO product_variant_price_set (variant_id, price_set_id, created_at, updated_at)
    VALUES (variant_record.id, price_set_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Create price
    price_id := gen_random_uuid()::text;
    INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
    VALUES (price_id, price_set_id, 'vnd', variant_record.price_amount, 
            jsonb_build_object('value', variant_record.price_amount), NOW(), NOW());
  END LOOP;
END $$;

-- Step 4: Create inventory items and levels
DO $$
DECLARE
  variant_record RECORD;
  inventory_item_id text;
  stock_location_id text;
BEGIN
  SELECT id INTO stock_location_id FROM stock_location LIMIT 1;
  
  FOR variant_record IN 
    SELECT pv.id, pv.sku
    FROM product_variant pv
    WHERE pv.deleted_at IS NULL
      AND pv.sku IN ('IPHONE15PRO-128-NAT', 'CHARGER67W-ONLY', 'MBA-M3-8-256-MID', 'BATTERY-IP13')
  LOOP
    -- Create inventory item
    inventory_item_id := gen_random_uuid()::text;
    INSERT INTO inventory_item (id, sku, created_at, updated_at)
    VALUES (inventory_item_id, variant_record.sku, NOW(), NOW())
    ON CONFLICT (sku) WHERE deleted_at IS NULL DO UPDATE SET id = inventory_item.id
    RETURNING id INTO inventory_item_id;
    
    IF inventory_item_id IS NULL THEN
      SELECT id INTO inventory_item_id FROM inventory_item WHERE sku = variant_record.sku LIMIT 1;
    END IF;
    
    -- Create inventory level
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
    SELECT gen_random_uuid()::text, inventory_item_id, stock_location_id, 
           CASE WHEN variant_record.sku LIKE 'IPHONE%' THEN 100
                WHEN variant_record.sku LIKE 'MBA%' THEN 50
                ELSE 200 END,
           0,
           CASE WHEN variant_record.sku LIKE 'IPHONE%' THEN 100
                WHEN variant_record.sku LIKE 'MBA%' THEN 50
                ELSE 200 END,
           NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM inventory_level WHERE inventory_item_id = inventory_item_id AND location_id = stock_location_id);
    
    -- Link variant to inventory item
    INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
    VALUES (gen_random_uuid()::text, variant_record.id, inventory_item_id, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Step 5: Link all products to sales channel
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, sc.id, NOW(), NOW()
FROM product p, sales_channel sc
WHERE p.deleted_at IS NULL AND sc.name = 'Default Sales Channel'
ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

-- Verify results
SELECT 
  p.title as product,
  COUNT(DISTINCT pv.id) as variants,
  COUNT(DISTINCT ps.id) as price_sets,
  COUNT(DISTINCT ii.id) as inventory_items
FROM product p
LEFT JOIN product_variant pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
LEFT JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
LEFT JOIN price_set ps ON pvps.price_set_id = ps.id
LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
LEFT JOIN inventory_item ii ON pvii.inventory_item_id = ii.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title
ORDER BY p.title;
