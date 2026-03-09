-- ===========================================
-- Seed Promotional Content Data
-- Nextmerce UI Style Sample Data
-- ===========================================

-- 1. Hero Banners (Carousel Slides)
-- ===========================================
INSERT INTO promotional_banner (
  id, title, subtitle, description, image_url, mobile_image_url,
  link_type, link_value, button_text, display_order, is_active,
  position, created_at, updated_at
) VALUES
(
  'banner_001',
  'iPhone 17 Pro Max',
  'New Arrival',
  'Experience the future of technology with the latest iPhone 17 Pro Max. Featuring cutting-edge design and powerful performance.',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1920&q=80',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  'product',
  'iphone-17-pro-max',
  'Shop Now',
  1,
  true,
  'hero',
  NOW(),
  NOW()
),
(
  'banner_002',
  'MacBook Air M3',
  'Latest Technology',
  'Supercharged by the M3 chip. Lightweight, powerful, and designed for the modern professional.',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1920&q=80',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
  'product',
  'macbook-air-m3',
  'Discover More',
  2,
  true,
  'hero',
  NOW(),
  NOW()
),
(
  'banner_003',
  'Tech Accessories',
  'Summer Sale',
  'Upgrade your setup with premium accessories. Limited time offer - save up to 30% on selected items.',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'collection',
  'accessories',
  'View Collection',
  3,
  true,
  'hero',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  mobile_image_url = EXCLUDED.mobile_image_url,
  link_type = EXCLUDED.link_type,
  link_value = EXCLUDED.link_value,
  button_text = EXCLUDED.button_text,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  position = EXCLUDED.position,
  updated_at = NOW();

-- 2. Service Features (Free Shipping, Returns, etc.)
-- ===========================================
INSERT INTO service_feature (
  id, title, description, icon_url, display_order, is_active,
  created_at, updated_at
) VALUES
(
  'svc_001',
  'Free Shipping',
  'For all orders over $200',
  'https://cdn-icons-png.flaticon.com/512/2731/2731816.png',
  1,
  true,
  NOW(),
  NOW()
),
(
  'svc_002',
  '1 & 1 Returns',
  'Cancellation after 1 day',
  'https://cdn-icons-png.flaticon.com/512/2731/2731878.png',
  2,
  true,
  NOW(),
  NOW()
),
(
  'svc_003',
  '100% Secure Payments',
  'Guarantee secure payments',
  'https://cdn-icons-png.flaticon.com/512/2731/2731724.png',
  3,
  true,
  NOW(),
  NOW()
),
(
  'svc_004',
  '24/7 Dedicated Support',
  'Anywhere & anytime',
  'https://cdn-icons-png.flaticon.com/512/2731/2731908.png',
  4,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. Testimonials (Customer Reviews)
-- ===========================================
INSERT INTO testimonial (
  id, customer_name, customer_title, customer_avatar_url,
  rating, comment, display_order, is_active,
  created_at, updated_at
) VALUES
(
  'test_001',
  'Davis Dorwart',
  'Serial Entrepreneur',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  5,
  'Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula. The quality and service exceeded my expectations!',
  1,
  true,
  NOW(),
  NOW()
),
(
  'test_002',
  'Wilson Dias',
  'Backend Developer',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  5,
  'Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula. Fast shipping and excellent customer support.',
  2,
  true,
  NOW(),
  NOW()
),
(
  'test_003',
  'Sarah Johnson',
  'Marketing Manager',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  5,
  'Great products and amazing service! I''ve been a customer for over a year and the quality never disappoints. Highly recommended!',
  3,
  true,
  NOW(),
  NOW()
),
(
  'test_004',
  'Michael Chen',
  'Product Designer',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
  4,
  'The website is beautifully designed and easy to navigate. Product delivery was prompt and packaging was excellent. Will shop again!',
  4,
  true,
  NOW(),
  NOW()
),
(
  'test_005',
  'Emma Williams',
  'Freelance Writer',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  5,
  'Outstanding customer service and premium quality products. The return process was hassle-free and the team was very responsive.',
  5,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  customer_title = EXCLUDED.customer_title,
  customer_avatar_url = EXCLUDED.customer_avatar_url,
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 4. Homepage Sections
-- ===========================================
-- Note: These sections will be configured to display featured products
-- You'll need to update collection_id/category_id after creating collections/categories
INSERT INTO homepage_section (
  id, section_type, title, subtitle, display_order, is_active,
  collection_id, category_id, product_limit, show_category_images,
  created_at, updated_at
) VALUES
(
  'section_001',
  'featured_products',
  'Featured Products',
  'Discover our handpicked selection of premium products',
  1,
  true,
  NULL, -- Will be set after collections are created
  NULL,
  8,
  false,
  NOW(),
  NOW()
),
(
  'section_002',
  'featured_products',
  'New Arrivals',
  'Check out the latest additions to our catalog',
  2,
  true,
  NULL, -- Will be set after collections are created
  NULL,
  6,
  false,
  NOW(),
  NOW()
),
(
  'section_003',
  'categories',
  'Shop by Category',
  'Browse products by category',
  3,
  true,
  NULL,
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
),
(
  'section_004',
  'featured_products',
  'Best Sellers',
  'Our most popular products this month',
  4,
  true,
  NULL, -- Will be set after collections are created
  NULL,
  6,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  collection_id = EXCLUDED.collection_id,
  category_id = EXCLUDED.category_id,
  product_limit = EXCLUDED.product_limit,
  show_category_images = EXCLUDED.show_category_images,
  updated_at = NOW();

-- Success message
SELECT 'Promotional content data seeded successfully!' as status;

