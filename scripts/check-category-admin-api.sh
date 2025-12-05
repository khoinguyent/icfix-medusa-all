#!/bin/bash

# Script to check category via Admin API
# Usage: ./scripts/check-category-admin-api.sh

set -e

BACKEND_URL="${BACKEND_URL:-https://icfix.duckdns.org}"
ADMIN_EMAIL="admin@icfix.vn"
ADMIN_PASSWORD="admin123@"

echo "======================================"
echo "Category Check via Admin API"
echo "======================================"
echo "Backend: $BACKEND_URL"
echo ""

# Step 1: Login to get admin token
echo "1. Logging in to Admin API..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/admin/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "   ❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "   ✅ Login successful"
echo ""

# Step 2: Get all categories
echo "2. Fetching all categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$BACKEND_URL/admin/product-categories?limit=100" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq -r '.product_categories | length' 2>/dev/null || echo "0")
echo "   Found $CATEGORY_COUNT categories"
echo ""

# Step 3: Search for IC Fix Face category
echo "3. Searching for 'IC Fix Face' category..."
IC_FIX_CATEGORY=$(echo "$CATEGORIES_RESPONSE" | jq -r '.product_categories[] | select(.name | contains("IC Fix Face") or contains("Face"))' 2>/dev/null || echo "")

if [ -n "$IC_FIX_CATEGORY" ] && [ "$IC_FIX_CATEGORY" != "null" ]; then
    echo "   ✅ Category found!"
    echo ""
    echo "$IC_FIX_CATEGORY" | jq -r '{
        id: .id,
        name: .name,
        handle: .handle,
        is_active: .is_active,
        is_internal: .is_internal,
        rank: .rank,
        sales_channels: (.sales_channels | length // 0),
        products: (.products | length // 0)
    }'
    echo ""
    
    CATEGORY_ID=$(echo "$IC_FIX_CATEGORY" | jq -r '.id')
    IS_ACTIVE=$(echo "$IC_FIX_CATEGORY" | jq -r '.is_active')
    IS_INTERNAL=$(echo "$IC_FIX_CATEGORY" | jq -r '.is_internal')
    SALES_CHANNELS=$(echo "$IC_FIX_CATEGORY" | jq -r '.sales_channels | length' 2>/dev/null || echo "0")
    
    echo "4. Category Status Analysis:"
    echo ""
    if [ "$IS_ACTIVE" = "true" ]; then
        echo "   ✅ Category is active"
    else
        echo "   ❌ Category is NOT active (is_active: $IS_ACTIVE)"
    fi
    
    if [ "$IS_INTERNAL" = "true" ]; then
        echo "   ❌ Category is INTERNAL (not visible in store)"
    else
        echo "   ✅ Category is NOT internal (visible in store)"
    fi
    
    if [ "$SALES_CHANNELS" -gt 0 ]; then
        echo "   ✅ Category has $SALES_CHANNELS sales channel(s) associated"
        echo ""
        echo "   Sales Channels:"
        echo "$IC_FIX_CATEGORY" | jq -r '.sales_channels[]?.name // .sales_channels[]?.id' 2>/dev/null | while read channel; do
            echo "   - $channel"
        done
    else
        echo "   ❌ Category has NO sales channels associated"
        echo "   This is why it's not showing in Store API!"
    fi
    
    echo ""
    echo "5. Getting detailed category info..."
    DETAIL_RESPONSE=$(curl -s -X GET "$BACKEND_URL/admin/product-categories/$CATEGORY_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "$DETAIL_RESPONSE" | jq -r '{
        id: .product_category.id,
        name: .product_category.name,
        handle: .product_category.handle,
        description: .product_category.description,
        is_active: .product_category.is_active,
        is_internal: .product_category.is_internal,
        sales_channels: (.product_category.sales_channels | map(.name) // []),
        product_count: (.product_category.products | length // 0)
    }' 2>/dev/null || echo "Could not parse detailed response"
    
else
    echo "   ❌ Category 'IC Fix Face' not found"
    echo ""
    echo "   Available categories (first 10):"
    echo "$CATEGORIES_RESPONSE" | jq -r '.product_categories[0:10][] | "   - \(.name) (handle: \(.handle), active: \(.is_active))"' 2>/dev/null
fi

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "If category is not showing in Store API, check:"
echo "  1. is_active = true"
echo "  2. is_internal = false"
echo "  3. Has at least one sales channel associated"
echo ""
echo "To fix in Admin UI:"
echo "  1. Go to: $BACKEND_URL/app"
echo "  2. Products → Categories"
echo "  3. Edit the category"
echo "  4. Ensure it's published and associated with a sales channel"

