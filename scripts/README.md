# 🔧 Scripts Directory

Automation and utility scripts for the Medusa platform.

---

## 🤖 Build Failure Automation Scripts

### **get-build-logs.sh** ⭐
**Purpose:** Fetch logs from the latest failed GitHub Actions build

**Usage:**
```bash
./scripts/get-build-logs.sh
```

**Features:**
- Fetches latest failed build logs
- Formats for Cursor AI
- Includes Dockerfile, workflow config, and build context
- Copy-paste ready output

**Use when:** You notice a build failed and want to quickly debug it

---

### **watch-builds.sh** 🔄
**Purpose:** Continuously monitor GitHub Actions for build failures

**Usage:**
```bash
# Run in foreground
./scripts/watch-builds.sh

# Run in background
nohup ./scripts/watch-builds.sh > logs/watcher.log 2>&1 &
```

**Features:**
- Checks for failures every 30 seconds (configurable)
- Desktop notifications on macOS
- Auto-generates debug reports
- Auto-opens in Cursor (if CLI installed)
- Saves reports to `logs/github-actions/`

**Use when:** You're actively developing and want automatic failure detection

**Configuration:**
```bash
# Custom check interval
WATCH_INTERVAL=60 ./scripts/watch-builds.sh
```

---

### **auto-fix-build.sh** 🚀
**Purpose:** Generate automated fix request for Cursor AI

**Usage:**
```bash
./scripts/auto-fix-build.sh
```

**Features:**
- Fetches latest failed build
- Creates `.github-build-fix-request.md`
- Auto-opens in Cursor
- Ready-to-use prompt for AI

**Use when:** You want the fastest path from failure to fix

---

## 🚢 Deployment Scripts

### **check-ghcr.sh**
**Purpose:** Verify Docker images in GitHub Container Registry

**Usage:**
```bash
./scripts/check-ghcr.sh
```

**Features:**
- Checks if images exist in GHCR
- Lists available tags
- Attempts to pull images
- Shows authentication status

---

### **deploy-latest.sh**
**Purpose:** Deploy the latest Docker image from GHCR

**Usage:**
```bash
./scripts/deploy-latest.sh
```

---

### **pull-ghcr.sh**
**Purpose:** Pull latest images from GHCR

**Usage:**
```bash
./scripts/pull-ghcr.sh
```

---

## 🔍 Search & Indexing Scripts

### **setup-search.sh**
**Purpose:** Initialize MeiliSearch for product search

**Usage:**
```bash
./scripts/setup-search.sh
```

**Or inside Docker:**
```bash
docker exec -it icfix-backend npm run init-search
```

---

### **manual-reindex.sh**
**Purpose:** Manually trigger MeiliSearch reindexing

**Usage:**
```bash
./scripts/manual-reindex.sh
```

---

## 📋 Quick Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `get-build-logs.sh` | Get logs once | Build failed, need quick debug |
| `watch-builds.sh` | Monitor continuously | Active development |
| `auto-fix-build.sh` | Auto-fix with AI | Fastest fix workflow |
| `check-ghcr.sh` | Verify GHCR images | Deployment issues |
| `deploy-latest.sh` | Deploy new version | After successful build |
| `setup-search.sh` | Initialize search | First setup |
| `manual-reindex.sh` | Reindex products | Search not working |

---

## 🎯 Recommended Workflow

### For Development:
```bash
# Start the watcher
./scripts/watch-builds.sh

# It will alert you automatically when builds fail
# And prepare everything for Cursor
```

### For Quick Fixes:
```bash
# Get logs and fix
./scripts/auto-fix-build.sh

# Tell Cursor: "Read .github-build-fix-request.md and fix all issues"
```

### For Manual Debugging:
```bash
# Get formatted logs
./scripts/get-build-logs.sh

# Copy output to Cursor
```

---

## 📚 More Information

- **[AUTOMATION_GUIDE.md](../AUTOMATION_GUIDE.md)** - Complete automation setup guide
- **[QUICK_DEBUG_GUIDE.md](../QUICK_DEBUG_GUIDE.md)** - Quick reference for debugging
- **[GITHUB_ACTIONS_DEBUG.md](../GITHUB_ACTIONS_DEBUG.md)** - Detailed debugging guide

---

## 🔧 Setup

### Prerequisites:
```bash
# Install GitHub CLI
brew install gh  # macOS
sudo apt install gh  # Linux

# Authenticate
gh auth login

# Install Cursor CLI (optional but recommended)
# In Cursor: Cmd+Shift+P → "Install 'cursor' command in PATH"
```

### Make scripts executable:
```bash
chmod +x scripts/*.sh
```

---

**Last Updated:** 2025-10-14

