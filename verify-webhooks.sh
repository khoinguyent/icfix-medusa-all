#!/bin/bash

# Webhook Revalidation Verification Script
# This script helps verify if webhook revalidation is working correctly

set -e

BACKEND_URL="${BACKEND_URL:-https://icfix.duckdns.org}"
STOREFRONT_URL="${STOREFRONT_URL:-https://icfix.duckdns.org}"
REVALIDATE_SECRET="${REVALIDATE_SECRET:-ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615}"

echo "======================================"
echo "Webhook Revalidation Verification"
echo "======================================"
echo ""

# Test 1: Check if backend is running
echo "1. Checking backend health..."
if curl -sf "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "   ✅ Backend is healthy at $BACKEND_URL"
else
    echo "   ❌ Backend is not responding at $BACKEND_URL"
    echo "   Run: docker-compose -f docker-compose-prod.yml up -d"
    exit 1
fi

# Test 2: Check if revalidation endpoint exists
echo ""
echo "2. Checking revalidation endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST \
  "$STOREFRONT_URL/api/revalidate?secret=$REVALIDATE_SECRET&event=product.updated" \
  -H "Content-Type: application/json" \
  -d '{"id": "test"}')

if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Revalidation endpoint is working (Status: $RESPONSE)"
else
    echo "   ⚠️  Revalidation endpoint returned status: $RESPONSE"
    if [ "$RESPONSE" = "401" ]; then
        echo "   ❌ Invalid secret - check REVALIDATE_SECRET matches in both .env files"
    fi
fi

# Test 3: Check collections API
echo ""
echo "3. Fetching collections from backend..."
COLLECTIONS=$(curl -s "$BACKEND_URL/store/collections" | jq -r '.collections | length' 2>/dev/null || echo "0")

if [ "$COLLECTIONS" -gt 0 ]; then
    echo "   ✅ Found $COLLECTIONS collections in backend"
    echo ""
    echo "   Collections:"
    curl -s "$BACKEND_URL/store/collections" | jq -r '.collections[] | "   - \(.handle): \(.title // .name)"' 2>/dev/null || echo "   (Could not parse collection names)"
else
    echo "   ⚠️  No collections found in backend"
    echo "   Create collections in Admin UI: $BACKEND_URL/app"
fi

# Test 4: Check if subscriber is configured
echo ""
echo "4. Checking subscriber configuration..."
if [ -f "icfix/src/subscribers/vercel-revalidate.ts" ]; then
    echo "   ✅ Revalidation subscriber file exists"
    
    # Check if it includes collection events
    if grep -q "product-collection" icfix/src/subscribers/vercel-revalidate.ts; then
        echo "   ✅ Subscriber listens to collection events"
    else
        echo "   ❌ Subscriber does not listen to collection events"
    fi
else
    echo "   ❌ Revalidation subscriber file not found"
fi

# Test 5: Check environment variables
echo ""
echo "5. Checking environment variables..."
if grep -q "REVALIDATE_ENDPOINT" .env; then
    echo "   ✅ REVALIDATE_ENDPOINT found in .env"
    grep "REVALIDATE_ENDPOINT" .env | head -1
else
    echo "   ❌ REVALIDATE_ENDPOINT not found in .env"
fi

if grep -q "REVALIDATE_SECRET" .env; then
    echo "   ✅ REVALIDATE_SECRET found in .env"
else
    echo "   ❌ REVALIDATE_SECRET not found in .env"
fi

if grep -q "REVALIDATE_SECRET" icfix-storefront/.env.local; then
    echo "   ✅ REVALIDATE_SECRET found in storefront .env.local"
else
    echo "   ❌ REVALIDATE_SECRET not found in storefront .env.local"
fi

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "If all checks pass, webhook revalidation should work."
echo ""
echo "To test manually:"
echo "1. Create a new collection in Admin UI: $BACKEND_URL/app"
echo "2. Wait 2-3 seconds"
echo "3. Reload homepage: $STOREFRONT_URL"
echo "4. Check browser console/network tab for revalidation calls"
echo ""
echo "To restart services with new environment:"
echo "  docker-compose -f docker-compose-prod.yml down"
echo "  docker-compose -f docker-compose-prod.yml up -d"
echo ""
echo "To view backend logs:"
echo "  docker logs -f icfix-backend"
echo ""

