#!/bin/bash

# 🔍 Docker Pull Diagnostic Script
# Run this on your server to diagnose why docker pull with :latest fails

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================="
echo "Docker Pull Diagnostic Tool"
echo -e "===============================================${NC}"
echo ""

IMAGE_NAME="ghcr.io/khoinguyent/icfix-medusa-all"

# Step 1: Check Docker installation
echo -e "${BLUE}Step 1: Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo ""

# Step 2: Check Docker daemon
echo -e "${BLUE}Step 2: Checking Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Try: sudo systemctl start docker"
    exit 1
fi

echo ""

# Step 3: Check authentication
echo -e "${BLUE}Step 3: Checking GHCR authentication...${NC}"
if docker info | grep -q "Username: khoinguyent"; then
    echo -e "${GREEN}✅ Already logged in to GHCR as khoinguyent${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to GHCR${NC}"
    echo ""
    echo "To login to GHCR, run:"
    echo "  docker login ghcr.io -u khoinguyent"
    echo ""
    echo "Or set environment variables:"
    echo "  export GHCR_TOKEN=your_token"
    echo "  echo \$GHCR_TOKEN | docker login ghcr.io -u khoinguyent --password-stdin"
    echo ""
fi

echo ""

# Step 4: Check network connectivity
echo -e "${BLUE}Step 4: Checking network connectivity...${NC}"
if curl -f -s https://ghcr.io > /dev/null; then
    echo -e "${GREEN}✅ Can reach ghcr.io${NC}"
else
    echo -e "${RED}❌ Cannot reach ghcr.io${NC}"
    echo "Check your network connection and firewall settings"
fi

echo ""

# Step 5: Check image manifest
echo -e "${BLUE}Step 5: Checking image availability...${NC}"
echo "Checking if $IMAGE_NAME:latest exists..."

if docker manifest inspect "$IMAGE_NAME:latest" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Image $IMAGE_NAME:latest exists!${NC}"
    
    # Get image details
    echo ""
    echo "Image details:"
    docker manifest inspect "$IMAGE_NAME:latest" | jq -r '.schemaVersion, .mediaType' 2>/dev/null || echo "Could not get manifest details"
    
else
    echo -e "${RED}❌ Image $IMAGE_NAME:latest not found${NC}"
    echo ""
    
    # Try other tags
    echo -e "${YELLOW}Checking other possible tags...${NC}"
    for tag in "main" "main-latest" "medusa-meilisearch"; do
        echo -n "Checking $IMAGE_NAME:$tag... "
        if docker manifest inspect "$IMAGE_NAME:$tag" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Found${NC}"
        else
            echo -e "${RED}❌ Not found${NC}"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}🌐 Check GitHub Packages manually:${NC}"
    echo "https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all"
    echo ""
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo "1. Image is private and you're not authenticated"
    echo "2. Image doesn't have a 'latest' tag"
    echo "3. Build failed or is still in progress"
    echo "4. Image is for a different architecture"
fi

echo ""

# Step 6: Check system architecture
echo -e "${BLUE}Step 6: Checking system architecture...${NC}"
echo "System: $(uname -m)"
echo "Docker: $(docker version --format '{{.Server.Arch}}' 2>/dev/null || echo 'Could not get Docker architecture')"

echo ""

# Step 7: Try to pull
echo -e "${BLUE}Step 7: Attempting to pull image...${NC}"
echo "Trying to pull $IMAGE_NAME:latest..."

if docker pull "$IMAGE_NAME:latest" 2>&1; then
    echo -e "${GREEN}✅ Successfully pulled $IMAGE_NAME:latest${NC}"
    
    # Show image info
    echo ""
    echo "Image information:"
    docker images "$IMAGE_NAME:latest" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
    
else
    echo -e "${RED}❌ Failed to pull $IMAGE_NAME:latest${NC}"
    echo ""
    
    # Try alternative tags
    echo -e "${YELLOW}Trying alternative tags...${NC}"
    for tag in "main" "main-latest"; do
        echo "Trying $IMAGE_NAME:$tag..."
        if docker pull "$IMAGE_NAME:$tag" 2>/dev/null; then
            echo -e "${GREEN}✅ Successfully pulled $IMAGE_NAME:$tag${NC}"
            
            # Update docker-compose to use this tag
            echo ""
            echo -e "${YELLOW}💡 To use this tag, update your docker-compose-prod.yml:${NC}"
            echo "Change: image: ghcr.io/khoinguyent/icfix-medusa-all:latest"
            echo "To:     image: ghcr.io/khoinguyent/icfix-medusa-all:$tag"
            break
        else
            echo -e "${RED}❌ Failed to pull $IMAGE_NAME:$tag${NC}"
        fi
    done
fi

echo ""

# Step 8: Summary and recommendations
echo -e "${BLUE}=============================================="
echo "Summary and Recommendations"
echo -e "===============================================${NC}"
echo ""

if docker images "$IMAGE_NAME" --format "{{.Repository}}" | grep -q "$IMAGE_NAME"; then
    echo -e "${GREEN}✅ You have at least one image from the repository${NC}"
    echo "Available images:"
    docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
else
    echo -e "${RED}❌ No images from the repository found${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Check if the GitHub Actions build succeeded:"
    echo "   https://github.com/khoinguyent/icfix-medusa-all/actions"
    echo ""
    echo "2. Verify the package is public:"
    echo "   https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all"
    echo ""
    echo "3. Try authenticating with a personal access token:"
    echo "   docker login ghcr.io -u khoinguyent"
    echo ""
    echo "4. Check if the build created a different tag name"
fi

echo ""
echo -e "${GREEN}✨ Diagnostic complete!${NC}"
