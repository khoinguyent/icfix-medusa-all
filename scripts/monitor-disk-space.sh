#!/bin/bash

#############################################################
# Disk Space Monitoring Script
# 
# Purpose: Monitor disk space and alert if usage is high
# Usage: ./monitor-disk-space.sh [--threshold 80]
#############################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default threshold (%)
THRESHOLD=80

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --threshold)
      THRESHOLD="$2"
      shift 2
      ;;
    *)
      echo "Usage: $0 [--threshold 80]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Disk Space Monitor                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check root partition
echo -e "${GREEN}Root Partition (/)${NC}"
ROOT_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
ROOT_INFO=$(df -h / | tail -1 | awk '{print $3 " used of " $2 " (" $5 " used)"}')

echo "  $ROOT_INFO"

if [ "$ROOT_USAGE" -gt "$THRESHOLD" ]; then
  echo -e "  ${RED}⚠ WARNING: Disk usage above ${THRESHOLD}%!${NC}"
else
  echo -e "  ${GREEN}✓ Disk usage OK${NC}"
fi

# Check /var/log
echo ""
echo -e "${GREEN}Log Directory (/var/log)${NC}"
if [ -d "/var/log" ]; then
  LOG_SIZE=$(du -sh /var/log 2>/dev/null | awk '{print $1}')
  echo "  Total size: $LOG_SIZE"
  
  # Show top 5 largest log files
  echo "  Top 5 largest log files:"
  du -ah /var/log 2>/dev/null | sort -rh | head -5 | while read size file; do
    echo "    $size - $file"
  done
fi

# Check Docker
echo ""
echo -e "${GREEN}Docker Storage${NC}"
if command -v docker &> /dev/null; then
  if [ -d "/var/lib/docker" ]; then
    DOCKER_SIZE=$(du -sh /var/lib/docker 2>/dev/null | awk '{print $1}')
    echo "  Total Docker size: $DOCKER_SIZE"
    
    # Docker system df
    echo "  Docker breakdown:"
    docker system df 2>/dev/null | tail -n +2 | while IFS= read -r line; do
      echo "    $line"
    done
  fi
else
  echo "  Docker not installed"
fi

# Check journal logs
echo ""
echo -e "${GREEN}Journal Logs${NC}"
if command -v journalctl &> /dev/null; then
  JOURNAL_SIZE=$(journalctl --disk-usage 2>/dev/null | grep -oP '\d+\.\d+[GM]' || echo "Unknown")
  echo "  Journal size: $JOURNAL_SIZE"
else
  echo "  journalctl not available"
fi

# Check APT cache
echo ""
echo -e "${GREEN}APT Cache${NC}"
if [ -d "/var/cache/apt/archives" ]; then
  APT_SIZE=$(du -sh /var/cache/apt/archives 2>/dev/null | awk '{print $1}')
  echo "  APT cache size: $APT_SIZE"
fi

# Recommendations
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$ROOT_USAGE" -gt "$THRESHOLD" ]; then
  echo -e "${YELLOW}Recommendations to free up space:${NC}"
  echo "  1. Clean logs: sudo ./clean-server-logs.sh --medium"
  echo "  2. Clean Docker: docker system prune -a --volumes"
  echo "  3. Clean APT cache: sudo apt-get clean && sudo apt-get autoclean"
  echo "  4. Check large files: sudo du -ah / | sort -rh | head -20"
else
  echo -e "${GREEN}✓ Disk space looks good!${NC}"
fi

echo ""

