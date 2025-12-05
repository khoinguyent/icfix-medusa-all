# ⚡ Automation Quickstart

Get automated build failure detection running in 5 minutes!

---

## 🚀 Super Quick Setup

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/setup-automation.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Set up directories
- ✅ Make scripts executable
- ✅ Test GitHub access
- ✅ Guide you through testing

---

## 🎯 What You Get

### **3 Automation Levels**

#### **Level 1: Manual (Quick Fix)** ⚡
```bash
./scripts/get-build-logs.sh
# Copy output → Paste in Cursor → Fixed!
```
**Use when:** You see a build failed notification

---

#### **Level 2: Watch Mode (Recommended)** ⭐
```bash
./scripts/watch-builds.sh
# Runs continuously, alerts on failures
```
**Use when:** You're actively developing

**Features:**
- 🔔 Desktop notifications
- 📝 Auto-generates reports
- 🚀 Opens in Cursor automatically
- 💾 Saves all logs

---

#### **Level 3: Full Automation** 🌟
```bash
# Push the notification workflow
git add .github/workflows/notify-on-failure.yml
git commit -m "feat: add build failure notifications"
git push origin main

# Run watcher in background
nohup ./scripts/watch-builds.sh > logs/watcher.log 2>&1 &
```

**Use when:** You want zero-touch monitoring

**Features:**
- 🎫 Auto-creates GitHub Issues
- 🔔 Slack notifications (optional)
- 📊 Complete audit trail
- 🤖 Fully automated workflow

---

## 📋 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────┐
│  1. Push Code to GitHub                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. GitHub Actions Builds Docker Image          │
└────────────────┬────────────────────────────────┘
                 │
                 ├──► ✅ Success → Image pushed to GHCR
                 │
                 └──► ❌ Failure
                      │
         ┌────────────┴─────────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐    ┌─────────────────────────┐
│ 3a. GitHub       │    │ 3b. Local Watcher       │
│ Creates Issue    │    │ Detects Failure         │
│                  │    │                         │
│ • Auto-tagged    │    │ • Fetches logs          │
│ • Has debug cmds │    │ • Desktop notification  │
│ • Notifies team  │    │ • Generates report      │
└──────────────────┘    │ • Opens in Cursor       │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │ 4. Cursor Auto-Opens    │
                        │ with Complete Report    │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │ 5. You Tell Cursor:     │
                        │ "Fix these errors"      │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │ 6. Cursor AI:           │
                        │ • Analyzes logs         │
                        │ • Identifies root cause │
                        │ • Fixes files           │
                        │ • Explains changes      │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │ 7. You Review & Commit  │
                        │ git commit & push       │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │ 8. GitHub Rebuilds ✅   │
                        │ Issue Auto-Closed       │
                        └─────────────────────────┘
```

---

## 🎬 Example Session

### **Scenario: npm install fails in Docker build**

```bash
# 1. You're working, watcher is running
$ ./scripts/watch-builds.sh
🔄 GitHub Actions Build Watcher
Watching for build failures every 30s
Press Ctrl+C to stop
================================================

[10:30:15] Check #1: Build #123 - in_progress
[10:30:45] Check #2: Build #123 - in_progress
[10:31:15] New run detected: #123
❌ Build FAILED!
⚙️  Generating debug report...
✅ Report saved: logs/github-actions/cursor-report-20251014-103115.md

================================================
📋 CURSOR REPORT READY
================================================
🚀 Opening in Cursor...
✅ Opened in Cursor!

# 2. Cursor opens automatically with the report
# 3. In Cursor, you type:

User: "Read the report and fix all the build errors"

# 4. Cursor responds:

Cursor: "I found the issue. The package.json is not being copied correctly 
in the Dockerfile. The COPY command is looking in the wrong directory.

Fixing icfix/Dockerfile..."

[Cursor edits the file]

Cursor: "Fixed! The issue was:
- COPY command was using 'package*.json ./' 
- But it should be copying from the build context root
- Changed to 'COPY icfix/package*.json icfix/package-lock.json ./'

The build should now succeed."

# 5. You verify and push:

$ git add icfix/Dockerfile
$ git commit -m "fix: correct package.json COPY path in Dockerfile"
$ git push origin main

# 6. Watcher detects new build:

[10:35:00] New run detected: #124
🔄 Build in progress...
[10:38:30] New run detected: #124
✅ Build SUCCESS!
```

**Total time from failure to fix: ~5 minutes!**

---

## 💡 Pro Tips

### **1. Run Watcher in tmux**
```bash
tmux new -s build-watcher
./scripts/watch-builds.sh
# Ctrl+B, then D to detach
# tmux attach -t build-watcher to reconnect
```

### **2. Create Aliases**
Add to `~/.zshrc` or `~/.bashrc`:
```bash
alias fix-build='cd ~/Documents/medusa && ./scripts/auto-fix-build.sh'
alias watch-builds='cd ~/Documents/medusa && ./scripts/watch-builds.sh'
alias build-logs='cd ~/Documents/medusa && ./scripts/get-build-logs.sh'
```

Then just:
```bash
$ fix-build
$ watch-builds
$ build-logs
```

### **3. GitHub Notifications**
Configure your GitHub notifications to alert you instantly:
- Go to: https://github.com/settings/notifications
- Enable: "Actions" under "Email notifications"
- Or install GitHub mobile app for push notifications

### **4. Slack Integration** (Optional)
Enable Slack notifications:
```bash
# 1. Get Slack webhook from: https://api.slack.com/apps
# 2. Add to GitHub secrets as SLACK_WEBHOOK_URL
# 3. notify-on-failure.yml already configured!
```

---

## 🔧 Troubleshooting

### **"gh: command not found"**
```bash
# macOS
brew install gh

# Linux
sudo apt install gh

# Then authenticate
gh auth login
```

### **"jq: command not found"**
```bash
# macOS
brew install jq

# Linux
sudo apt install jq
```

### **Watcher not detecting failures**
```bash
# Test manually
gh run list --status failure --limit 1

# Check authentication
gh auth status

# View watcher logs
tail -f logs/watcher.log
```

### **Cursor not auto-opening**
```bash
# Install Cursor CLI
# In Cursor app: Cmd+Shift+P
# Type: "Install 'cursor' command in PATH"
# Click the option

# Test
cursor --version
```

---

## 📚 Learn More

- **[AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)** - Complete setup guide with all options
- **[QUICK_DEBUG_GUIDE.md](./QUICK_DEBUG_GUIDE.md)** - Quick reference card
- **[GITHUB_ACTIONS_DEBUG.md](./GITHUB_ACTIONS_DEBUG.md)** - Detailed debugging guide
- **[scripts/README.md](./scripts/README.md)** - All available scripts

---

## ✅ Checklist

Get started in 3 minutes:

- [ ] Run `./scripts/setup-automation.sh`
- [ ] Test with `./scripts/get-build-logs.sh`
- [ ] Try watch mode: `./scripts/watch-builds.sh`
- [ ] Enable GitHub notifications:
  ```bash
  git add .github/workflows/notify-on-failure.yml
  git commit -m "feat: add build failure notifications"
  git push
  ```

**That's it! You're now fully automated! 🎉**

---

## 🎯 Recommended Setup for Different Users

### **Solo Developer**
```bash
# Just use when needed
alias fix-build='cd ~/Documents/medusa && ./scripts/auto-fix-build.sh'
```

### **Active Development**
```bash
# Run watcher while coding
tmux new -s build-watcher
./scripts/watch-builds.sh
```

### **Team Environment**
```bash
# Enable all automation
1. Push notify-on-failure.yml (creates issues)
2. Setup Slack webhook (team notifications)
3. Run watcher on dev machine
4. Share logs via GitHub Issues
```

---

**Time to first fix: < 5 minutes** ⚡
**Setup time: < 3 minutes** 🚀
**Manual effort: Nearly zero** 🤖

---

**Last Updated:** 2025-10-14
**Version:** 1.0.0

