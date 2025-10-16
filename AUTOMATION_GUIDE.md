# 🤖 Build Failure Automation Guide

Complete guide to automate detection, debugging, and fixing of GitHub Actions build failures.

---

## 🎯 Automation Levels

### Level 1: Manual with Helper (Easiest) ⭐
**When build fails → Run script → Copy to Cursor**

```bash
./scripts/get-build-logs.sh
# Copy output and paste into Cursor
```

---

### Level 2: Auto-Detection (Recommended) 🚀
**Script watches builds → Alerts you → Auto-generates report**

```bash
./scripts/watch-builds.sh
# Runs in background, alerts on failure
```

---

### Level 3: Full Automation (Advanced) 🌟
**Detects failure → Creates issue → Notifies team → Opens in Cursor**

See [Full Setup](#full-automation-setup) below.

---

## 📦 Available Scripts

### 1. `get-build-logs.sh` - One-time Log Fetcher
**Purpose:** Get logs from the latest failed build

**Usage:**
```bash
./scripts/get-build-logs.sh
```

**Output:**
- Saves logs to file
- Generates formatted report
- Shows what to copy to Cursor

**When to use:** After you notice a build failed

---

### 2. `watch-builds.sh` - Continuous Monitor ⭐
**Purpose:** Watch GitHub Actions and auto-detect failures

**Usage:**
```bash
# Run in foreground
./scripts/watch-builds.sh

# Or run in background
nohup ./scripts/watch-builds.sh > watch.log 2>&1 &
```

**Features:**
- ✅ Checks every 30 seconds (configurable)
- ✅ Detects new failures immediately
- ✅ Auto-generates debug reports
- ✅ Desktop notifications (macOS)
- ✅ Auto-opens in Cursor (if CLI installed)
- ✅ Saves all reports to `logs/github-actions/`

**Configuration:**
```bash
# Check every 60 seconds instead
WATCH_INTERVAL=60 ./scripts/watch-builds.sh
```

---

### 3. `auto-fix-build.sh` - Automated Fix Generator
**Purpose:** Generate fix request and open in Cursor

**Usage:**
```bash
./scripts/auto-fix-build.sh
```

**What it does:**
1. Fetches latest failed build
2. Extracts error logs
3. Creates `.github-build-fix-request.md`
4. Auto-opens in Cursor (if available)
5. You tell Cursor: "Read .github-build-fix-request.md and fix all issues"

---

## 🚀 Setup Instructions

### Prerequisites

1. **Install GitHub CLI:**
   ```bash
   # macOS
   brew install gh
   
   # Linux
   sudo apt install gh
   
   # Windows
   choco install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Install Cursor CLI (Optional but Recommended):**
   ```bash
   # This allows scripts to auto-open in Cursor
   # In Cursor: Cmd+Shift+P → "Install 'cursor' command in PATH"
   ```

4. **Make scripts executable:**
   ```bash
   chmod +x scripts/*.sh
   ```

---

## 🎬 Usage Scenarios

### Scenario 1: Quick One-time Fix

**You get notified of a build failure:**

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/get-build-logs.sh
```

**Copy the output** between `---START---` and `---END---` markers

**Paste into Cursor:**
```
[Paste the formatted output]

Please fix these build errors.
```

**Cursor will:**
- Analyze the logs
- Identify the issue
- Fix the relevant files
- Explain what was wrong

**You:**
```bash
git add .
git commit -m "fix: resolve build failure"
git push origin main
```

---

### Scenario 2: Background Monitoring

**Set it and forget it:**

```bash
# Start the watcher in background
cd /Users/123khongbiet/Documents/medusa
nohup ./scripts/watch-builds.sh > logs/watcher.log 2>&1 &

# Save the PID for later
echo $! > logs/watcher.pid
```

**Now it runs continuously:**
- Watches all GitHub Actions runs
- When a build fails:
  - 📱 Desktop notification
  - 📝 Auto-generates report
  - 🚀 Opens in Cursor (if CLI installed)
  - 💾 Saves to `logs/github-actions/`

**To stop:**
```bash
kill $(cat logs/watcher.pid)
```

---

### Scenario 3: Systemd Service (Linux)

**Run watcher as a system service:**

Create `/etc/systemd/system/github-build-watcher.service`:

```ini
[Unit]
Description=GitHub Actions Build Watcher
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/Users/123khongbiet/Documents/medusa
ExecStart=/Users/123khongbiet/Documents/medusa/scripts/watch-builds.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable github-build-watcher
sudo systemctl start github-build-watcher

# Check status
sudo systemctl status github-build-watcher

# View logs
sudo journalctl -u github-build-watcher -f
```

---

### Scenario 4: Launch Agent (macOS)

**Run watcher automatically on macOS:**

Create `~/Library/LaunchAgents/com.medusa.build-watcher.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.medusa.build-watcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/123khongbiet/Documents/medusa/scripts/watch-builds.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/123khongbiet/Documents/medusa</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/123khongbiet/Documents/medusa/logs/watcher.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/123khongbiet/Documents/medusa/logs/watcher.error.log</string>
</dict>
</plist>
```

**Load and start:**
```bash
launchctl load ~/Library/LaunchAgents/com.medusa.build-watcher.plist
launchctl start com.medusa.build-watcher

# Check status
launchctl list | grep build-watcher

# Stop
launchctl stop com.medusa.build-watcher

# Unload
launchctl unload ~/Library/LaunchAgents/com.medusa.build-watcher.plist
```

---

## 🔔 GitHub Actions Auto-Notification

### Setup Auto-Issue Creation

The workflow `.github/workflows/notify-on-failure.yml` is already created!

**What it does:**
- Triggers when any build fails
- Automatically creates a GitHub Issue
- Issue contains:
  - Link to failed run
  - Quick debug commands
  - Instructions to use your scripts

**To enable:**

It's already enabled! Just push it:

```bash
git add .github/workflows/notify-on-failure.yml
git commit -m "feat: add auto-notification on build failure"
git push origin main
```

**Now when a build fails:**
1. ✅ GitHub creates an issue automatically
2. ✅ You get notified (if you watch issues)
3. ✅ Issue has debug commands ready to copy

---

### Optional: Slack Notifications

**To enable Slack notifications:**

1. **Create Slack Webhook:**
   - Go to https://api.slack.com/apps
   - Create app → Incoming Webhooks
   - Copy webhook URL

2. **Add to GitHub Secrets:**
   ```bash
   # Go to: https://github.com/khoinguyent/icfix-medusa-all/settings/secrets/actions
   # Add secret: SLACK_WEBHOOK_URL
   ```

3. **It's already configured in the workflow!**

Now you'll get Slack notifications on build failures.

---

## 🔄 Complete Automated Workflow

Here's the full end-to-end automated flow:

```
1. Developer pushes code
         ↓
2. GitHub Actions starts build
         ↓
3. Build fails ❌
         ↓
4. notify-on-failure.yml triggers
         ├→ Creates GitHub Issue
         ├→ Sends Slack notification (if configured)
         └→ Tags with "build-failure"
         ↓
5. Local watcher detects failure
         ├→ Fetches error logs
         ├→ Generates Cursor report
         ├→ Desktop notification
         ├→ Auto-opens in Cursor
         └→ Saves to logs/github-actions/
         ↓
6. Developer sees notification
         ↓
7. Cursor already has the report open
         ↓
8. Developer tells Cursor: "Fix these errors"
         ↓
9. Cursor analyzes and fixes
         ↓
10. Developer reviews and commits
         ↓
11. GitHub Actions rebuilds ✅
```

---

## 📊 Monitoring & Logs

### View Watcher Logs

```bash
# If running in background
tail -f logs/watcher.log

# If systemd
sudo journalctl -u github-build-watcher -f

# If launchd (macOS)
tail -f /Users/123khongbiet/Documents/medusa/logs/watcher.log
```

### View Generated Reports

```bash
# List all reports
ls -lht logs/github-actions/

# View latest report
cat logs/github-actions/cursor-report-*.md | head -n 1
```

### Check Watcher Status

```bash
# Check if running
ps aux | grep watch-builds

# Linux systemd
sudo systemctl status github-build-watcher

# macOS launchd
launchctl list | grep build-watcher
```

---

## 🎛️ Configuration Options

### Environment Variables

```bash
# Watch interval (seconds)
export WATCH_INTERVAL=30

# Custom log directory
export LOG_DIR="./custom-logs"

# Run watcher with custom settings
WATCH_INTERVAL=60 ./scripts/watch-builds.sh
```

---

## 🧪 Testing

### Test the Scripts Without Failure

```bash
# Simulate getting logs from any run
gh run list --limit 5  # Get a run ID
gh run view <RUN_ID> --log

# Test notification (macOS)
osascript -e 'display notification "Test" with title "Build Watcher"'

# Test Cursor CLI
cursor --version
```

### Trigger a Test Build

```bash
# Make a harmless change
echo "# Test build $(date)" >> README.md
git add README.md
git commit -m "test: trigger build"
git push origin main

# Watch it
./scripts/watch-builds.sh
```

---

## 🚨 Troubleshooting

### Watcher Not Detecting Failures

```bash
# Check GitHub CLI auth
gh auth status

# Manually check for failures
gh run list --status failure --limit 1

# Check watcher logs
tail -f logs/watcher.log
```

### Cursor Not Auto-Opening

```bash
# Check if Cursor CLI is installed
cursor --version

# Install it: In Cursor → Cmd+Shift+P → "Install 'cursor' command"

# Alternative: Use VS Code
code --version
```

### Notifications Not Working (macOS)

```bash
# Check System Preferences → Notifications
# Ensure Terminal/iTerm has notification permissions

# Test manually
osascript -e 'display notification "Test" with title "Test"'
```

---

## 💡 Pro Tips

1. **Run watcher in tmux/screen:**
   ```bash
   tmux new -s build-watcher
   ./scripts/watch-builds.sh
   # Press Ctrl+B then D to detach
   ```

2. **Combine with git hooks:**
   ```bash
   # .git/hooks/pre-push
   ./scripts/get-build-logs.sh --check-latest
   ```

3. **Use with CI/CD notifications:**
   - GitHub Issues (already set up!)
   - Slack (optional, configured)
   - Email (via GitHub settings)

4. **Quick alias:**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   alias fix-build='cd /Users/123khongbiet/Documents/medusa && ./scripts/auto-fix-build.sh'
   ```

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Get logs once | `./scripts/get-build-logs.sh` |
| Start watcher | `./scripts/watch-builds.sh` |
| Auto-fix | `./scripts/auto-fix-build.sh` |
| Background watcher | `nohup ./scripts/watch-builds.sh &` |
| Stop watcher | `kill $(cat logs/watcher.pid)` |
| View reports | `ls logs/github-actions/` |
| Latest report | `ls -t logs/github-actions/*.md \| head -1` |

---

## ✅ Recommended Setup

**For most users, this is the sweet spot:**

1. ✅ Enable GitHub Issue auto-creation (push notify-on-failure.yml)
2. ✅ Run watcher when actively developing
3. ✅ Use get-build-logs.sh for quick fixes
4. ✅ Install Cursor CLI for auto-opening

**Commands:**
```bash
# One-time setup
chmod +x scripts/*.sh
gh auth login
# Install Cursor CLI via Cursor app

# When starting dev work
./scripts/watch-builds.sh

# Or just use when needed
./scripts/get-build-logs.sh
```

---

**Last Updated:** 2025-10-14
**Scripts Location:** `/Users/123khongbiet/Documents/medusa/scripts/`

