#!/bin/bash

# ===================================================
# Automation Setup Script
# ===================================================
# This script helps you set up automated build
# failure detection and debugging
# ===================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🤖 Build Automation Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
echo ""

ISSUES=0

# Check GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI installed${NC}"
    
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
        GITHUB_USER=$(gh api user -q .login)
        echo -e "   User: ${GITHUB_USER}"
    else
        echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
        echo -e "   Run: ${YELLOW}gh auth login${NC}"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}❌ GitHub CLI not installed${NC}"
    echo ""
    echo "   Install with:"
    echo -e "   ${YELLOW}brew install gh${NC}  # macOS"
    echo -e "   ${YELLOW}sudo apt install gh${NC}  # Linux"
    echo ""
    ISSUES=$((ISSUES + 1))
fi

# Check Cursor CLI
if command -v cursor &> /dev/null; then
    echo -e "${GREEN}✅ Cursor CLI installed${NC}"
    echo -e "   (Scripts will auto-open reports in Cursor)"
else
    echo -e "${YELLOW}⚠️  Cursor CLI not installed (optional)${NC}"
    echo -e "   Install via Cursor: Cmd+Shift+P → 'Install cursor command'"
    echo -e "   (Reports will still work, just won't auto-open)"
fi

# Check jq
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq installed${NC}"
else
    echo -e "${YELLOW}⚠️  jq not installed (required for scripts)${NC}"
    echo -e "   Install: ${YELLOW}brew install jq${NC} or ${YELLOW}sudo apt install jq${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""

if [ $ISSUES -gt 0 ]; then
    echo -e "${RED}❌ Please fix the issues above before continuing${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo ""

# Create directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs/github-actions
echo -e "${GREEN}✅ Created logs/github-actions/${NC}"
echo ""

# Make scripts executable
echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✅ All scripts are now executable${NC}"
echo ""

# Test GitHub Actions access
echo -e "${YELLOW}🔍 Testing GitHub Actions access...${NC}"
RECENT_RUNS=$(gh run list --limit 1 --json databaseId,name,status 2>/dev/null || echo "")

if [ -z "$RECENT_RUNS" ]; then
    echo -e "${RED}❌ Could not access GitHub Actions${NC}"
    echo -e "   Check your repository and permissions"
    exit 1
fi

echo -e "${GREEN}✅ GitHub Actions access working${NC}"

RUN_COUNT=$(gh run list --limit 10 --json databaseId 2>/dev/null | jq length)
echo -e "   Found ${RUN_COUNT} recent workflow runs"
echo ""

# Show available scripts
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📦 Available Automation Scripts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "1. ${GREEN}get-build-logs.sh${NC}"
echo -e "   Get logs from latest failed build"
echo -e "   ${YELLOW}Usage:${NC} ./scripts/get-build-logs.sh"
echo ""
echo -e "2. ${GREEN}watch-builds.sh${NC} ⭐"
echo -e "   Monitor builds continuously"
echo -e "   ${YELLOW}Usage:${NC} ./scripts/watch-builds.sh"
echo ""
echo -e "3. ${GREEN}auto-fix-build.sh${NC}"
echo -e "   Auto-generate fix request for Cursor"
echo -e "   ${YELLOW}Usage:${NC} ./scripts/auto-fix-build.sh"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Offer to test
echo -e "${YELLOW}🧪 Test the setup?${NC}"
echo ""
echo "Options:"
echo "  1. Test get-build-logs.sh (check for any failed builds)"
echo "  2. Start watch-builds.sh (monitor continuously)"
echo "  3. Skip testing (I'll do it later)"
echo ""
read -p "Choose [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Running get-build-logs.sh...${NC}"
        echo ""
        ./scripts/get-build-logs.sh
        ;;
    2)
        echo ""
        echo -e "${BLUE}🚀 Starting watch-builds.sh...${NC}"
        echo -e "${YELLOW}   Press Ctrl+C to stop${NC}"
        echo ""
        sleep 2
        ./scripts/watch-builds.sh
        ;;
    3)
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        ;;
    *)
        echo ""
        echo -e "${YELLOW}⚠️  Invalid choice, skipping test${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Automation Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${MAGENTA}📚 Next Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Read the guides:${NC}"
echo "   - AUTOMATION_GUIDE.md (complete setup)"
echo "   - QUICK_DEBUG_GUIDE.md (quick reference)"
echo ""
echo -e "2. ${YELLOW}Try the scripts:${NC}"
echo "   ./scripts/get-build-logs.sh   # One-time fetch"
echo "   ./scripts/watch-builds.sh     # Continuous monitoring"
echo "   ./scripts/auto-fix-build.sh   # Auto-fix helper"
echo ""
echo -e "3. ${YELLOW}Enable GitHub notifications:${NC}"
echo "   git add .github/workflows/notify-on-failure.yml"
echo "   git commit -m 'feat: add build failure notifications'"
echo "   git push origin main"
echo ""
echo -e "${GREEN}Happy automating! 🚀${NC}"
echo ""

