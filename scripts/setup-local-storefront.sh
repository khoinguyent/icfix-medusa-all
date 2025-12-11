#!/bin/bash

# Setup Local Storefront Deployment
# This script builds and starts the local storefront

set -e

cd "$(dirname "$0")/.."

echo "========================================="
echo "  Local Storefront Deployment Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if .env.local exists
echo "Step 1: Checking environment configuration..."
if [ ! -f "icfix-storefront/.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cp icfix-storefront/env.example icfix-storefront/.env.local
    
    # Update backend URL
    sed -i '' 's|NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org|' icfix-storefront/.env.local
    
    echo -e "${YELLOW}⚠️  Please set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in icfix-storefront/.env.local${NC}"
    echo -e "${YELLOW}   You can get it from the backend admin or database.${NC}"
    echo ""
    read -p "Do you want to continue without publishable key? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. Please set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY first."
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.local found${NC}"
    # Update backend URL if needed
    if grep -q "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000" icfix-storefront/.env.local; then
        sed -i '' 's|NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org|' icfix-storefront/.env.local
        echo -e "${GREEN}✅ Updated backend URL to https://icfix.duckdns.org${NC}"
    fi
fi
echo ""

# Step 2: Check Docker
echo "Step 2: Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 3: Load publishable key from .env.local
if [ -f "icfix-storefront/.env.local" ]; then
    export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$(grep "^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" icfix-storefront/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -n "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" ]; then
        echo -e "${GREEN}✅ Found publishable API key${NC}"
    fi
fi

# Step 4: Build and start storefront
echo "Step 4: Building and starting storefront container..."
echo -e "${YELLOW}This may take a few minutes on first build...${NC}"
docker-compose -f docker-compose.local.yml up -d --build storefront-local

# Wait for container to be ready
echo "Waiting for storefront to start..."
sleep 5

# Check if container is running
if docker ps | grep -q "medusa-storefront-local"; then
    echo -e "${GREEN}✅ Storefront container is running${NC}"
else
    echo -e "${RED}❌ Failed to start storefront container${NC}"
    docker logs medusa-storefront-local
    exit 1
fi
echo ""

# Step 5: Wait for Next.js to be ready
echo "Step 5: Waiting for Next.js server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Storefront is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Storefront is taking longer than expected. Check logs: docker logs medusa-storefront-local${NC}"
    else
        echo -n "."
        sleep 2
    fi
done
echo ""

# Step 6: Display access information
echo "========================================="
echo -e "${GREEN}  🎉 Local Storefront is Ready!${NC}"
echo "========================================="
echo ""
echo "📍 Storefront URL:  http://localhost:3000"
echo "🔗 Backend API:     https://icfix.duckdns.org"
echo ""
echo "========================================="
echo "  Useful Commands"
echo "========================================="
echo ""
echo "📊 View logs:     docker logs -f medusa-storefront-local"
echo "🔄 Restart:       docker restart medusa-storefront-local"
echo "🛑 Stop:          docker stop medusa-storefront-local"
echo "❌ Remove:        docker-compose -f docker-compose.local.yml down"
echo ""
echo "========================================="
echo "  ⚠️  IMPORTANT: Publishable API Key"
echo "========================================="
echo ""
echo "If products/categories don't load, check:"
echo "1. NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is set in icfix-storefront/.env.local"
echo "2. The key is valid and active in the backend"
echo "3. Restart container after updating .env.local:"
echo "   docker-compose -f docker-compose.local.yml restart storefront-local"
echo ""

# Test access
echo "Testing storefront access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Storefront is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Storefront returned HTTP $HTTP_CODE${NC}"
fi
echo ""

echo -e "${GREEN}Setup complete! Open http://localhost:3000 in your browser${NC}"

