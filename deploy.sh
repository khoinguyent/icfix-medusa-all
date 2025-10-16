#!/bin/bash

# Deployment script for Medusa with MeiliSearch
# This script helps deploy the application using docker-compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Medusa with MeiliSearch deployment...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your configuration before continuing.${NC}"
    read -p "Press Enter to continue after editing .env file..."
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Pulling latest images...${NC}"
docker pull ghcr.io/khoinguyent/icfix-medusa-all:latest
docker-compose -f docker-compose-prod.yml pull

echo -e "${GREEN}🏗️  Building and starting services...${NC}"
docker-compose -f docker-compose-prod.yml up -d --build

echo -e "${GREEN}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${GREEN}🔍 Checking service health...${NC}"

# Check PostgreSQL
if docker-compose -f docker-compose-prod.yml exec -T postgres pg_isready -U postgres -d medusa; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not healthy${NC}"
fi

# Check Redis
if docker-compose -f docker-compose-prod.yml exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis is not healthy${NC}"
fi

# Check MeiliSearch
if curl -f http://localhost:7700/health &> /dev/null; then
    echo -e "${GREEN}✅ MeiliSearch is healthy${NC}"
else
    echo -e "${RED}❌ MeiliSearch is not healthy${NC}"
fi

# Check Medusa
if curl -f http://localhost:9000/health &> /dev/null; then
    echo -e "${GREEN}✅ Medusa is healthy${NC}"
else
    echo -e "${RED}❌ Medusa is not healthy${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}📋 Service URLs:${NC}"
echo -e "  • Medusa API: http://localhost:9000"
echo -e "  • MeiliSearch: http://localhost:7700"
echo -e "  • PostgreSQL: localhost:5432"
echo -e "  • Redis: localhost:6379"

echo -e "${YELLOW}🔧 Next steps:${NC}"
echo -e "  1. Initialize MeiliSearch index: docker-compose -f docker-compose-prod.yml exec medusa npm run init-search"
echo -e "  2. Seed the database: docker-compose -f docker-compose-prod.yml exec medusa npm run seed"
echo -e "  3. Access your application at http://localhost:9000"

echo -e "${GREEN}✨ Happy coding!${NC}"
