#!/bin/bash

# Setup Local Admin Deployment
# This script configures backend CORS and starts the local admin

set -e

cd "$(dirname "$0")/.."

echo "========================================="
echo "  Local Admin Deployment Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if admin is built
echo "Step 1: Checking admin build..."
if [ ! -d "icfix/admin" ] || [ ! -f "icfix/admin/index.html" ]; then
    echo -e "${YELLOW}⚠️  Admin not built. Building now...${NC}"
    cd icfix
    VITE_ADMIN_BACKEND_URL=https://api.icfix.vn VITE_BASE_PATH=/app npm run build:admin
    cd ..
    echo -e "${GREEN}✅ Admin built successfully${NC}"
else
    echo -e "${GREEN}✅ Admin build found${NC}"
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

# Step 3: Create nginx config if not exists
echo "Step 3: Checking nginx configuration..."
if [ ! -f "nginx/admin.conf" ]; then
    echo -e "${RED}❌ nginx/admin.conf not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ nginx configuration found${NC}"
echo ""

# Step 4: Start admin container
echo "Step 4: Starting admin container..."
docker-compose -f docker-compose.local.yml up -d admin-local

# Wait for container to be ready
echo "Waiting for admin to start..."
sleep 3

# Check if container is running
if docker ps | grep -q "medusa-admin-local"; then
    echo -e "${GREEN}✅ Admin container is running${NC}"
else
    echo -e "${RED}❌ Failed to start admin container${NC}"
    docker logs medusa-admin-local
    exit 1
fi
echo ""

# Step 5: Display access information
echo "========================================="
echo -e "${GREEN}  🎉 Local Admin is Ready!${NC}"
echo "========================================="
echo ""
echo "📍 Admin URL:     http://localhost:3001/app"
echo "🔐 Login:         admin@icfix.vn"
echo "🔑 Password:      admin123@"
echo "🔗 Backend API:   https://api.icfix.vn"
echo ""
echo "========================================="
echo "  Useful Commands"
echo "========================================="
echo ""
echo "📊 View logs:     docker logs -f medusa-admin-local"
echo "🔄 Restart:       docker restart medusa-admin-local"
echo "🛑 Stop:          docker stop medusa-admin-local"
echo "❌ Remove:        docker-compose -f docker-compose.local.yml down"
echo ""
echo "========================================="
echo "  ⚠️  IMPORTANT: Backend CORS"
echo "========================================="
echo ""
echo "If you see CORS errors, update backend .env:"
echo ""
echo "ADMIN_CORS=https://admin.icfix.vn,http://localhost:3001"
echo "AUTH_CORS=https://admin.icfix.vn,http://localhost:3001"
echo ""
echo "Then restart backend:"
echo "docker-compose restart medusa-backend"
echo ""

# Test access
echo "Testing admin access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/app/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Admin returned HTTP $HTTP_CODE${NC}"
fi
echo ""

echo -e "${GREEN}Setup complete! Open http://localhost:3001/app in your browser${NC}"

