#!/bin/bash

# Script to manually trigger frontend cache revalidation
# Usage: ./scripts/manual-revalidate-frontend.sh

STOREFRONT_URL="${STOREFRONT_URL:-https://store.icfix.vn}"
REVALIDATE_SECRET="${REVALIDATE_SECRET:-ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615}"

echo "======================================"
echo "Manual Frontend Cache Revalidation"
echo "======================================"
echo "Storefront: $STOREFRONT_URL"
echo ""

# Test 1: Force revalidate all caches
echo "1. Triggering force revalidation (all caches)..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  "$STOREFRONT_URL/api/revalidate?secret=$REVALIDATE_SECRET&event=force" \
  -H "Content-Type: application/json" \
  -d '{}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Revalidation successful!"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo "   ❌ Revalidation failed (HTTP $HTTP_CODE)"
    echo "$BODY"
    exit 1
fi

echo ""
echo "2. Waiting 3 seconds for cache to clear..."
sleep 3

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "✅ Cache revalidation triggered successfully!"
echo ""
echo "Next steps:"
echo "  1. Refresh your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)"
echo "  2. Check if new products/categories appear"
echo ""
echo "Note:"
echo "  - Future product/category updates will automatically revalidate"
echo "  - This manual revalidation clears existing cache"
echo "  - No frontend redeployment needed!"

