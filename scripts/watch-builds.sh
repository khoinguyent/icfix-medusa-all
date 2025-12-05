#!/bin/bash

# ===================================================
# GitHub Actions Build Watcher & Auto-Debugger
# ===================================================
# This script watches for failed builds and automatically
# prepares debug information for Cursor
# ===================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
WATCH_INTERVAL=${WATCH_INTERVAL:-30}  # Check every 30 seconds
LOG_DIR="./logs/github-actions"
LAST_RUN_FILE="$LOG_DIR/.last_run_id"

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}🔄 GitHub Actions Build Watcher${NC}"
echo "=================================================="
echo "Watching for build failures every ${WATCH_INTERVAL}s"
echo "Press Ctrl+C to stop"
echo "=================================================="
echo ""

# Function to check GitHub CLI
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) not installed${NC}"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}❌ Not authenticated with GitHub${NC}"
        exit 1
    fi
}

# Function to get latest run
get_latest_run() {
    gh run list --limit 1 --json databaseId,status,conclusion,name,createdAt,workflowName \
        --jq '.[0]'
}

# Function to generate debug report
generate_debug_report() {
    local RUN_ID=$1
    local RUN_INFO=$2
    
    local RUN_NAME=$(echo $RUN_INFO | jq -r '.name')
    local RUN_WORKFLOW=$(echo $RUN_INFO | jq -r '.workflowName')
    local RUN_DATE=$(echo $RUN_INFO | jq -r '.createdAt')
    
    local TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    local LOG_FILE="$LOG_DIR/build-failure-${TIMESTAMP}.log"
    local REPORT_FILE="$LOG_DIR/cursor-report-${TIMESTAMP}.md"
    
    echo "📥 Fetching logs..."
    gh run view $RUN_ID --log-failed > "$LOG_FILE" 2>&1
    
    echo "📝 Generating Cursor report..."
    
    # Get current context
    local CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    local COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")
    
    # Generate comprehensive report
    cat > "$REPORT_FILE" << EOF
# GitHub Actions Build Failure Report

**Auto-generated at:** $(date)

## Build Information

- **Workflow:** $RUN_WORKFLOW
- **Run ID:** $RUN_ID
- **Status:** FAILED ❌
- **Branch:** $CURRENT_BRANCH
- **Commit:** $COMMIT_SHA
- **Commit Message:** $COMMIT_MSG
- **Failed At:** $RUN_DATE

## Error Logs

\`\`\`
$(cat "$LOG_FILE" | head -n 150)
\`\`\`

## Build Context

### Dockerfile
\`\`\`dockerfile
$(cat icfix/Dockerfile 2>/dev/null || echo "Dockerfile not found")
\`\`\`

### Workflow Configuration
\`\`\`yaml
$(cat .github/workflows/docker-build.yml 2>/dev/null || cat .github/workflows/deploy-backend.yml 2>/dev/null || echo "Workflow file not found")
\`\`\`

### Build Directory Structure
\`\`\`
$(ls -la icfix/ 2>/dev/null | head -n 30 || echo "Could not list icfix/ directory")
\`\`\`

### Package.json (first 50 lines)
\`\`\`json
$(cat icfix/package.json 2>/dev/null | head -n 50 || echo "package.json not found")
\`\`\`

## Action Required

Please analyze the error logs above and:
1. Identify the root cause of the build failure
2. Fix the issue in the appropriate file(s)
3. Test the fix locally if possible
4. Explain what was wrong and how you fixed it

---

**View online:** https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$RUN_ID
EOF
    
    echo "$REPORT_FILE"
}

# Function to send desktop notification (macOS)
send_notification() {
    local TITLE=$1
    local MESSAGE=$2
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\""
    fi
}

# Function to open in Cursor automatically
open_in_cursor() {
    local REPORT_FILE=$1
    
    if command -v cursor &> /dev/null; then
        echo -e "${GREEN}🚀 Opening in Cursor...${NC}"
        cursor "$REPORT_FILE"
        return 0
    fi
    
    # Try alternative commands
    if command -v code &> /dev/null; then
        echo -e "${GREEN}🚀 Opening in VS Code...${NC}"
        code "$REPORT_FILE"
        return 0
    fi
    
    return 1
}

# Main watch loop
watch_builds() {
    check_gh_cli
    
    # Get initial state
    if [ -f "$LAST_RUN_FILE" ]; then
        LAST_KNOWN_RUN=$(cat "$LAST_RUN_FILE")
    else
        LAST_KNOWN_RUN=""
    fi
    
    echo -e "${GREEN}✅ Watcher started${NC}"
    echo ""
    
    local CHECK_COUNT=0
    
    while true; do
        CHECK_COUNT=$((CHECK_COUNT + 1))
        
        # Get latest run
        LATEST_RUN=$(get_latest_run)
        
        if [ -z "$LATEST_RUN" ] || [ "$LATEST_RUN" == "null" ]; then
            echo -e "${YELLOW}[$(date +'%H:%M:%S')] Check #${CHECK_COUNT}: No runs found${NC}"
            sleep $WATCH_INTERVAL
            continue
        fi
        
        RUN_ID=$(echo $LATEST_RUN | jq -r '.databaseId')
        RUN_STATUS=$(echo $LATEST_RUN | jq -r '.status')
        RUN_CONCLUSION=$(echo $LATEST_RUN | jq -r '.conclusion')
        RUN_NAME=$(echo $LATEST_RUN | jq -r '.name')
        
        # Check if this is a new run
        if [ "$RUN_ID" != "$LAST_KNOWN_RUN" ]; then
            echo -e "${BLUE}[$(date +'%H:%M:%S')] New run detected: #${RUN_ID}${NC}"
            
            # Save as last known run
            echo "$RUN_ID" > "$LAST_RUN_FILE"
            LAST_KNOWN_RUN=$RUN_ID
            
            # Check if completed
            if [ "$RUN_STATUS" == "completed" ]; then
                if [ "$RUN_CONCLUSION" == "failure" ]; then
                    echo -e "${RED}❌ Build FAILED!${NC}"
                    echo -e "${YELLOW}⚙️  Generating debug report...${NC}"
                    
                    REPORT_FILE=$(generate_debug_report "$RUN_ID" "$LATEST_RUN")
                    
                    echo -e "${GREEN}✅ Report saved: $REPORT_FILE${NC}"
                    echo ""
                    echo "=================================================="
                    echo -e "${MAGENTA}📋 CURSOR REPORT READY${NC}"
                    echo "=================================================="
                    echo ""
                    echo "Option 1: Open the report file and copy to Cursor:"
                    echo "  $REPORT_FILE"
                    echo ""
                    echo "Option 2: Quick view:"
                    cat "$REPORT_FILE"
                    echo ""
                    echo "=================================================="
                    
                    # Send notification
                    send_notification "Build Failed! 🚨" "Run #${RUN_ID} - $RUN_NAME"
                    
                    # Try to open in Cursor
                    if ! open_in_cursor "$REPORT_FILE"; then
                        echo -e "${YELLOW}💡 Tip: Install Cursor CLI to auto-open reports${NC}"
                    fi
                    
                elif [ "$RUN_CONCLUSION" == "success" ]; then
                    echo -e "${GREEN}✅ Build SUCCESS!${NC}"
                    send_notification "Build Succeeded! ✅" "Run #${RUN_ID} - $RUN_NAME"
                else
                    echo -e "${YELLOW}⚠️  Build $RUN_CONCLUSION${NC}"
                fi
            else
                echo -e "${BLUE}🔄 Build in progress...${NC}"
            fi
        else
            # Same run, just show status
            if [ "$RUN_STATUS" == "in_progress" ] || [ "$RUN_STATUS" == "queued" ]; then
                echo -e "${BLUE}[$(date +'%H:%M:%S')] Check #${CHECK_COUNT}: Build #${RUN_ID} - ${RUN_STATUS}${NC}"
            else
                echo -e "${GREEN}[$(date +'%H:%M:%S')] Check #${CHECK_COUNT}: Latest build #${RUN_ID} - ${RUN_CONCLUSION}${NC}"
            fi
        fi
        
        sleep $WATCH_INTERVAL
    done
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}👋 Watcher stopped${NC}"; exit 0' INT

# Start watching
watch_builds

