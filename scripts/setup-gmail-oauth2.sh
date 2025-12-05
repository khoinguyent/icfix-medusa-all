#!/bin/bash

#############################################
# Gmail OAuth2 Integration Setup Script
#############################################
# 
# This script helps you set up Gmail OAuth2
# integration for your Medusa store.
#
# Usage:
#   ./scripts/setup-gmail-oauth2.sh
#
#############################################

set -e  # Exit on error

echo "=============================================="
echo "Gmail OAuth2 Integration Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "icfix/plugins/notification-gmail-oauth2" ]; then
  echo -e "${RED}❌ Error: This script must be run from the project root directory${NC}"
  echo "   Current directory: $(pwd)"
  echo "   Expected structure: ./icfix/plugins/notification-gmail-oauth2"
  exit 1
fi

echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  echo "   Please install Node.js v18 or higher"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js version is too old (v$NODE_VERSION)${NC}"
  echo "   Please upgrade to Node.js v18 or higher"
  exit 1
fi

echo -e "   ${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed${NC}"
  exit 1
fi

echo -e "   ${GREEN}✅ npm $(npm -v)${NC}"
echo ""

echo -e "${BLUE}📋 Step 2: Installing plugin dependencies...${NC}"
echo ""

cd icfix/plugins/notification-gmail-oauth2

# Install dependencies
echo "   Installing nodemailer and googleapis..."
npm install nodemailer googleapis --save 2>&1 | sed 's/^/   /'

echo ""
echo "   Installing dev dependencies..."
npm install @types/node @types/nodemailer typescript --save-dev 2>&1 | sed 's/^/   /'

echo ""
echo -e "   ${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Building plugin...${NC}"
echo ""

# Build the plugin
npm run build 2>&1 | sed 's/^/   /'

if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Build failed - dist directory not created${NC}"
  exit 1
fi

echo ""
echo -e "   ${GREEN}✅ Plugin built successfully${NC}"
echo ""

cd ../../..  # Back to project root

echo -e "${BLUE}📋 Step 4: Checking environment variables...${NC}"
echo ""

# Check if .env exists
if [ ! -f "icfix/.env" ]; then
  echo -e "${YELLOW}⚠️  .env file not found${NC}"
  echo "   Creating from template..."
  
  if [ -f "env.template" ]; then
    cp env.template icfix/.env
    echo -e "   ${GREEN}✅ Created icfix/.env from template${NC}"
  else
    echo -e "   ${RED}❌ env.template not found${NC}"
    exit 1
  fi
fi

# Check environment variables
source icfix/.env 2>/dev/null || true

MISSING_VARS=false

if [ -z "$GMAIL_USER" ]; then
  echo -e "   ${RED}❌ GMAIL_USER not set${NC}"
  MISSING_VARS=true
else
  echo -e "   ${GREEN}✅ GMAIL_USER: $GMAIL_USER${NC}"
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo -e "   ${RED}❌ GOOGLE_CLIENT_ID not set${NC}"
  MISSING_VARS=true
else
  # Mask the client ID for security
  MASKED_ID="${GOOGLE_CLIENT_ID:0:20}...${GOOGLE_CLIENT_ID: -20}"
  echo -e "   ${GREEN}✅ GOOGLE_CLIENT_ID: $MASKED_ID${NC}"
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo -e "   ${RED}❌ GOOGLE_CLIENT_SECRET not set${NC}"
  MISSING_VARS=true
else
  echo -e "   ${GREEN}✅ GOOGLE_CLIENT_SECRET: ********${NC}"
fi

if [ -z "$GOOGLE_REFRESH_TOKEN" ]; then
  echo -e "   ${RED}❌ GOOGLE_REFRESH_TOKEN not set${NC}"
  MISSING_VARS=true
else
  echo -e "   ${GREEN}✅ GOOGLE_REFRESH_TOKEN: ********${NC}"
fi

echo ""

if [ "$MISSING_VARS" = true ]; then
  echo -e "${YELLOW}⚠️  Missing required environment variables!${NC}"
  echo ""
  echo "Please complete the OAuth2 setup:"
  echo ""
  echo "1. Open the setup guide:"
  echo -e "   ${BLUE}cat GMAIL_OAUTH2_SETUP_GUIDE.md${NC}"
  echo ""
  echo "2. Follow Steps 1-5 to get your OAuth2 credentials"
  echo ""
  echo "3. Add the credentials to icfix/.env:"
  echo "   - GMAIL_USER=your-email@gmail.com"
  echo "   - GOOGLE_CLIENT_ID=..."
  echo "   - GOOGLE_CLIENT_SECRET=..."
  echo "   - GOOGLE_REFRESH_TOKEN=..."
  echo ""
  echo "4. Run this script again:"
  echo -e "   ${BLUE}./scripts/setup-gmail-oauth2.sh${NC}"
  echo ""
  exit 1
fi

echo -e "${BLUE}📋 Step 5: Testing Gmail integration...${NC}"
echo ""

# Run test
if [ -f "icfix/test-gmail.js" ]; then
  echo "Running test script..."
  echo ""
  cd icfix
  node test-gmail.js
  TEST_RESULT=$?
  cd ..
  
  if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo -e "${GREEN}✅ Gmail OAuth2 Setup Complete!${NC}"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Restart your Medusa server:"
    echo -e "   ${BLUE}docker-compose -f docker-compose-prod.yml restart backend${NC}"
    echo ""
    echo "2. Monitor logs for initialization:"
    echo -e "   ${BLUE}docker logs -f medusa-backend${NC}"
    echo ""
    echo "3. Place a test order to verify emails are sent"
    echo ""
    echo "4. Customize email templates in:"
    echo "   icfix/plugins/notification-gmail-oauth2/templates/"
    echo ""
    echo "For troubleshooting, see: GMAIL_OAUTH2_SETUP_GUIDE.md"
    echo ""
  else
    echo ""
    echo "=============================================="
    echo -e "${RED}❌ Gmail Integration Test Failed${NC}"
    echo "=============================================="
    echo ""
    echo "Please review the error messages above and:"
    echo ""
    echo "1. Verify all OAuth2 credentials are correct"
    echo "2. Check Gmail API is enabled in Google Cloud Console"
    echo "3. Ensure refresh token is still valid"
    echo ""
    echo "See GMAIL_OAUTH2_SETUP_GUIDE.md for detailed troubleshooting"
    echo ""
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Test script not found${NC}"
  echo "   Skipping integration test"
  echo ""
  echo "=============================================="
  echo -e "${GREEN}✅ Gmail OAuth2 Setup Complete!${NC}"
  echo "=============================================="
  echo ""
  echo "Manual test:"
  echo -e "   ${BLUE}cd icfix && node test-gmail.js${NC}"
  echo ""
fi

