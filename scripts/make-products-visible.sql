-- Make Products Visible on Store
-- Creates variants, prices, options, and inventory for all products

DO $$
DECLARE
  -- Product IDs
  iphone_product_id text;
  charger_product_id text;
  macbook_product_id text;
  battery_product_id text;
  
  -- Variant IDs
  variant_id text;
  
  -- Option IDs
  storage_option_id text;
  color_option_id text;
  type_option_id text;
  config_option_id text;
  model_option_id text;
  
  -- Price set and price IDs
  price_set_id text;
  price_id text;
  
  -- Inventory
  inventory_item_id text;
  stock_location_id text;
  
  -- Sales channel
  sales_channel_id text;
BEGIN
  -- Get product IDs
  SELECT id INTO iphone_product_id FROM product WHERE handle = 'iphone-15-pro' LIMIT 1;
  SELECT id INTO charger_product_id FROM product WHERE handle = 'usbc-fast-charger-67w' LIMIT 1;
  SELECT id INTO macbook_product_id FROM product WHERE handle = 'macbook-air-m3' LIMIT 1;
  SELECT id INTO battery_product_id FROM product WHERE handle = 'iphone-battery-replacement' LIMIT 1;
  
  -- Get stock location
  SELECT id INTO stock_location_id FROM stock_location LIMIT 1;
  IF stock_location_id IS NULL THEN
    -- Create a stock location if it doesn't exist
    stock_location_id := gen_random_uuid()::text;
    INSERT INTO stock_location (id, name, address, created_at, updated_at)
    VALUES (stock_location_id, 'Main Warehouse', '{"address_1": "123 Main St", "city": "Ho Chi Minh City", "country_code": "vn"}'::jsonb, NOW(), NOW());
  END IF;
  
  -- Get sales channel
  SELECT id INTO sales_channel_id FROM sales_channel WHERE name = 'Default Sales Channel' LIMIT 1;

  -- ============================================
  -- iPhone 15 Pro - Create Options and Variants
  -- ============================================
  IF iphone_product_id IS NOT NULL THEN
    -- Storage option
    storage_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (storage_option_id, 'Storage', iphone_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO storage_option_id;
    
    -- Get storage option ID if it already exists
    IF storage_option_id IS NULL THEN
      SELECT id INTO storage_option_id FROM product_option WHERE product_id = iphone_product_id AND title = 'Storage' LIMIT 1;
    END IF;
    
    -- Color option
    color_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (color_option_id, 'Color', iphone_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO color_option_id;
    
    IF color_option_id IS NULL THEN
      SELECT id INTO color_option_id FROM product_option WHERE product_id = iphone_product_id AND title = 'Color' LIMIT 1;
    END IF;
    
    -- Create variant: 128GB / Natural Titanium
    variant_id := gen_random_uuid()::text;
    INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
    VALUES (variant_id, '128GB / Natural Titanium', 'IPHONE15PRO-128-NAT', iphone_product_id, true, false, NOW(), NOW());
    
    -- Create price set and price
    price_set_id := gen_random_uuid()::text;
    INSERT INTO price_set (id, created_at, updated_at) VALUES (price_set_id, NOW(), NOW());
    
    INSERT INTO product_variant_price_set (product_variant_id, price_set_id, created_at, updated_at)
    VALUES (variant_id, price_set_id, NOW(), NOW());
    
    price_id := gen_random_uuid()::text;
    INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
    VALUES (price_id, price_set_id, 'vnd', 28900000, '{"value": 28900000}'::jsonb, NOW(), NOW());
    
    -- Link variant to options
    INSERT INTO product_variant_option_value (id, product_variant_id, product_option_id, product_option_value_id, created_at, updated_at)
    SELECT gen_random_uuid()::text, variant_id, storage_option_id, pov.id, NOW(), NOW()
    FROM product_option_value pov
    WHERE pov.product_option_id = storage_option_id AND pov.value = '128GB'
    LIMIT 1
    ON CONFLICT DO NOTHING;
    
    INSERT INTO product_variant_option_value (id, product_variant_id, product_option_id, product_option_value_id, created_at, updated_at)
    SELECT gen_random_uuid()::text, variant_id, color_option_id, pov.id, NOW(), NOW()
    FROM product_option_value pov
    WHERE pov.product_option_id = color_option_id AND pov.value = 'Natural Titanium'
    LIMIT 1
    ON CONFLICT DO NOTHING;
    
    -- Create inventory item and level
    inventory_item_id := gen_random_uuid()::text;
    INSERT INTO inventory_item (id, sku, created_at, updated_at)
    VALUES (inventory_item_id, 'IPHONE15PRO-128-NAT', NOW(), NOW())
    ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO inventory_item_id;
    
    IF inventory_item_id IS NULL THEN
      SELECT id INTO inventory_item_id FROM inventory_item WHERE sku = 'IPHONE15PRO-128-NAT' LIMIT 1;
    END IF;
    
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
    SELECT gen_random_uuid()::text, inventory_item_id, stock_location_id, 100, 0, 100, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM inventory_level WHERE inventory_item_id = inventory_item_id AND location_id = stock_location_id);
    
    -- Link variant to inventory item
    INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
    VALUES (gen_random_uuid()::text, variant_id, inventory_item_id, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- USB-C Charger - Create Variant
  -- ============================================
  IF charger_product_id IS NOT NULL THEN
    -- Type option
    type_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (type_option_id, 'Type', charger_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO type_option_id;
    
    IF type_option_id IS NULL THEN
      SELECT id INTO type_option_id FROM product_option WHERE product_id = charger_product_id AND title = 'Type' LIMIT 1;
    END IF;
    
    -- Variant: Charger Only
    variant_id := gen_random_uuid()::text;
    INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
    VALUES (variant_id, 'Charger Only', 'CHARGER67W-ONLY', charger_product_id, true, false, NOW(), NOW());
    
    price_set_id := gen_random_uuid()::text;
    INSERT INTO price_set (id, created_at, updated_at) VALUES (price_set_id, NOW(), NOW());
    
    INSERT INTO product_variant_price_set (product_variant_id, price_set_id, created_at, updated_at)
    VALUES (variant_id, price_set_id, NOW(), NOW());
    
    price_id := gen_random_uuid()::text;
    INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
    VALUES (price_id, price_set_id, 'vnd', 890000, '{"value": 890000}'::jsonb, NOW(), NOW());
    
    -- Inventory
    inventory_item_id := gen_random_uuid()::text;
    INSERT INTO inventory_item (id, sku, created_at, updated_at)
    VALUES (inventory_item_id, 'CHARGER67W-ONLY', NOW(), NOW())
    ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO inventory_item_id;
    
    IF inventory_item_id IS NULL THEN
      SELECT id INTO inventory_item_id FROM inventory_item WHERE sku = 'CHARGER67W-ONLY' LIMIT 1;
    END IF;
    
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
    SELECT gen_random_uuid()::text, inventory_item_id, stock_location_id, 100, 0, 100, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM inventory_level WHERE inventory_item_id = inventory_item_id AND location_id = stock_location_id);
    
    INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
    VALUES (gen_random_uuid()::text, variant_id, inventory_item_id, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MacBook Air M3 - Create Variant
  -- ============================================
  IF macbook_product_id IS NOT NULL THEN
    -- Configuration option
    config_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (config_option_id, 'Configuration', macbook_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO config_option_id;
    
    IF config_option_id IS NULL THEN
      SELECT id INTO config_option_id FROM product_option WHERE product_id = macbook_product_id AND title = 'Configuration' LIMIT 1;
    END IF;
    
    -- Color option
    color_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (color_option_id, 'Color', macbook_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO color_option_id;
    
    IF color_option_id IS NULL THEN
      SELECT id INTO color_option_id FROM product_option WHERE product_id = macbook_product_id AND title = 'Color' LIMIT 1;
    END IF;
    
    -- Variant: 8GB RAM / 256GB SSD / Midnight
    variant_id := gen_random_uuid()::text;
    INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
    VALUES (variant_id, '8GB RAM / 256GB SSD / Midnight', 'MBA-M3-8-256-MID', macbook_product_id, true, false, NOW(), NOW());
    
    price_set_id := gen_random_uuid()::text;
    INSERT INTO price_set (id, created_at, updated_at) VALUES (price_set_id, NOW(), NOW());
    
    INSERT INTO product_variant_price_set (product_variant_id, price_set_id, created_at, updated_at)
    VALUES (variant_id, price_set_id, NOW(), NOW());
    
    price_id := gen_random_uuid()::text;
    INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
    VALUES (price_id, price_set_id, 'vnd', 27900000, '{"value": 27900000}'::jsonb, NOW(), NOW());
    
    -- Inventory
    inventory_item_id := gen_random_uuid()::text;
    INSERT INTO inventory_item (id, sku, created_at, updated_at)
    VALUES (inventory_item_id, 'MBA-M3-8-256-MID', NOW(), NOW())
    ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO inventory_item_id;
    
    IF inventory_item_id IS NULL THEN
      SELECT id INTO inventory_item_id FROM inventory_item WHERE sku = 'MBA-M3-8-256-MID' LIMIT 1;
    END IF;
    
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
    SELECT gen_random_uuid()::text, inventory_item_id, stock_location_id, 50, 0, 50, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM inventory_level WHERE inventory_item_id = inventory_item_id AND location_id = stock_location_id);
    
    INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
    VALUES (gen_random_uuid()::text, variant_id, inventory_item_id, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- iPhone Battery Kit - Create Variant
  -- ============================================
  IF battery_product_id IS NOT NULL THEN
    -- Model option
    model_option_id := gen_random_uuid()::text;
    INSERT INTO product_option (id, title, product_id, created_at, updated_at)
    VALUES (model_option_id, 'Model', battery_product_id, NOW(), NOW())
    ON CONFLICT (product_id, title) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO model_option_id;
    
    IF model_option_id IS NULL THEN
      SELECT id INTO model_option_id FROM product_option WHERE product_id = battery_product_id AND title = 'Model' LIMIT 1;
    END IF;
    
    -- Variant: iPhone 13
    variant_id := gen_random_uuid()::text;
    INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
    VALUES (variant_id, 'iPhone 13', 'BATTERY-IP13', battery_product_id, true, false, NOW(), NOW());
    
    price_set_id := gen_random_uuid()::text;
    INSERT INTO price_set (id, created_at, updated_at) VALUES (price_set_id, NOW(), NOW());
    
    INSERT INTO product_variant_price_set (product_variant_id, price_set_id, created_at, updated_at)
    VALUES (variant_id, price_set_id, NOW(), NOW());
    
    price_id := gen_random_uuid()::text;
    INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
    VALUES (price_id, price_set_id, 'vnd', 890000, '{"value": 890000}'::jsonb, NOW(), NOW());
    
    -- Inventory
    inventory_item_id := gen_random_uuid()::text;
    INSERT INTO inventory_item (id, sku, created_at, updated_at)
    VALUES (inventory_item_id, 'BATTERY-IP13', NOW(), NOW())
    ON CONFLICT (sku) WHERE deleted_at IS NULL DO NOTHING
    RETURNING id INTO inventory_item_id;
    
    IF inventory_item_id IS NULL THEN
      SELECT id INTO inventory_item_id FROM inventory_item WHERE sku = 'BATTERY-IP13' LIMIT 1;
    END IF;
    
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, available_quantity, created_at, updated_at)
    SELECT gen_random_uuid()::text, inventory_item_id, stock_location_id, 200, 0, 200, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM inventory_level WHERE inventory_item_id = inventory_item_id AND location_id = stock_location_id);
    
    INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
    VALUES (gen_random_uuid()::text, variant_id, inventory_item_id, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- Ensure all products are published and linked to sales channel
  UPDATE product SET status = 'published' WHERE deleted_at IS NULL AND status != 'published';
  
  -- Link all products to sales channel
  INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
  SELECT gen_random_uuid()::text, p.id, sales_channel_id, NOW(), NOW()
  FROM product p
  WHERE p.deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM product_sales_channel WHERE product_id = p.id AND sales_channel_id = sales_channel_id)
  ON CONFLICT (product_id, sales_channel_id) DO NOTHING;

  RAISE NOTICE 'Products configured successfully!';
END $$;

-- Verify results
SELECT 
  p.title as product,
  COUNT(DISTINCT pv.id) as variants,
  COUNT(DISTINCT po.id) as options,
  COUNT(DISTINCT ps.id) as price_sets,
  COUNT(DISTINCT ii.id) as inventory_items
FROM product p
LEFT JOIN product_variant pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
LEFT JOIN product_option po ON p.id = po.product_id AND po.deleted_at IS NULL
LEFT JOIN product_variant_price_set pvps ON pv.id = pvps.product_variant_id
LEFT JOIN price_set ps ON pvps.price_set_id = ps.id
LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
LEFT JOIN inventory_item ii ON pvii.inventory_item_id = ii.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title
ORDER BY p.title;
