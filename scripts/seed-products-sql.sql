-- Seed Products and Assign to Categories
-- This script creates products with variants, options, prices, and category assignments

-- Get required IDs
DO $$
DECLARE
  sales_channel_id text;
  shipping_profile_id text;
  smartphones_cat_id text;
  accessories_cat_id text;
  components_cat_id text;
  laptops_cat_id text;
  
  -- Product IDs
  iphone_product_id text;
  charger_product_id text;
  battery_product_id text;
  macbook_product_id text;
  
  -- Variant IDs
  variant_id text;
  option_id text;
  option_value_id text;
  price_id text;
  inventory_item_id text;
BEGIN
  -- Get IDs
  SELECT id INTO sales_channel_id FROM sales_channel WHERE name = 'Default Sales Channel' LIMIT 1;
  SELECT id INTO shipping_profile_id FROM shipping_profile LIMIT 1;
  SELECT id INTO smartphones_cat_id FROM product_category WHERE name = 'Smartphones' LIMIT 1;
  SELECT id INTO accessories_cat_id FROM product_category WHERE name = 'Accessories' LIMIT 1;
  SELECT id INTO components_cat_id FROM product_category WHERE name = 'Components' LIMIT 1;
  SELECT id INTO laptops_cat_id FROM product_category WHERE name = 'Laptops' LIMIT 1;

  -- ============================================
  -- Product 1: iPhone 15 Pro
  -- ============================================
  iphone_product_id := gen_random_uuid()::text;
  
  INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
  VALUES (
    iphone_product_id,
    'iPhone 15 Pro',
    'iphone-15-pro',
    'iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system.',
    'published',
    '187',
    true,
    false,
    NOW(),
    NOW()
  );

  -- Link to category
  INSERT INTO product_category_product (id, product_category_id, product_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, smartphones_cat_id, iphone_product_id, NOW(), NOW());

  -- Link to sales channel
  INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, iphone_product_id, sales_channel_id, NOW(), NOW());

  -- Create options
  -- Storage option
  option_id := gen_random_uuid()::text;
  INSERT INTO product_option (id, title, product_id, created_at, updated_at)
  VALUES (option_id, 'Storage', iphone_product_id, NOW(), NOW());

  INSERT INTO product_option_value (id, value, product_option_id, variant_id, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, '128GB', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, '256GB', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, '512GB', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, '1TB', option_id, NULL, NOW(), NOW());

  -- Color option
  option_id := gen_random_uuid()::text;
  INSERT INTO product_option (id, title, product_id, created_at, updated_at)
  VALUES (option_id, 'Color', iphone_product_id, NOW(), NOW());

  INSERT INTO product_option_value (id, value, product_option_id, variant_id, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, 'Natural Titanium', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, 'Blue Titanium', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, 'White Titanium', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, 'Black Titanium', option_id, NULL, NOW(), NOW());

  -- Create variants (simplified - just a few key variants)
  -- Variant 1: 128GB / Natural Titanium
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, '128GB / Natural Titanium', 'IPHONE15PRO-128-NAT', iphone_product_id, true, false, NOW(), NOW());

  -- Price for variant 1
  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 28900000, variant_id, NOW(), NOW());

  -- Variant 2: 256GB / Natural Titanium
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, '256GB / Natural Titanium', 'IPHONE15PRO-256-NAT', iphone_product_id, true, false, NOW(), NOW());

  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 32900000, variant_id, NOW(), NOW());

  -- Product image
  INSERT INTO image (id, url, metadata, created_at, updated_at)
  VALUES (gen_random_uuid()::text, 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png', '{"product_id": "' || iphone_product_id || '"}', NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Product 2: USB-C Fast Charger 67W
  -- ============================================
  charger_product_id := gen_random_uuid()::text;
  
  INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
  VALUES (
    charger_product_id,
    'USB-C Fast Charger 67W',
    'usbc-fast-charger-67w',
    'High-speed 67W USB-C power adapter with GaN technology.',
    'published',
    '150',
    true,
    false,
    NOW(),
    NOW()
  );

  INSERT INTO product_category_product (id, product_category_id, product_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, accessories_cat_id, charger_product_id, NOW(), NOW());

  INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, charger_product_id, sales_channel_id, NOW(), NOW());

  -- Type option
  option_id := gen_random_uuid()::text;
  INSERT INTO product_option (id, title, product_id, created_at, updated_at)
  VALUES (option_id, 'Type', charger_product_id, NOW(), NOW());

  INSERT INTO product_option_value (id, value, product_option_id, variant_id, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, 'Charger Only', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, 'With USB-C Cable', option_id, NULL, NOW(), NOW());

  -- Variant 1: Charger Only
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, 'Charger Only', 'CHARGER67W-ONLY', charger_product_id, true, false, NOW(), NOW());

  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 890000, variant_id, NOW(), NOW());

  -- Variant 2: With USB-C Cable
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, 'With USB-C Cable', 'CHARGER67W-USBC', charger_product_id, true, false, NOW(), NOW());

  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 1290000, variant_id, NOW(), NOW());

  INSERT INTO image (id, url, metadata, created_at, updated_at)
  VALUES (gen_random_uuid()::text, 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png', '{"product_id": "' || charger_product_id || '"}', NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Product 3: MacBook Air M3
  -- ============================================
  macbook_product_id := gen_random_uuid()::text;
  
  INSERT INTO product (id, title, handle, description, status, weight, discountable, is_giftcard, created_at, updated_at)
  VALUES (
    macbook_product_id,
    'MacBook Air M3',
    'macbook-air-m3',
    'MacBook Air with M3 chip delivers exceptional performance and battery life.',
    'published',
    '1240',
    true,
    false,
    NOW(),
    NOW()
  );

  INSERT INTO product_category_product (id, product_category_id, product_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, laptops_cat_id, macbook_product_id, NOW(), NOW());

  INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
  VALUES (gen_random_uuid()::text, macbook_product_id, sales_channel_id, NOW(), NOW());

  -- Configuration option
  option_id := gen_random_uuid()::text;
  INSERT INTO product_option (id, title, product_id, created_at, updated_at)
  VALUES (option_id, 'Configuration', macbook_product_id, NOW(), NOW());

  INSERT INTO product_option_value (id, value, product_option_id, variant_id, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, '8GB RAM / 256GB SSD', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, '8GB RAM / 512GB SSD', option_id, NULL, NOW(), NOW());

  -- Color option
  option_id := gen_random_uuid()::text;
  INSERT INTO product_option (id, title, product_id, created_at, updated_at)
  VALUES (option_id, 'Color', macbook_product_id, NOW(), NOW());

  INSERT INTO product_option_value (id, value, product_option_id, variant_id, created_at, updated_at)
  VALUES 
    (gen_random_uuid()::text, 'Midnight', option_id, NULL, NOW(), NOW()),
    (gen_random_uuid()::text, 'Starlight', option_id, NULL, NOW(), NOW());

  -- Variant 1: 8GB RAM / 256GB SSD / Midnight
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, '8GB RAM / 256GB SSD / Midnight', 'MBA-M3-8-256-MID', macbook_product_id, true, false, NOW(), NOW());

  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 27900000, variant_id, NOW(), NOW());

  -- Variant 2: 8GB RAM / 512GB SSD / Starlight
  variant_id := gen_random_uuid()::text;
  INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, created_at, updated_at)
  VALUES (variant_id, '8GB RAM / 512GB SSD / Starlight', 'MBA-M3-8-512-STAR', macbook_product_id, true, false, NOW(), NOW());

  price_id := gen_random_uuid()::text;
  INSERT INTO money_amount (id, currency_code, amount, variant_id, created_at, updated_at)
  VALUES (price_id, 'vnd', 32900000, variant_id, NOW(), NOW());

  INSERT INTO image (id, url, metadata, created_at, updated_at)
  VALUES (gen_random_uuid()::text, 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png', '{"product_id": "' || macbook_product_id || '"}', NOW(), NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Products created successfully!';
END $$;

-- Verify products were created
SELECT p.id, p.title, p.handle, p.status, pc.name as category
FROM product p
LEFT JOIN product_category_product pcp ON p.id = pcp.product_id
LEFT JOIN product_category pc ON pcp.product_category_id = pc.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at;
