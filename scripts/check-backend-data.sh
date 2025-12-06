#!/bin/bash

# Quick script to check what data is available on the backend server

set -e

BACKEND_URL="${BACKEND_URL:-https://icfix.duckdns.org}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Backend Data Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Backend URL: $BACKEND_URL"
echo ""

# Check health
echo -e "${BLUE}1. Health Check:${NC}"
health=$(curl -s "$BACKEND_URL/health" || echo "FAILED")
if echo "$health" | grep -qi "ok\|available\|status"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "Response: $health"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $health"
fi
echo ""

# Check regions (no auth needed for public endpoint)
echo -e "${BLUE}2. Regions (Public):${NC}"
regions=$(curl -s "$BACKEND_URL/store/regions" || echo "{}")
region_count=$(echo "$regions" | jq '.regions | length' 2>/dev/null || echo "0")
if [ "$region_count" != "0" ] && [ "$region_count" != "null" ]; then
    echo -e "${GREEN}✅ Found $region_count region(s)${NC}"
    echo "$regions" | jq '.regions[] | {id, name, currency_code, countries: [.countries[].iso_2]}' 2>/dev/null || echo "$regions"
else
    echo -e "${RED}❌ No regions found${NC}"
    echo "Response: $regions"
fi
echo ""

# Check products without auth (should work with publishable key in header if needed)
echo -e "${BLUE}3. Products (Public - may need publishable key):${NC}"
products=$(curl -s "$BACKEND_URL/store/products?limit=5" || echo "{}")
product_count=$(echo "$products" | jq '.count // .products | length' 2>/dev/null || echo "0")

if [ "$product_count" != "0" ] && [ "$product_count" != "null" ]; then
    echo -e "${GREEN}✅ Found $product_count product(s)${NC}"
    echo "$products" | jq '.products[]? | {id, title, handle, status}' 2>/dev/null || echo "$products" | head -20
else
    echo -e "${YELLOW}⚠️  No products returned (may need publishable API key)${NC}"
    echo "Response: $(echo "$products" | head -5)"
    echo ""
    echo -e "${YELLOW}To check with publishable key, run:${NC}"
    echo "  export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_..."
    echo "  curl -H \"x-publishable-api-key: \$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY\" $BACKEND_URL/store/products"
fi
echo ""

# Check if publishable key is needed
if [ -n "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" ]; then
    echo -e "${BLUE}4. Products (With Publishable Key):${NC}"
    products_auth=$(curl -s -H "x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$BACKEND_URL/store/products?limit=5" || echo "{}")
    product_count_auth=$(echo "$products_auth" | jq '.count // .products | length' 2>/dev/null || echo "0")
    
    if [ "$product_count_auth" != "0" ] && [ "$product_count_auth" != "null" ]; then
        echo -e "${GREEN}✅ Found $product_count_auth product(s) with auth${NC}"
        echo "$products_auth" | jq '.products[]? | {id, title, handle, status}' 2>/dev/null || echo "$products_auth" | head -20
    else
        echo -e "${RED}❌ Still no products with publishable key${NC}"
        echo "Response: $(echo "$products_auth" | head -10)"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Backend URL: $BACKEND_URL"
echo "Regions: $region_count"
echo "Products (public): $product_count"
if [ -n "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" ]; then
    echo "Products (with key): $product_count_auth"
fi
echo ""

