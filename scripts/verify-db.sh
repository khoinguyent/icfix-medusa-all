#!/bin/bash

# Database verification script
# Run this inside the backend container or with docker exec

echo "========================================"
echo "🔍 Verifying Database Setup and Seed Data"
echo "========================================"
echo ""

# Get DB credentials
DB_USER=$(docker exec icfix-postgres printenv POSTGRES_USER)
DB_NAME=$(docker exec icfix-postgres printenv POSTGRES_DB)

echo "📊 1. Database Connection..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -3
echo ""

echo "📋 2. Core Tables..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>&1 | grep -E '(table_count|row)'
echo ""

echo "📦 3. Products..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as product_count FROM product;" 2>&1 | grep -E '(product_count|row)'
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, title, status FROM product LIMIT 3;" 2>&1 | grep -E '(id|title|status|row)' | head -5
echo ""

echo "🌍 4. Regions..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, name, currency_code FROM region LIMIT 5;" 2>&1 | grep -E '(id|name|currency|row)'
echo ""

echo "📂 5. Categories..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as category_count FROM product_category;" 2>&1 | grep -E '(category_count|row)'
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, name, handle FROM product_category LIMIT 5;" 2>&1 | grep -E '(id|name|handle|row)'
echo ""

echo "🏪 6. Store Configuration..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, name, default_currency_code FROM store LIMIT 3;" 2>&1 | grep -E '(id|name|default_currency|row)'
echo ""

echo "📢 7. Sales Channels..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, name FROM sales_channel LIMIT 5;" 2>&1 | grep -E '(id|name|row)'
echo ""

echo "🎁 8. Promotional Tables..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('promotional_banner', 'service_feature', 'testimonial', 'homepage_section');" 2>&1 | grep -E '(table_name|promotional|service|testimonial|homepage|row)'
echo ""

echo "👤 9. Users/Admins..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as user_count FROM \"user\";" 2>&1 | grep -E '(user_count|row)'
echo ""

echo "📊 10. Migrations Status..."
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as migration_count FROM mikro_orm_migrations;" 2>&1 | grep -E '(migration_count|row)'
docker exec icfix-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT name, executed_at FROM mikro_orm_migrations ORDER BY executed_at DESC LIMIT 5;" 2>&1 | grep -E '(name|executed_at|row)' | head -7
echo ""

echo "🔧 11. Running Ensure Promotional Tables Script..."
docker exec icfix-backend npx medusa exec ./src/scripts/ensure-promotional-tables.ts 2>&1 | tail -5
echo ""

echo "========================================"
echo "✅ Verification Complete!"
echo "========================================"
