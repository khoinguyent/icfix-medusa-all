#!/bin/bash

# Complete Setup Script: Start Services, Run Migrations, Seed Data

set -e

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Complete Setup...${NC}"
echo ""

# Step 1: Check infrastructure services
echo -e "${YELLOW}Step 1: Checking infrastructure services...${NC}"
if ! docker ps | grep -q "medusa-postgres-local.*healthy"; then
  echo -e "${YELLOW}Starting infrastructure services...${NC}"
  docker-compose -f docker-compose.local.yml up -d postgres redis meilisearch
  echo "Waiting 15 seconds for services to be ready..."
  sleep 15
fi

# Step 2: Start backend
echo ""
echo -e "${YELLOW}Step 2: Starting Medusa backend...${NC}"
docker-compose -f docker-compose.local.yml up -d --build medusa-backend

echo -e "${YELLOW}Waiting for backend to be ready (this may take a few minutes on first build)...${NC}"
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

# Step 3: Generate migrations
echo ""
echo -e "${YELLOW}Step 3: Generating database migrations...${NC}"
docker exec medusa-backend-local npx medusa db:generate promotionalContentModule 2>&1 || {
  echo -e "${YELLOW}Note: Trying to generate all migrations...${NC}"
  docker exec medusa-backend-local npx medusa db:generate 2>&1 || {
    echo -e "${YELLOW}Migrations may already exist or need different approach. Continuing...${NC}"
  }
}

# Step 4: Run migrations
echo ""
echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
docker exec medusa-backend-local npx medusa db:migrate

# Step 5: Verify tables
echo ""
echo -e "${YELLOW}Step 5: Verifying database tables...${NC}"
TABLES=$(docker exec medusa-postgres-local psql -U postgres -d medusa -t -c "\dt" 2>/dev/null | grep -E "promotional|homepage|service_feature|testimonial" || echo "")
if [ -n "$TABLES" ]; then
  echo -e "${GREEN}✅ New tables found:${NC}"
  echo "$TABLES" | sed 's/^/   /'
else
  echo -e "${YELLOW}⚠️  New tables not found yet (may need to check migration status)${NC}"
fi

# Step 6: Start frontend services
echo ""
echo -e "${YELLOW}Step 6: Starting frontend services...${NC}"
docker-compose -f docker-compose.local.yml up -d admin-local storefront-local

# Step 7: Summary
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Service Status:${NC}"
docker-compose -f docker-compose.local.yml ps

echo ""
echo -e "${GREEN}📋 Service URLs:${NC}"
echo "   - Backend API: http://localhost:9000"
echo "   - Storefront: http://localhost:3000"
echo "   - Admin UI: http://localhost:3001"
echo ""

echo -e "${YELLOW}Next: Seed promotional content data${NC}"
echo "   Run: docker exec -it medusa-backend-local npx medusa exec ./src/scripts/seed-promotional-content.ts"
echo ""

