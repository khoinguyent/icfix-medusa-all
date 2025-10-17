#!/bin/bash

#############################################################
# Ubuntu Server Log Cleaning Script
# 
# Purpose: Safely clean various log files to free up disk space
# Usage: sudo ./clean-server-logs.sh [OPTIONS]
# 
# Options:
#   --light    : Light cleaning (keeps last 3 days)
#   --medium   : Medium cleaning (keeps last 7 days) [DEFAULT]
#   --heavy    : Heavy cleaning (keeps last 1 day)
#   --dry-run  : Show what would be deleted without deleting
#############################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default settings
KEEP_DAYS=7
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --light)
      KEEP_DAYS=3
      shift
      ;;
    --medium)
      KEEP_DAYS=7
      shift
      ;;
    --heavy)
      KEEP_DAYS=1
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: sudo $0 [--light|--medium|--heavy] [--dry-run]"
      exit 1
      ;;
  esac
done

# Check if running as root
if [ "$EUID" -ne 0 ] && [ "$DRY_RUN" = false ]; then 
  echo -e "${RED}Error: Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Ubuntu Server Log Cleaning Script                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Mode: Keeping logs from last ${KEEP_DAYS} days${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN MODE - No files will be deleted${NC}"
fi
echo ""

# Function to print section headers
print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to show disk space
show_disk_space() {
  echo -e "${GREEN}Current disk usage:${NC}"
  df -h / | tail -1 | awk '{print "Root: " $3 " used / " $2 " total (" $5 " used)"}'
  if [ -d "/var/lib/docker" ]; then
    du -sh /var/lib/docker 2>/dev/null | awk '{print "Docker: " $1}'
  fi
  if [ -d "/var/log" ]; then
    du -sh /var/log 2>/dev/null | awk '{print "Logs: " $1}'
  fi
}

# Show initial disk space
print_section "📊 Initial Disk Space"
show_disk_space
INITIAL_SPACE=$(df / | tail -1 | awk '{print $4}')

# Clean system logs
print_section "🗑️  Cleaning System Logs"

if [ "$DRY_RUN" = true ]; then
  echo "Would clean logs in /var/log older than ${KEEP_DAYS} days:"
  find /var/log -type f -name "*.log" -mtime +${KEEP_DAYS} 2>/dev/null || true
  find /var/log -type f -name "*.gz" -mtime +${KEEP_DAYS} 2>/dev/null || true
  find /var/log -type f -name "*.1" -mtime +${KEEP_DAYS} 2>/dev/null || true
else
  echo "Cleaning old log files..."
  find /var/log -type f -name "*.log" -mtime +${KEEP_DAYS} -delete 2>/dev/null && echo "✓ Deleted old .log files" || true
  find /var/log -type f -name "*.gz" -mtime +${KEEP_DAYS} -delete 2>/dev/null && echo "✓ Deleted old .gz files" || true
  find /var/log -type f -name "*.1" -mtime +${KEEP_DAYS} -delete 2>/dev/null && echo "✓ Deleted old .1 files" || true
  
  # Truncate large current log files
  echo "Truncating large current log files (keeping last 10000 lines)..."
  for log in /var/log/*.log; do
    if [ -f "$log" ] && [ $(wc -l < "$log" 2>/dev/null || echo 0) -gt 10000 ]; then
      tail -10000 "$log" > "$log.tmp" && mv "$log.tmp" "$log"
      echo "✓ Truncated $(basename $log)"
    fi
  done
fi

# Clean journal logs
print_section "📝 Cleaning Journal Logs"

if [ "$DRY_RUN" = true ]; then
  echo "Would run: journalctl --vacuum-time=${KEEP_DAYS}d"
  journalctl --disk-usage 2>/dev/null || echo "Journal not available"
else
  if command -v journalctl &> /dev/null; then
    echo "Current journal size:"
    journalctl --disk-usage 2>/dev/null || true
    echo ""
    echo "Cleaning journal logs older than ${KEEP_DAYS} days..."
    journalctl --vacuum-time=${KEEP_DAYS}d 2>/dev/null && echo "✓ Journal cleaned" || echo "⚠ Journal cleaning skipped"
    echo ""
    echo "New journal size:"
    journalctl --disk-usage 2>/dev/null || true
  else
    echo "⚠ journalctl not available"
  fi
fi

# Clean Docker logs
print_section "🐳 Cleaning Docker Logs"

if command -v docker &> /dev/null; then
  if [ "$DRY_RUN" = true ]; then
    echo "Would clean Docker logs..."
    docker ps -a --format '{{.Names}}' 2>/dev/null | head -5 || true
  else
    echo "Cleaning Docker container logs..."
    
    # Get all container IDs
    CONTAINERS=$(docker ps -aq 2>/dev/null || echo "")
    
    if [ -n "$CONTAINERS" ]; then
      for container in $CONTAINERS; do
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' $container 2>/dev/null | sed 's/^.//')
        LOG_FILE=$(docker inspect --format='{{.LogPath}}' $container 2>/dev/null)
        
        if [ -f "$LOG_FILE" ]; then
          LOG_SIZE=$(du -h "$LOG_FILE" 2>/dev/null | cut -f1)
          
          # Truncate logs larger than 10MB
          if [ $(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 10485760 ]; then
            truncate -s 0 "$LOG_FILE" 2>/dev/null && \
              echo "✓ Truncated logs for $CONTAINER_NAME (was $LOG_SIZE)" || true
          fi
        fi
      done
    else
      echo "No Docker containers found"
    fi
    
    # Clean Docker system
    echo ""
    echo "Running Docker system prune..."
    docker system prune -f --volumes 2>/dev/null && echo "✓ Docker system pruned" || echo "⚠ Docker prune failed"
  fi
else
  echo "⚠ Docker not installed"
fi

# Clean APT cache
print_section "📦 Cleaning APT Cache"

if [ "$DRY_RUN" = true ]; then
  echo "Would clean APT cache:"
  du -sh /var/cache/apt/archives 2>/dev/null || true
else
  if command -v apt-get &> /dev/null; then
    echo "Cleaning APT cache..."
    apt-get clean 2>/dev/null && echo "✓ APT cache cleaned" || echo "⚠ APT cleaning skipped"
    apt-get autoclean 2>/dev/null && echo "✓ APT autocleaned" || true
    apt-get autoremove -y 2>/dev/null && echo "✓ Unused packages removed" || true
  fi
fi

# Clean temporary files
print_section "🗑️  Cleaning Temporary Files"

if [ "$DRY_RUN" = true ]; then
  echo "Would clean temporary files older than ${KEEP_DAYS} days in /tmp"
  find /tmp -type f -mtime +${KEEP_DAYS} 2>/dev/null | head -10 || true
else
  echo "Cleaning old temporary files..."
  find /tmp -type f -mtime +${KEEP_DAYS} -delete 2>/dev/null && echo "✓ Old /tmp files deleted" || true
  find /var/tmp -type f -mtime +${KEEP_DAYS} -delete 2>/dev/null && echo "✓ Old /var/tmp files deleted" || true
fi

# Clean application-specific logs (Medusa)
print_section "📱 Cleaning Application Logs"

# Clean Medusa logs if they exist
MEDUSA_LOG_DIR="/var/log/medusa"
if [ -d "$MEDUSA_LOG_DIR" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo "Would clean Medusa logs in $MEDUSA_LOG_DIR"
    find "$MEDUSA_LOG_DIR" -type f -mtime +${KEEP_DAYS} 2>/dev/null || true
  else
    echo "Cleaning Medusa logs..."
    find "$MEDUSA_LOG_DIR" -type f -mtime +${KEEP_DAYS} -delete 2>/dev/null && \
      echo "✓ Old Medusa logs deleted" || echo "⚠ No Medusa logs to clean"
  fi
else
  echo "No Medusa log directory found at $MEDUSA_LOG_DIR"
fi

# Clean nginx logs if they exist
if [ -d "/var/log/nginx" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo "Would clean Nginx logs older than ${KEEP_DAYS} days"
  else
    echo "Cleaning Nginx logs..."
    find /var/log/nginx -type f -name "*.log.*" -mtime +${KEEP_DAYS} -delete 2>/dev/null && \
      echo "✓ Old Nginx logs deleted" || true
  fi
fi

# Clean GitHub Actions logs if in project directory
if [ -d "./logs/github-actions" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo "Would clean GitHub Actions logs older than ${KEEP_DAYS} days"
  else
    echo "Cleaning GitHub Actions logs..."
    find ./logs/github-actions -type f -mtime +${KEEP_DAYS} -delete 2>/dev/null && \
      echo "✓ Old GitHub Actions logs deleted" || true
  fi
fi

# Clean old compressed logs system-wide
print_section "🗜️  Cleaning Old Compressed Logs"

if [ "$DRY_RUN" = true ]; then
  echo "Would clean compressed logs older than ${KEEP_DAYS} days:"
  find /var/log -type f \( -name "*.gz" -o -name "*.bz2" -o -name "*.xz" \) -mtime +${KEEP_DAYS} 2>/dev/null | wc -l | xargs echo "Files:"
else
  echo "Removing old compressed logs..."
  DELETED=$(find /var/log -type f \( -name "*.gz" -o -name "*.bz2" -o -name "*.xz" \) -mtime +${KEEP_DAYS} -delete -print 2>/dev/null | wc -l)
  echo "✓ Deleted $DELETED compressed log files"
fi

# Show final disk space
print_section "📊 Final Disk Space"
show_disk_space

# Calculate space freed
FINAL_SPACE=$(df / | tail -1 | awk '{print $4}')
FREED_SPACE=$((FINAL_SPACE - INITIAL_SPACE))

echo ""
if [ "$DRY_RUN" = false ]; then
  if [ $FREED_SPACE -gt 0 ]; then
    FREED_MB=$((FREED_SPACE / 1024))
    echo -e "${GREEN}✓ Successfully freed approximately ${FREED_MB} MB${NC}"
  else
    echo -e "${YELLOW}⚠ No significant space was freed (may already be clean)${NC}"
  fi
fi

# Summary
print_section "📋 Summary"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN completed - no files were deleted${NC}"
  echo "To actually clean logs, run without --dry-run flag"
else
  echo -e "${GREEN}✓ Log cleaning completed successfully${NC}"
fi

echo ""
echo "Cleaning level: ${KEEP_DAYS} days retention"
echo ""
echo -e "${BLUE}Recommendations:${NC}"
echo "• Schedule this script with cron for automatic cleaning"
echo "• Consider setting up log rotation for application logs"
echo "• Monitor disk space regularly with 'df -h'"
echo "• Use '--dry-run' to preview before cleaning"
echo ""

# Offer to schedule with cron
if [ "$DRY_RUN" = false ] && [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}💡 Tip: Add to crontab for weekly automatic cleaning:${NC}"
  echo "   0 2 * * 0 $(readlink -f $0) --medium > /var/log/log-cleaning.log 2>&1"
  echo ""
fi

echo -e "${GREEN}Done!${NC}"

