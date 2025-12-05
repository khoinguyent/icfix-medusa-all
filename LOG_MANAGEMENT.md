# Log Management for Ubuntu Server

Complete guide for managing logs on your Ubuntu server to prevent disk space issues.

## 📋 Quick Start

### 1. **Setup Log Rotation (Run Once)**
```bash
cd /path/to/medusa
sudo ./scripts/setup-log-rotation.sh
```

This will:
- Configure Docker log rotation (max 10MB per file, 3 files)
- Configure Medusa log rotation (daily, 14 days retention)
- Configure Nginx log rotation (if installed)
- Set up automatic weekly log cleaning

### 2. **Clean Logs Manually**
```bash
# Preview what would be deleted (dry run)
sudo ./scripts/clean-server-logs.sh --dry-run

# Light cleaning (keeps last 3 days)
sudo ./scripts/clean-server-logs.sh --light

# Medium cleaning (keeps last 7 days) - RECOMMENDED
sudo ./scripts/clean-server-logs.sh --medium

# Heavy cleaning (keeps last 1 day)
sudo ./scripts/clean-server-logs.sh --heavy
```

### 3. **Monitor Disk Space**
```bash
# Check current disk usage
./scripts/monitor-disk-space.sh

# Set custom alert threshold (default 80%)
./scripts/monitor-disk-space.sh --threshold 90
```

---

## 🛠️ Scripts Overview

### `setup-log-rotation.sh`
**Purpose:** One-time setup for automatic log management

**What it does:**
- Creates logrotate configs for Docker, Medusa, and Nginx
- Limits Docker log files (10MB max per file)
- Schedules weekly automatic cleaning
- Tests configuration validity

**Usage:**
```bash
sudo ./scripts/setup-log-rotation.sh
```

**Post-setup actions:**
```bash
# Restart Docker to apply log limits
sudo systemctl restart docker

# Manually trigger log rotation (optional)
sudo logrotate -f /etc/logrotate.d/docker-containers
```

---

### `clean-server-logs.sh`
**Purpose:** Manual log cleaning with multiple safety levels

**Features:**
- ✅ Cleans system logs (/var/log)
- ✅ Cleans journal logs (systemd)
- ✅ Cleans Docker container logs
- ✅ Cleans APT cache
- ✅ Cleans temporary files
- ✅ Shows before/after disk space
- ✅ Dry-run mode for safety

**Options:**
```bash
--light     # Keep 3 days (gentle cleaning)
--medium    # Keep 7 days (recommended for most servers)
--heavy     # Keep 1 day (aggressive cleaning)
--dry-run   # Preview without deleting
```

**Examples:**
```bash
# Safe preview
sudo ./scripts/clean-server-logs.sh --dry-run

# Recommended weekly cleaning
sudo ./scripts/clean-server-logs.sh --medium

# Emergency disk space recovery
sudo ./scripts/clean-server-logs.sh --heavy

# Minimal cleaning for recent investigation needs
sudo ./scripts/clean-server-logs.sh --light
```

**What gets cleaned:**
1. **System logs** in `/var/log`
   - Old .log files
   - Compressed logs (.gz, .bz2, .xz)
   - Rotated logs (.1, .2, etc.)

2. **Journal logs** (systemd)
   - Keeps only recent days based on mode

3. **Docker logs**
   - Container logs larger than 10MB
   - Unused images/containers/volumes
   - Build cache

4. **APT cache**
   - Downloaded .deb packages
   - Package lists
   - Unused dependencies

5. **Temporary files**
   - `/tmp` and `/var/tmp` older than specified days

---

### `monitor-disk-space.sh`
**Purpose:** Check disk usage and get recommendations

**Features:**
- Shows root partition usage
- Shows /var/log size with largest files
- Shows Docker storage breakdown
- Shows journal log size
- Shows APT cache size
- Provides cleanup recommendations when needed

**Usage:**
```bash
# Standard check (alerts at 80%)
./scripts/monitor-disk-space.sh

# Custom threshold
./scripts/monitor-disk-space.sh --threshold 90
```

**Sample output:**
```
╔════════════════════════════════════════════════════════╗
║   Disk Space Monitor                                   ║
╚════════════════════════════════════════════════════════╝

Root Partition (/)
  45G used of 100G (45% used)
  ✓ Disk usage OK

Log Directory (/var/log)
  Total size: 2.3G
  Top 5 largest log files:
    856M - /var/log/journal/...
    345M - /var/log/syslog
    128M - /var/log/docker/...

Docker Storage
  Total Docker size: 12.5G
  Docker breakdown:
    Images     8.2GB
    Containers 2.1GB
    Volumes    2.2GB
```

---

## 🔄 Automatic Scheduling

After running `setup-log-rotation.sh`, logs are automatically managed:

### Daily (via logrotate)
- **6:25 AM**: System log rotation
- Medusa logs rotated (keeps 14 days)
- Docker logs rotated (keeps 3 files × 10MB each)
- Nginx logs rotated (if installed)

### Weekly (via cron)
- **Sunday 2:00 AM**: Full log cleaning
- Runs `clean-server-logs.sh --medium`
- Results logged to `/var/log/log-cleaning.log`

### Check schedule
```bash
# View cron jobs
sudo crontab -l

# View logrotate status
sudo cat /var/lib/logrotate/status

# View log cleaning history
sudo cat /var/log/log-cleaning.log
```

---

## 📊 Disk Space Best Practices

### Prevention
1. **Set up log rotation early** (before issues occur)
2. **Monitor regularly** (weekly checks recommended)
3. **Set alerts** at 80% usage
4. **Plan capacity** for expected growth

### Maintenance Schedule
```bash
# Daily - automated via logrotate
# Nothing to do manually

# Weekly - automated via cron
# Verify: sudo tail /var/log/log-cleaning.log

# Monthly - manual check
./scripts/monitor-disk-space.sh

# Quarterly - deep clean
sudo ./scripts/clean-server-logs.sh --heavy
docker system prune -a --volumes
```

### Emergency Cleanup (Disk > 90%)
```bash
# 1. Check what's using space
sudo du -ah / | sort -rh | head -20

# 2. Clean aggressively
sudo ./scripts/clean-server-logs.sh --heavy

# 3. Clean Docker thoroughly
docker system prune -a --volumes -f

# 4. Clean APT
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y

# 5. Find and remove large files
find /var/log -type f -size +100M -ls

# 6. Check Docker overlay2
sudo du -sh /var/lib/docker/overlay2/*
```

---

## 🐳 Docker-Specific Log Management

### Check Docker Logs
```bash
# Check all container log sizes
docker ps -a --format '{{.Names}}' | while read container; do
  echo -n "$container: "
  docker inspect --format='{{.LogPath}}' $container | xargs du -h 2>/dev/null || echo "N/A"
done

# View container logs
docker logs medusa --tail 100

# Follow container logs
docker logs -f medusa
```

### Clean Docker Logs
```bash
# Truncate specific container logs
docker inspect --format='{{.LogPath}}' medusa | xargs truncate -s 0

# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove everything unused (CAREFUL!)
docker system prune -a --volumes -f
```

### Docker Log Configuration
The log rotation setup configures `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "compress": "true"
  }
}
```

This limits each container to 3 files × 10MB = 30MB maximum.

---

## 📁 Directory Sizes Reference

Typical sizes on a healthy server:

| Directory | Healthy Size | Warning Threshold |
|-----------|--------------|-------------------|
| `/var/log` | < 2GB | > 5GB |
| `/var/lib/docker` | < 20GB | > 50GB |
| `/var/cache/apt` | < 500MB | > 2GB |
| Journal | < 1GB | > 3GB |

Check sizes:
```bash
du -sh /var/log
du -sh /var/lib/docker
du -sh /var/cache/apt
journalctl --disk-usage
```

---

## 🔍 Troubleshooting

### "Permission denied" errors
```bash
# Run with sudo
sudo ./scripts/clean-server-logs.sh --medium
```

### "Docker daemon failed to start" after log rotation setup
```bash
# Check daemon.json syntax
sudo cat /etc/docker/daemon.json

# Restart Docker
sudo systemctl restart docker
sudo systemctl status docker
```

### Cron job not running
```bash
# Check cron status
sudo systemctl status cron

# Check cron logs
sudo grep CRON /var/log/syslog

# Manually test the script
sudo /path/to/scripts/clean-server-logs.sh --medium
```

### Logs still growing despite rotation
```bash
# Check logrotate status
sudo cat /var/lib/logrotate/status

# Force rotation
sudo logrotate -f /etc/logrotate.conf

# Check for processes holding deleted files
sudo lsof | grep deleted
```

---

## 📝 Additional Resources

### View Log Files
```bash
# System logs
sudo tail -f /var/log/syslog
sudo journalctl -f

# Docker logs
docker logs medusa --tail 100 -f

# Nginx logs (if installed)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Analyze Log Growth
```bash
# Watch log directory grow
watch -n 5 'du -sh /var/log'

# Find rapidly growing logs
while true; do
  du -sh /var/log/* | sort -h | tail -5
  sleep 60
done
```

### Set up Email Alerts
Add to `monitor-disk-space.sh` cron:
```bash
# Check disk space and email if > 80%
0 */4 * * * /path/to/scripts/monitor-disk-space.sh | mail -s "Disk Space Alert" admin@example.com
```

---

## ⚙️ Configuration Files

After setup, these files are created:

- `/etc/logrotate.d/docker-containers` - Docker log rotation
- `/etc/logrotate.d/medusa` - Medusa log rotation  
- `/etc/logrotate.d/nginx` - Nginx log rotation
- `/etc/docker/daemon.json` - Docker log limits
- `/var/log/log-cleaning.log` - Cleaning history

---

## 🎯 Quick Command Reference

```bash
# Setup (once)
sudo ./scripts/setup-log-rotation.sh

# Monitor
./scripts/monitor-disk-space.sh

# Clean (weekly recommended)
sudo ./scripts/clean-server-logs.sh --medium

# Emergency cleanup
sudo ./scripts/clean-server-logs.sh --heavy
docker system prune -a --volumes -f

# Check disk usage
df -h
du -sh /var/log
du -sh /var/lib/docker

# View largest files
sudo du -ah / | sort -rh | head -20
```

---

**Last Updated:** October 17, 2025  
**Maintained By:** DevOps Team

