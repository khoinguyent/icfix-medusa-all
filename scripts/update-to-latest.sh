#!/bin/bash

#############################################
# Update to Latest Docker Image from GHCR
#############################################
#
# This script pulls the latest Docker image
# from GHCR and restarts your services.
#
# Usage:
#   ./scripts/update-to-latest.sh
#
#############################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================="
echo "Update to Latest Docker Image"
echo -e "===============================================${NC}"
echo ""

# Default image (can be overridden)
IMAGE_REPO="${IMAGE_REPO:-ghcr.io/khoinguyent/icfix-medusa-all}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
FULL_IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"

echo -e "${BLUE}📦 Image:${NC} ${FULL_IMAGE}"
echo ""

# Check if docker-compose-prod.yml exists
if [ ! -f "docker-compose-prod.yml" ]; then
  echo -e "${RED}❌ Error: docker-compose-prod.yml not found${NC}"
  echo "   Please run this script from the project root directory"
  exit 1
fi

# Step 1: Pull latest image
echo -e "${BLUE}Step 1: Pulling latest image...${NC}"
echo ""

if docker pull "${FULL_IMAGE}"; then
  echo ""
  echo -e "${GREEN}✅ Successfully pulled ${FULL_IMAGE}${NC}"
else
  echo ""
  echo -e "${RED}❌ Failed to pull image${NC}"
  echo ""
  echo "Possible reasons:"
  echo "  1. Not logged in to GHCR: docker login ghcr.io"
  echo "  2. Image doesn't exist yet (build in progress?)"
  echo "  3. Network issues"
  echo ""
  echo "To login to GHCR:"
  echo "  docker login ghcr.io -u YOUR_GITHUB_USERNAME"
  echo ""
  exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking current services...${NC}"
echo ""

# Check if services are running
if docker-compose -f docker-compose-prod.yml ps | grep -q "Up"; then
  echo -e "${YELLOW}⚠️  Services are currently running${NC}"
  echo ""
  
  # Ask for confirmation
  read -p "Do you want to restart services with the new image? (y/N) " -n 1 -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Update canceled${NC}"
    echo ""
    echo "The new image has been pulled but services were not restarted."
    echo "To restart manually later, run:"
    echo "  docker-compose -f docker-compose-prod.yml up -d --no-deps medusa-backend"
    echo ""
    exit 0
  fi
  
  echo ""
  echo -e "${BLUE}Step 3: Restarting backend service...${NC}"
  echo ""
  
  # Restart only the backend service
  docker-compose -f docker-compose-prod.yml up -d --no-deps medusa-backend
  
  echo ""
  echo -e "${GREEN}✅ Backend service restarted with new image${NC}"
  
else
  echo -e "${YELLOW}⚠️  Services are not running${NC}"
  echo ""
  echo "To start services with the new image:"
  echo "  docker-compose -f docker-compose-prod.yml up -d"
  echo ""
  exit 0
fi

echo ""
echo -e "${BLUE}Step 4: Checking service health...${NC}"
echo ""

# Wait a few seconds for service to start
sleep 3

# Check if backend is running
if docker-compose -f docker-compose-prod.yml ps medusa-backend | grep -q "Up"; then
  echo -e "${GREEN}✅ Backend service is running${NC}"
  
  # Show logs
  echo ""
  echo -e "${BLUE}Recent logs:${NC}"
  echo ""
  docker-compose -f docker-compose-prod.yml logs --tail=20 medusa-backend
  
else
  echo -e "${RED}❌ Backend service failed to start${NC}"
  echo ""
  echo "Check logs with:"
  echo "  docker-compose -f docker-compose-prod.yml logs medusa-backend"
  echo ""
  exit 1
fi

echo ""
echo -e "${BLUE}=============================================="
echo -e "${GREEN}✅ Update Complete!${NC}"
echo -e "===============================================${NC}"
echo ""
echo "Your services are now running the latest image:"
echo "  ${FULL_IMAGE}"
echo ""
echo "Useful commands:"
echo "  • View logs: docker-compose -f docker-compose-prod.yml logs -f medusa-backend"
echo "  • Check status: docker-compose -f docker-compose-prod.yml ps"
echo "  • Restart: docker-compose -f docker-compose-prod.yml restart medusa-backend"
echo ""

