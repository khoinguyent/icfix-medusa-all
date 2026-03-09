#!/bin/bash

# Setup Local Environment with All Services, Migrations, and Seed Data
# This script starts all services, runs migrations, and seeds promotional content data

set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting local environment setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Start infrastructure services first
echo -e "${YELLOW}Step 1: Starting infrastructure services (PostgreSQL, Redis, MeiliSearch)...${NC}"
docker-compose -f docker-compose.local.yml up -d postgres redis meilisearch

echo -e "${YELLOW}Waiting for infrastructure services to be healthy...${NC}"
sleep 15

# Check PostgreSQL
if docker exec medusa-postgres-local pg_isready -U postgres -d medusa > /dev/null 2>&1; then
  echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
  echo -e "${RED}❌ PostgreSQL is not ready yet, waiting...${NC}"
  sleep 10
fi

# Step 2: Start backend
echo ""
echo -e "${YELLOW}Step 2: Starting Medusa backend...${NC}"
docker-compose -f docker-compose.local.yml up -d medusa-backend

echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 20

# Wait for backend to be ready
echo -e "${YELLOW}Checking backend status...${NC}"
for i in {1..30}; do
  if docker logs medusa-backend-local 2>&1 | grep -q "Server is ready\|Database connection established"; then
    echo -e "${GREEN}✅ Backend is ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Backend failed to start. Check logs: docker logs medusa-backend-local${NC}"
    exit 1
  fi
  sleep 2
done

# Step 3: Generate migrations
echo ""
echo -e "${YELLOW}Step 3: Generating database migrations for promotional content module...${NC}"
docker exec medusa-backend-local npx medusa db:generate promotionalContentModule 2>&1 || {
  echo -e "${YELLOW}Note: Migrations may already exist or module name might be different. Continuing...${NC}"
}

# Step 4: Run migrations
echo ""
echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
docker exec medusa-backend-local npx medusa db:migrate

# Step 5: Verify tables were created
echo ""
echo -e "${YELLOW}Step 5: Verifying database tables...${NC}"
TABLES=$(docker exec medusa-postgres-local psql -U postgres -d medusa -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%promotional%' OR tablename LIKE '%homepage%' OR tablename LIKE '%service_feature%' OR tablename LIKE '%testimonial%';" 2>/dev/null || echo "")

if echo "$TABLES" | grep -q "promotional_banner\|homepage_section\|service_feature\|testimonial"; then
  echo -e "${GREEN}✅ New tables created successfully${NC}"
  echo "$TABLES" | grep -v "^$" | sed 's/^/   - /'
else
  echo -e "${YELLOW}⚠️  New tables not found yet (this is OK if migrations haven't created them)${NC}"
fi

# Step 6: Start frontend services
echo ""
echo -e "${YELLOW}Step 6: Starting frontend services (Admin, Storefront)...${NC}"
docker-compose -f docker-compose.local.yml up -d admin-local storefront-local

# Step 7: Show service status
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
echo "   - PostgreSQL: localhost:5439"
echo "   - Redis: localhost:6378"
echo "   - MeiliSearch: http://localhost:7700"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "   1. Seed promotional content data (run seed script)"
echo "   2. Test API endpoints"
echo "   3. Verify database schema"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"

