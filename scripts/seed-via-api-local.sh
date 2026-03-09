#!/bin/bash
# Seed products and categories via Admin API
# Requires admin user to be created first

BACKEND_URL="${MEDUSA_BACKEND_URL:-http://localhost:9002}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@icfix.vn}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123@}"

echo "🌱 Seeding products and categories via API..."

# Login and get session cookie
echo "Logging in as admin..."
COOKIE_FILE=$(mktemp)
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/admin/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  -c "${COOKIE_FILE}")

if echo "$LOGIN_RESPONSE" | grep -q "user"; then
  echo "✓ Login successful"
else
  echo "✗ Login failed: $LOGIN_RESPONSE"
  exit 1
fi

# Create categories
echo "Creating categories..."
CATEGORIES=(
  '{"name":"Smartphones","is_active":true,"description":"Latest smartphones and mobile devices"}'
  '{"name":"Accessories","is_active":true,"description":"Phone cases, chargers, and more"}'
  '{"name":"Components","is_active":true,"description":"Phone batteries, screens, and replacement parts"}'
  '{"name":"Laptops","is_active":true,"description":"Laptops and computing devices"}'
)

for category in "${CATEGORIES[@]}"; do
  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/admin/product-categories" \
    -H "Content-Type: application/json" \
    -b "${COOKIE_FILE}" \
    -d "$category")
  
  if echo "$RESPONSE" | grep -q "product_category"; then
    echo "✓ Created category"
  else
    echo "✗ Failed: $RESPONSE"
  fi
done

echo "✅ Seeding complete!"
rm -f "${COOKIE_FILE}"
