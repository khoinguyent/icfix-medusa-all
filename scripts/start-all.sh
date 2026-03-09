#!/bin/bash

# Start All Services Script
set -e

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting All Services...${NC}"
echo ""

# Step 1: Infrastructure services
echo -e "${YELLOW}Step 1: Starting infrastructure services...${NC}"
docker-compose -f docker-compose.local.yml up -d postgres redis meilisearch

echo -e "${YELLOW}Waiting for infrastructure (15 seconds)...${NC}"
sleep 15

# Step 2: Backend
echo ""
echo -e "${YELLOW}Step 2: Building and starting backend...${NC}"
echo "This may take 5-10 minutes on first build..."
docker-compose -f docker-compose.local.yml up -d --build medusa-backend

# Step 3: Wait for backend
echo ""
echo -e "${YELLOW}Step 3: Waiting for backend to be ready...${NC}"
for i in {1..60}; do
  if docker logs medusa-backend-local 2>&1 | grep -q "Server is ready\|Database connection established\|listening on"; then
    echo -e "${GREEN}✅ Backend is ready!${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e "${RED}⚠️ Backend timeout. Continuing anyway...${NC}"
    break
  fi
  sleep 3
  if [ $((i % 10)) -eq 0 ]; then
    echo "Still waiting... ($i/60)"
  fi
done

# Step 4: Frontend services
echo ""
echo -e "${YELLOW}Step 4: Starting frontend services...${NC}"
docker-compose -f docker-compose.local.yml up -d admin-local storefront-local

# Final status
echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
docker-compose -f docker-compose.local.yml ps

