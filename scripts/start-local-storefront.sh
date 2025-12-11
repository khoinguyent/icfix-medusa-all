#!/bin/bash

# Start Local Storefront (Development Mode)
# Runs Next.js dev server locally (not in Docker)

set -e

cd "$(dirname "$0")/../icfix-storefront"

echo "========================================="
echo "  Starting Local Storefront"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    if [ -f "yarn.lock" ]; then
        yarn install
    else
        npm install
    fi
    echo ""
fi

# Display configuration
echo "========================================="
echo "  Configuration"
echo "========================================="
echo ""
grep -E "^NEXT_PUBLIC_MEDUSA" .env.local | sed 's/\(.*KEY=\).*\(.\{20\}\)$/\1***\2/'
echo "Backend URL: $(grep '^NEXT_PUBLIC_MEDUSA_BACKEND_URL' .env.local | cut -d '=' -f2)"
echo ""

# Start Next.js dev server
echo "========================================="
echo -e "${GREEN}  🚀 Starting Storefront${NC}"
echo "========================================="
echo ""
echo "📍 URL:        http://localhost:3000"
echo "🔗 Backend:    https://icfix.duckdns.org"
echo ""
echo "Press Ctrl+C to stop"
echo ""

if [ -f "yarn.lock" ]; then
    yarn dev
else
    npm run dev
fi

