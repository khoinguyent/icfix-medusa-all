#!/bin/bash

#############################################################
# Setup Log Rotation for Medusa Application
# 
# Purpose: Configure logrotate for Medusa and Docker logs
# Usage: sudo ./setup-log-rotation.sh
#############################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setting Up Log Rotation                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create log rotation config for Docker containers
echo -e "${GREEN}Creating Docker log rotation config...${NC}"

cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
    notifempty
}
EOF

echo "✓ Docker log rotation configured"

# Create log rotation config for Medusa application
echo -e "${GREEN}Creating Medusa log rotation config...${NC}"

mkdir -p /var/log/medusa

cat > /etc/logrotate.d/medusa << 'EOF'
/var/log/medusa/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        # Restart Medusa service if it exists
        if systemctl is-active --quiet medusa; then
            systemctl reload medusa > /dev/null 2>&1 || true
        fi
        # Or restart Docker container if using Docker
        if docker ps --format '{{.Names}}' | grep -q medusa; then
            docker restart $(docker ps --format '{{.Names}}' | grep medusa | head -1) > /dev/null 2>&1 || true
        fi
    endscript
}
EOF

echo "✓ Medusa log rotation configured"

# Create log rotation config for Nginx if installed
if command -v nginx &> /dev/null; then
  echo -e "${GREEN}Updating Nginx log rotation...${NC}"
  
  cat > /etc/logrotate.d/nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
  
  echo "✓ Nginx log rotation configured"
fi

# Configure Docker daemon to limit log size
echo -e "${GREEN}Configuring Docker log limits...${NC}"

if command -v docker &> /dev/null; then
  DOCKER_DAEMON_JSON="/etc/docker/daemon.json"
  
  # Backup existing config
  if [ -f "$DOCKER_DAEMON_JSON" ]; then
    cp "$DOCKER_DAEMON_JSON" "${DOCKER_DAEMON_JSON}.backup.$(date +%Y%m%d)"
    echo "✓ Backed up existing Docker daemon config"
  fi
  
  # Create or update daemon.json
  cat > "$DOCKER_DAEMON_JSON" << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "compress": "true"
  }
}
EOF
  
  echo "✓ Docker log limits configured (10MB max, 3 files, compressed)"
  echo -e "${YELLOW}Note: Restart Docker daemon to apply: sudo systemctl restart docker${NC}"
fi

# Test logrotate configuration
echo ""
echo -e "${GREEN}Testing logrotate configuration...${NC}"

if logrotate -d /etc/logrotate.d/docker-containers 2>&1 | grep -q "error"; then
  echo -e "${RED}✗ Docker log rotation config has errors${NC}"
else
  echo "✓ Docker log rotation config is valid"
fi

if logrotate -d /etc/logrotate.d/medusa 2>&1 | grep -q "error"; then
  echo -e "${RED}✗ Medusa log rotation config has errors${NC}"
else
  echo "✓ Medusa log rotation config is valid"
fi

# Create cron job for automatic log cleaning
echo ""
echo -e "${GREEN}Setting up automatic log cleaning...${NC}"

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CLEAN_SCRIPT="$SCRIPT_DIR/clean-server-logs.sh"

if [ -f "$CLEAN_SCRIPT" ]; then
  chmod +x "$CLEAN_SCRIPT"
  
  # Add to crontab if not already present
  CRON_LINE="0 2 * * 0 $CLEAN_SCRIPT --medium > /var/log/log-cleaning.log 2>&1"
  
  if ! crontab -l 2>/dev/null | grep -q "clean-server-logs.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✓ Added weekly log cleaning to crontab (Sunday 2 AM)"
  else
    echo "✓ Log cleaning cron job already exists"
  fi
else
  echo -e "${YELLOW}⚠ clean-server-logs.sh not found, skipping cron setup${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Log rotation setup completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Configuration summary:"
echo "  • Docker logs: Max 10MB per file, 3 files retained, compressed"
echo "  • Medusa logs: Rotated daily, 14 days retention"
echo "  • Nginx logs: Rotated daily, 14 days retention (if installed)"
echo "  • Auto-cleaning: Weekly on Sunday at 2 AM"
echo ""
echo "To manually rotate logs now:"
echo "  sudo logrotate -f /etc/logrotate.d/docker-containers"
echo "  sudo logrotate -f /etc/logrotate.d/medusa"
echo ""
echo "To manually clean logs now:"
echo "  sudo $SCRIPT_DIR/clean-server-logs.sh --medium"
echo ""
echo -e "${YELLOW}Remember to restart Docker daemon to apply log limits:${NC}"
echo "  sudo systemctl restart docker"
echo ""

