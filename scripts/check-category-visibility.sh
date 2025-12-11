#!/bin/bash

# Script to check if a category is visible on the storefront
# Usage: ./scripts/check-category-visibility.sh <category-handle>

set -e

CATEGORY_HANDLE=${1:-""}

if [ -z "$CATEGORY_HANDLE" ]; then
  echo "Usage: $0 <category-handle>"
  echo "Example: $0 electronics"
  exit 1
fi

echo "🔍 Checking category visibility for: $CATEGORY_HANDLE"
echo ""

# Get publishable key
PUBLISHABLE_KEY=$(docker exec icfix-postgres psql -U icfix_user icfix_db -t -c "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;" | xargs)

if [ -z "$PUBLISHABLE_KEY" ]; then
  echo "❌ Error: Could not find publishable API key"
  exit 1
fi

echo "📋 Checking category via Store API..."
echo ""

# Check category via store API
RESPONSE=$(docker exec icfix-backend curl -s -X GET \
  "http://localhost:9000/store/product-categories?handle=$CATEGORY_HANDLE" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -H "Content-Type: application/json")

CATEGORY_COUNT=$(echo "$RESPONSE" | docker exec -i icfix-backend node -e "
  const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  console.log(data.product_categories?.length || 0);
")

if [ "$CATEGORY_COUNT" -eq 0 ]; then
  echo "❌ Category not found in Store API"
  echo ""
  echo "Possible reasons:"
  echo "  1. Category is not published"
  echo "  2. Category is not associated with a sales channel"
  echo "  3. Category handle is incorrect"
  echo ""
  echo "Checking in Admin API..."
  
  # Check via admin API (requires admin token)
  ADMIN_TOKEN=$(docker exec icfix-postgres psql -U icfix_user icfix_db -t -c "SELECT token FROM api_key WHERE type='secret' ORDER BY created_at DESC LIMIT 1;" | xargs)
  
  if [ -n "$ADMIN_TOKEN" ]; then
    ADMIN_RESPONSE=$(docker exec icfix-backend curl -s -X GET \
      "http://localhost:9000/admin/product-categories?handle=$CATEGORY_HANDLE" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json")
    
    echo "$ADMIN_RESPONSE" | docker exec -i icfix-backend node -e "
      const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      const cat = data.product_categories?.[0];
      if (cat) {
        console.log('Category found in Admin API:');
        console.log('  ID:', cat.id);
        console.log('  Name:', cat.name);
        console.log('  Handle:', cat.handle);
        console.log('  Is Active:', cat.is_active);
        console.log('  Is Internal:', cat.is_internal);
        console.log('  Rank:', cat.rank);
        console.log('  Sales Channels:', cat.sales_channels?.length || 0);
        if (cat.sales_channels && cat.sales_channels.length > 0) {
          console.log('  Sales Channel IDs:', cat.sales_channels.map(sc => sc.id).join(', '));
        } else {
          console.log('  ⚠️  WARNING: Category is not associated with any sales channel!');
        }
      } else {
        console.log('Category not found in Admin API either');
      }
    "
  fi
else
  echo "✅ Category found in Store API"
  echo "$RESPONSE" | docker exec -i icfix-backend node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
    const cat = data.product_categories[0];
    console.log('  Name:', cat.name);
    console.log('  Handle:', cat.handle);
    console.log('  Products:', cat.products?.length || 0);
  "
fi

echo ""
echo "💡 To fix visibility issues:"
echo "  1. Ensure category is published (is_active: true, is_internal: false)"
echo "  2. Associate category with a sales channel in Admin UI"
echo "  3. Ensure products are associated with the category"
echo "  4. Trigger cache revalidation: ./scripts/revalidate-cache.sh"

