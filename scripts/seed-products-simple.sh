#!/bin/bash
# Simple script to seed products and categories using Admin API
# This requires admin authentication

BACKEND_URL="http://localhost:9002"
EMAIL="admin@icfix.vn"
PASSWORD="admin123@"

echo "🌱 Seeding products and categories..."

# Step 1: Login
echo "Step 1: Logging in..."
COOKIE_FILE=$(mktemp)
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/admin/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
  -c "${COOKIE_FILE}")

if ! echo "$LOGIN_RESPONSE" | grep -q "user"; then
  echo "⚠️  Login failed. Creating admin user first..."
  # Try to create user via CLI
  docker exec medusa-backend-local sh -c "cd /app/.medusa/server && npx @medusajs/cli user -e ${EMAIL} -p ${PASSWORD} --first-name Admin --last-name User" 2>&1 | tail -5
  
  # Retry login
  LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/admin/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
    -c "${COOKIE_FILE}")
fi

if echo "$LOGIN_RESPONSE" | grep -q "user"; then
  echo "✓ Login successful"
else
  echo "✗ Cannot login. Please create admin user manually:"
  echo "  docker exec medusa-backend-local sh -c 'cd /app/.medusa/server && npx @medusajs/cli user -e ${EMAIL} -p ${PASSWORD}'"
  rm -f "${COOKIE_FILE}"
  exit 1
fi

# Step 2: Create Categories
echo "Step 2: Creating categories..."
CATEGORIES=(
  '{"name":"Smartphones","is_active":true,"description":"Latest smartphones and mobile devices"}'
  '{"name":"Accessories","is_active":true,"description":"Phone cases, chargers, and more"}'
  '{"name":"Components","is_active":true,"description":"Phone batteries, screens, and replacement parts"}'
  '{"name":"Laptops","is_active":true,"description":"Laptops and computing devices"}'
)

CATEGORY_IDS=()
for category in "${CATEGORIES[@]}"; do
  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/admin/product-categories" \
    -H "Content-Type: application/json" \
    -b "${COOKIE_FILE}" \
    -d "$category")
  
  if echo "$RESPONSE" | grep -q "product_category"; then
    CAT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    CATEGORY_IDS+=("$CAT_ID")
    echo "✓ Created category"
  else
    echo "✗ Failed or already exists: $(echo "$RESPONSE" | head -c 100)"
  fi
done

echo "✅ Created ${#CATEGORY_IDS[@]} categories"

# Note: Product creation is complex and requires variants, prices, etc.
# Better to use admin UI or the full seed script
echo "💡 Tip: Use admin UI at http://localhost:3001 to create products, or run the full seed script in development mode"

rm -f "${COOKIE_FILE}"
