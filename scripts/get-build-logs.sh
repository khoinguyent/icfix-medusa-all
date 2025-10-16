#!/bin/bash

# ===================================================
# GitHub Actions Build Log Fetcher for Cursor
# ===================================================
# This script fetches the latest failed GitHub Actions 
# build logs and formats them for easy copying to Cursor
# ===================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 GitHub Actions Build Log Fetcher${NC}"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  macOS:    brew install gh"
    echo "  Linux:    sudo apt install gh"
    echo "  Windows:  choco install gh"
    echo ""
    echo "Then authenticate with: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo ""
    echo "Authenticate with: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Get the latest workflow runs
echo -e "${YELLOW}📋 Fetching recent workflow runs...${NC}"
echo ""

# Get latest failed run
FAILED_RUN=$(gh run list --status failure --limit 1 --json databaseId,name,displayTitle,createdAt,workflowName --jq '.[0]')

if [ -z "$FAILED_RUN" ] || [ "$FAILED_RUN" == "null" ]; then
    echo -e "${GREEN}✅ No failed runs found - everything is working!${NC}"
    echo ""
    echo "Recent successful runs:"
    gh run list --status success --limit 5
    exit 0
fi

# Extract run details
RUN_ID=$(echo $FAILED_RUN | jq -r '.databaseId')
RUN_NAME=$(echo $FAILED_RUN | jq -r '.name')
RUN_TITLE=$(echo $FAILED_RUN | jq -r '.displayTitle')
RUN_WORKFLOW=$(echo $FAILED_RUN | jq -r '.workflowName')
RUN_DATE=$(echo $FAILED_RUN | jq -r '.createdAt')

echo -e "${RED}❌ Found failed run:${NC}"
echo "  ID:       $RUN_ID"
echo "  Workflow: $RUN_WORKFLOW"
echo "  Title:    $RUN_TITLE"
echo "  Date:     $RUN_DATE"
echo ""

# Fetch the logs
echo -e "${YELLOW}📥 Fetching error logs...${NC}"
LOG_FILE="github-actions-error-$(date +%Y%m%d-%H%M%S).log"
gh run view $RUN_ID --log-failed > "$LOG_FILE" 2>&1

echo -e "${GREEN}✅ Logs saved to: $LOG_FILE${NC}"
echo ""

# Get workflow file content
echo -e "${YELLOW}📄 Fetching workflow configuration...${NC}"
WORKFLOW_FILE=""
if [[ "$RUN_WORKFLOW" == *"docker-build"* ]]; then
    WORKFLOW_FILE=".github/workflows/docker-build.yml"
elif [[ "$RUN_WORKFLOW" == *"deploy-backend"* ]] || [[ "$RUN_WORKFLOW" == *"Backend"* ]]; then
    WORKFLOW_FILE=".github/workflows/deploy-backend.yml"
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Get latest commit info
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Ready to share with Cursor!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📋 COPY THE TEXT BELOW AND PASTE INTO CURSOR:${NC}"
echo ""
echo "---START OF MESSAGE---"
echo ""
cat << EOF
GitHub Actions build is failing. Please help fix it.

**Workflow Details:**
- Workflow: $RUN_WORKFLOW
- Run ID: $RUN_ID
- Branch: $CURRENT_BRANCH
- Commit: $COMMIT_SHA
- Commit Message: $COMMIT_MSG
- Failed At: $RUN_DATE

**Error Title:**
$RUN_TITLE

**Build Logs:**
\`\`\`
EOF

# Show the actual error (first 100 lines or all if less)
cat "$LOG_FILE" | head -n 100

cat << EOF
\`\`\`

EOF

if [ -n "$WORKFLOW_FILE" ] && [ -f "$WORKFLOW_FILE" ]; then
    echo "**Workflow Configuration:** ($WORKFLOW_FILE)"
    echo "\`\`\`yaml"
    cat "$WORKFLOW_FILE"
    echo "\`\`\`"
    echo ""
fi

# Show Dockerfile
if [ -f "icfix/Dockerfile" ]; then
    echo "**Dockerfile:** (icfix/Dockerfile)"
    echo "\`\`\`dockerfile"
    head -n 50 icfix/Dockerfile
    echo "\`\`\`"
    echo ""
fi

# Show directory structure
echo "**Build Context Directory:**"
echo "\`\`\`"
ls -la icfix/ 2>/dev/null | head -n 20 || echo "Could not list icfix/ directory"
echo "\`\`\`"
echo ""

cat << EOF
**Request:**
Please analyze the error logs above and:
1. Identify the root cause of the build failure
2. Fix the issue in the appropriate file(s)
3. Explain what was wrong and how you fixed it

Thank you!
EOF

echo ""
echo "---END OF MESSAGE---"
echo ""
echo "=================================================="
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  1. Copy everything between START and END markers"
echo "  2. Paste into Cursor chat"
echo "  3. Cursor will analyze and fix the issue"
echo "  4. Review the changes before committing"
echo ""
echo -e "${BLUE}📝 Full logs saved to: $LOG_FILE${NC}"
echo ""
echo -e "${YELLOW}🔗 View online:${NC}"
echo "  https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$RUN_ID"
echo ""
echo "=================================================="

