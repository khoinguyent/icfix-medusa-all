#!/bin/bash

# Script to compare data between Vercel storefront and backend server
# This helps diagnose why data is missing on the storefront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-https://icfix.duckdns.org}"
STOREFRONT_URL="${STOREFRONT_URL:-}"  # Will be detected or set manually

# Get publishable key from environment or prompt
PUBLISHABLE_KEY="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Storefront vs Backend Data Comparison${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Get publishable key if not provided
if [ -z "$PUBLISHABLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  Publishable API key not found in environment${NC}"
    echo -e "${YELLOW}Please provide NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY or enter it now:${NC}"
    read -p "Publishable Key (pk_...): " PUBLISHABLE_KEY
    echo ""
fi

# Step 2: Detect storefront URL
if [ -z "$STOREFRONT_URL" ]; then
    echo -e "${YELLOW}⚠️  Storefront URL not provided${NC}"
    echo -e "${YELLOW}Please enter your Vercel storefront URL (e.g., https://your-storefront.vercel.app):${NC}"
    read -p "Storefront URL: " STOREFRONT_URL
    echo ""
fi

echo -e "${GREEN}Configuration:${NC}"
echo "  Backend:    $BACKEND_URL"
echo "  Storefront: $STOREFRONT_URL"
echo "  API Key:    ${PUBLISHABLE_KEY:0:20}..."
echo ""

# Function to make API request
api_request() {
    local url=$1
    local headers=$2
    curl -s -w "\nHTTP_STATUS:%{http_code}" -H "$headers" "$url" 2>/dev/null
}

# Function to parse JSON response
parse_json() {
    local response=$1
    local field=$2
    echo "$response" | grep -v "HTTP_STATUS" | jq -r "$field" 2>/dev/null || echo "null"
}

# Function to check endpoint
check_endpoint() {
    local name=$1
    local backend_path=$2
    local storefront_path=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Checking: $name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Backend check
    echo -e "\n${GREEN}📡 Backend ($BACKEND_URL$backend_path):${NC}"
    backend_response=$(api_request "$BACKEND_URL$backend_path" "x-publishable-api-key: $PUBLISHABLE_KEY")
    backend_status=$(echo "$backend_response" | grep "HTTP_STATUS" | cut -d: -f2)
    backend_body=$(echo "$backend_response" | grep -v "HTTP_STATUS")
    
    if [ "$backend_status" = "200" ]; then
        echo -e "${GREEN}✅ Status: $backend_status${NC}"
        echo "$backend_body" | jq '.' 2>/dev/null | head -20 || echo "$backend_body" | head -20
    else
        echo -e "${RED}❌ Status: $backend_status${NC}"
        echo "$backend_body" | head -5
    fi
    
    # Storefront check (if path provided)
    if [ -n "$storefront_path" ]; then
        echo -e "\n${GREEN}🌐 Storefront ($STOREFRONT_URL$storefront_path):${NC}"
        storefront_response=$(api_request "$STOREFRONT_URL$storefront_path" "")
        storefront_status=$(echo "$storefront_response" | grep "HTTP_STATUS" | cut -d: -f2)
        storefront_body=$(echo "$storefront_response" | grep -v "HTTP_STATUS")
        
        if [ "$storefront_status" = "200" ]; then
            echo -e "${GREEN}✅ Status: $storefront_status${NC}"
            echo "$storefront_body" | jq '.' 2>/dev/null | head -20 || echo "$storefront_body" | head -20
        else
            echo -e "${RED}❌ Status: $storefront_status${NC}"
            echo "$storefront_body" | head -5
        fi
    fi
    
    echo ""
}

# Step 3: Check backend health
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Backend Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
health_response=$(api_request "$BACKEND_URL/health" "")
health_status=$(echo "$health_response" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$health_status" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed (Status: $health_status)${NC}"
    echo -e "${RED}   Cannot proceed with comparison${NC}"
    exit 1
fi
echo ""

# Step 4: Check regions
check_endpoint "Regions" "/store/regions" ""

# Step 5: Check products
check_endpoint "Products" "/store/products?limit=10" ""

# Step 6: Get product count from backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Product Count Comparison${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

backend_products=$(api_request "$BACKEND_URL/store/products" "x-publishable-api-key: $PUBLISHABLE_KEY")
backend_count=$(parse_json "$backend_products" ".count // .products | length")
backend_products_list=$(parse_json "$backend_products" ".products[]?.title // empty")

echo -e "${GREEN}Backend Products:${NC}"
echo "  Count: $backend_count"
if [ "$backend_count" != "0" ] && [ "$backend_count" != "null" ]; then
    echo "  Products:"
    echo "$backend_products_list" | while read -r title; do
        if [ -n "$title" ]; then
            echo "    - $title"
        fi
    done
else
    echo -e "${RED}  ⚠️  No products found on backend!${NC}"
fi
echo ""

# Step 7: Check storefront homepage
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Storefront Homepage Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
homepage_response=$(api_request "$STOREFRONT_URL" "")
homepage_status=$(echo "$homepage_response" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$homepage_status" = "200" ]; then
    echo -e "${GREEN}✅ Storefront homepage is accessible${NC}"
    # Check if page contains product-related content
    homepage_body=$(echo "$homepage_response" | grep -v "HTTP_STATUS")
    if echo "$homepage_body" | grep -qi "product\|empty\|no.*found"; then
        echo -e "${YELLOW}⚠️  Homepage content may indicate missing data${NC}"
    fi
else
    echo -e "${RED}❌ Storefront homepage failed (Status: $homepage_status)${NC}"
fi
echo ""

# Step 8: Check environment variables (if we can access Vercel API)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Environment Variable Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Manual check required:${NC}"
echo "  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "  2. Verify these variables are set:"
echo "     - NEXT_PUBLIC_MEDUSA_BACKEND_URL=$BACKEND_URL"
echo "     - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${PUBLISHABLE_KEY:0:20}..."
echo "     - NEXT_PUBLIC_DEFAULT_REGION=vn"
echo ""

# Step 9: Summary and recommendations
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary & Recommendations${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$backend_count" = "0" ] || [ "$backend_count" = "null" ]; then
    echo -e "${RED}❌ ISSUE FOUND: Backend has no products!${NC}"
    echo "  → Solution: Run seed script on backend"
    echo "  → Command: docker exec -it icfix-backend npm run seed"
elif [ "$homepage_status" != "200" ]; then
    echo -e "${RED}❌ ISSUE FOUND: Storefront is not accessible!${NC}"
    echo "  → Solution: Check Vercel deployment status"
else
    echo -e "${GREEN}✅ Backend has $backend_count products${NC}"
    echo -e "${YELLOW}⚠️  If storefront shows no data, check:${NC}"
    echo "  1. Vercel environment variables are set correctly"
    echo "  2. Vercel deployment was rebuilt after setting env vars"
    echo "  3. CORS is configured on backend to allow storefront origin"
    echo "  4. Publishable API key is valid and active"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Check Vercel deployment logs for errors"
echo "  2. Verify environment variables in Vercel dashboard"
echo "  3. Trigger a new deployment after fixing env vars"
echo "  4. Check browser console for API errors"
echo ""

