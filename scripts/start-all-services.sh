#!/bin/bash

# Start All Services Script
# This script starts all services, waits for backend, and runs migrations

set -e

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting All Services...${NC}"
echo ""

# Step 1: Start infrastructure services first
echo -e "${YELLOW}Step 1: Starting infrastructure services (PostgreSQL, Redis, MeiliSearch)...${NC}"
docker-compose -f docker-compose.local.yml up -d postgres redis meilisearch

echo -e "${YELLOW}Waiting for infrastructure services to be healthy...${NC}"
sleep 15

# Step 2: Start backend
echo ""
echo -e "${YELLOW}Step 2: Building and starting Medusa backend...${NC}"
echo "This may take 5-10 minutes on first build..."
docker-compose -f docker-compose.local.yml up -d --build medusa-backend

echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..60}; do
  if docker logs medusa-backend-local 2>&1 | grep -q "Server is ready\|Database connection established\|listening on"; then
    echo -e "${GREEN}✅ Backend is ready!${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e "${RED}❌ Backend failed to start within timeout. Check logs: docker logs medusa-backend-local${NC}"
    exit 1
  fi
  sleep 3
  if [ $((i % 10)) -eq 0 ]; then
    echo "Still waiting... ($i/60)"
  fi
done

# Step 3: Run migrations
echo ""
echo -e "${YELLOW}Step 3: Running database migrations...${NC}"
docker exec medusa-backend-local npx medusa db:migrate || {
  echo -e "${YELLOW}No migrations to run or migrations already applied.${NC}"
}

# Step 4: Start frontend services
echo ""
echo -e "${YELLOW}Step 4: Starting frontend services (Admin, Storefront)...${NC}"
docker-compose -f docker-compose.local.yml up -d admin-local storefront-local

# Step 5: Show status
echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "${YELLOW}Service Status:${NC}"
docker-compose -f docker-compose.local.yml ps

echo ""
echo -e "${GREEN}📋 Service URLs:${NC}"
echo "   - Backend API: http://localhost:9000"
echo "   - Storefront: http://localhost:3000"
echo "   - Admin UI: http://localhost:3001"
echo ""

echo -e "${YELLOW}Note:${NC}"
echo "   - Sections will be hidden on frontend if no data is available"
echo "   - Use is_active flag to control visibility of promotional content"
echo "   - Seed data can be run later: docker exec -it medusa-backend-local npx medusa exec ./src/scripts/seed-promotional-content.ts"
echo ""

