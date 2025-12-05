#!/bin/bash

# Script to verify category visibility on frontend
# Usage: ./scripts/verify-category-frontend.sh

set -e

BACKEND_URL="${BACKEND_URL:-https://icfix.duckdns.org}"
STOREFRONT_URL="${STOREFRONT_URL:-https://store.icfix.vn}"
CATEGORY_HANDLE="${1:-ic-fix-face}"
REVALIDATE_SECRET="${REVALIDATE_SECRET:-ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615}"

echo "======================================"
echo "Category Frontend Verification"
echo "======================================"
echo "Category Handle: $CATEGORY_HANDLE"
echo "Backend: $BACKEND_URL"
echo "Frontend: $STOREFRONT_URL"
echo ""

# Step 1: Check if category exists in backend Store API
echo "1. Checking category in Backend Store API..."
PUBLISHABLE_KEY=$(curl -s "$BACKEND_URL/store/products?limit=1" | jq -r '.products[0].id' 2>/dev/null || echo "")

if [ -z "$PUBLISHABLE_KEY" ]; then
    echo "   ⚠️  Could not get publishable key, trying direct API call..."
    STORE_RESPONSE=$(curl -s "$BACKEND_URL/store/product-categories?handle=$CATEGORY_HANDLE")
else
    STORE_RESPONSE=$(curl -s "$BACKEND_URL/store/product-categories?handle=$CATEGORY_HANDLE" \
      -H "x-publishable-api-key: $PUBLISHABLE_KEY")
fi

CATEGORY_COUNT=$(echo "$STORE_RESPONSE" | jq -r '.product_categories | length' 2>/dev/null || echo "0")

if [ "$CATEGORY_COUNT" -gt 0 ]; then
    echo "   ✅ Category found in Store API"
    echo "$STORE_RESPONSE" | jq -r '.product_categories[0] | "   Name: \(.name)\n   Handle: \(.handle)\n   Products: \(.products | length // 0)"' 2>/dev/null
else
    echo "   ❌ Category NOT found in Store API"
    echo "   This means the category is either:"
    echo "   - Not published"
    echo "   - Not associated with a sales channel"
    echo "   - Handle is incorrect"
fi

echo ""
echo "2. Checking all categories in Store API..."
ALL_CATEGORIES=$(curl -s "$BACKEND_URL/store/product-categories?limit=100" | jq -r '.product_categories[]?.handle' 2>/dev/null || echo "")
if [ -n "$ALL_CATEGORIES" ]; then
    echo "   Available category handles:"
    echo "$ALL_CATEGORIES" | while read handle; do
        echo "   - $handle"
    done
else
    echo "   ⚠️  Could not fetch categories list"
fi

echo ""
echo "3. Checking frontend category page..."
FRONTEND_CATEGORY_URL="$STOREFRONT_URL/vn/categories/$CATEGORY_HANDLE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_CATEGORY_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Frontend category page exists (HTTP $HTTP_CODE)"
    echo "   URL: $FRONTEND_CATEGORY_URL"
    
    # Check if page contains category name
    PAGE_CONTENT=$(curl -s "$FRONTEND_CATEGORY_URL" || echo "")
    if echo "$PAGE_CONTENT" | grep -qi "IC Fix Face\|$CATEGORY_HANDLE"; then
        echo "   ✅ Category content found on page"
    else
        echo "   ⚠️  Category content not found on page (might be empty or cached)"
    fi
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Frontend category page not found (HTTP 404)"
    echo "   URL: $FRONTEND_CATEGORY_URL"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "   ❌ Could not reach frontend"
else
    echo "   ⚠️  Frontend returned HTTP $HTTP_CODE"
fi

echo ""
echo "4. Checking frontend store page for category listing..."
STORE_PAGE=$(curl -s "$STOREFRONT_URL/vn/store" || echo "")
if echo "$STORE_PAGE" | grep -qi "$CATEGORY_HANDLE\|IC Fix Face"; then
    echo "   ✅ Category found on store page"
else
    echo "   ❌ Category NOT found on store page"
    echo "   This could mean:"
    echo "   - Category is not in the categories list"
    echo "   - Frontend cache needs revalidation"
    echo "   - Category is filtered out"
fi

echo ""
echo "5. Triggering frontend cache revalidation..."
REVALIDATE_RESPONSE=$(curl -s -X POST \
  "$STOREFRONT_URL/api/revalidate?secret=$REVALIDATE_SECRET&event=force" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$REVALIDATE_RESPONSE" | grep -q "revalidated.*true"; then
    echo "   ✅ Cache revalidation successful"
    echo "   Response: $REVALIDATE_RESPONSE"
else
    echo "   ⚠️  Cache revalidation may have failed"
    echo "   Response: $REVALIDATE_RESPONSE"
fi

echo ""
echo "======================================"
echo "Summary & Recommendations"
echo "======================================"
echo ""

if [ "$CATEGORY_COUNT" -eq 0 ]; then
    echo "❌ ISSUE: Category not available in Store API"
    echo ""
    echo "Fix steps:"
    echo "1. Go to Admin UI: $BACKEND_URL/app"
    echo "2. Navigate to: Products → Categories"
    echo "3. Find category 'IC Fix Face'"
    echo "4. Ensure it's:"
    echo "   - Published (not draft)"
    echo "   - Associated with your default sales channel"
    echo "   - Has products assigned"
    echo ""
elif [ "$HTTP_CODE" != "200" ]; then
    echo "⚠️  ISSUE: Frontend page not accessible"
    echo ""
    echo "Possible causes:"
    echo "- Category exists but frontend route not generated"
    echo "- Static page generation issue"
    echo "- Cache issue"
    echo ""
    echo "Try:"
    echo "1. Wait 30 seconds after revalidation"
    echo "2. Hard refresh browser (Cmd+Shift+R)"
    echo "3. Check Vercel deployment logs"
else
    echo "✅ Category should be visible on frontend"
    echo ""
    echo "If still not showing:"
    echo "1. Hard refresh browser (Cmd+Shift+R)"
    echo "2. Clear browser cache"
    echo "3. Check browser console for errors"
    echo "4. Verify category has products assigned"
fi

echo ""
echo "Test URLs:"
echo "  Store page: $STOREFRONT_URL/vn/store"
echo "  Category page: $STOREFRONT_URL/vn/categories/$CATEGORY_HANDLE"
echo "  Backend API: $BACKEND_URL/store/product-categories?handle=$CATEGORY_HANDLE"

