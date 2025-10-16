# 🐛 GitHub Actions Build Logs & Debugging Guide

This guide explains how to get build logs from your GitHub Actions workflow when Docker image builds fail, and how to feed them back to Cursor for automated fixing.

---

## 📋 Table of Contents

1. [How to Access Build Logs](#how-to-access-build-logs)
2. [Understanding Build Failures](#understanding-build-failures)
3. [Getting Logs for Cursor](#getting-logs-for-cursor)
4. [Common Build Failures](#common-build-failures)
5. [Automated Debugging with Cursor](#automated-debugging-with-cursor)

---

## 🔍 How to Access Build Logs

### Method 1: GitHub Web Interface (Easiest)

1. **Go to your repository on GitHub:**
   ```
   https://github.com/khoinguyent/icfix-medusa-all
   ```

2. **Click on the "Actions" tab** at the top of the repository

3. **Find the failed workflow run:**
   - Failed runs are marked with a ❌ red X
   - Click on the failed workflow run

4. **View the failed job:**
   - Click on the job name (e.g., "build-and-push")
   - You'll see all the steps with their status

5. **Expand the failed step:**
   - Click on the step that failed (marked with ❌)
   - You'll see the complete error logs

6. **Copy the logs:**
   - Select and copy the error message and surrounding context
   - Include at least 20-50 lines before and after the error

---

### Method 2: GitHub CLI (For Power Users)

```bash
# Install GitHub CLI if not already installed
brew install gh  # macOS
# or
sudo apt install gh  # Linux

# Authenticate
gh auth login

# List recent workflow runs
gh run list --limit 10

# View details of a specific run (replace RUN_ID with actual ID)
gh run view RUN_ID

# Download logs for a failed run
gh run view RUN_ID --log-failed > build-error.log

# Or download all logs
gh run download RUN_ID
```

---

### Method 3: Using API (Advanced)

```bash
# Get your GitHub token from: https://github.com/settings/tokens
GITHUB_TOKEN="your_token_here"
REPO="khoinguyent/icfix-medusa-all"

# Get latest workflow runs
curl -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs?per_page=5"

# Get logs for a specific run (replace RUN_ID)
curl -L -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs/RUN_ID/logs" \
  -o workflow-logs.zip

# Extract the logs
unzip workflow-logs.zip
```

---

## 🔍 Understanding Build Failures

### Common Log Locations

Your workflows have these key steps that might fail:

#### **docker-build.yml workflow:**
1. ✅ Checkout repository
2. ✅ Set up Docker Buildx
3. ✅ Log in to Container Registry
4. ✅ Extract metadata
5. ❌ **Build and push Docker image** ← Most common failure point

#### **deploy-backend.yml workflow:**
1. ✅ Checkout repository
2. ✅ Log in to GitHub Container Registry
3. ❌ **Build and push Docker image** ← Most common failure point

### What to Look For in Logs

When a build fails, look for these indicators:

```
❌ Error patterns to search for:
- "ERROR"
- "FAILED"
- "error:"
- "npm ERR!"
- "yarn error"
- "COPY failed"
- "RUN failed"
- "No such file or directory"
- "Cannot find module"
- "Permission denied"
```

---

## 📝 Getting Logs for Cursor

### Step 1: Identify the Error

When a build fails, you'll see something like:

```
Run docker/build-push-action@v5
  with:
    context: ./icfix
    file: ./icfix/Dockerfile
    push: true
    tags: ghcr.io/khoinguyent/icfix-backend:latest
...
#15 [build 6/12] RUN npm ci
#15 1.234 npm ERR! code ENOENT
#15 1.235 npm ERR! syscall open
#15 1.236 npm ERR! path /app/package.json
#15 1.237 npm ERR! errno -2
#15 ERROR: process "/bin/sh -c npm ci" did not complete successfully
```

### Step 2: Extract Relevant Context

Copy the following information:

1. **The failed step name:**
   ```
   Build and push Docker image
   ```

2. **The exact error message** (10-30 lines):
   ```
   #15 [build 6/12] RUN npm ci
   #15 1.234 npm ERR! code ENOENT
   #15 1.235 npm ERR! syscall open
   #15 1.236 npm ERR! path /app/package.json
   #15 ERROR: process "/bin/sh -c npm ci" did not complete successfully
   ```

3. **Build context** (what was happening before):
   ```
   #14 [build 5/12] WORKDIR /app
   #14 DONE 0.0s
   
   #15 [build 6/12] RUN npm ci
   #15 ERROR: ...
   ```

4. **Workflow configuration** (from the Actions tab):
   - Branch name
   - Commit SHA
   - Workflow file name

### Step 3: Format for Cursor

Create a message like this to share with Cursor:

```
GitHub Actions Docker build is failing. Here's the error:

**Workflow:** docker-build.yml
**Branch:** main
**Step:** Build and push Docker image

**Error Log:**
```
#14 [build 5/12] WORKDIR /app
#14 DONE 0.0s

#15 [build 6/12] RUN npm ci
#15 1.234 npm ERR! code ENOENT
#15 1.235 npm ERR! syscall open
#15 1.236 npm ERR! path /app/package.json
#15 1.237 npm ERR! errno -2
#15 1.238 npm ERR! enoent ENOENT: no such file or directory, open '/app/package.json'
#15 ERROR: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
```

**Context:**
- Building from ./icfix/Dockerfile
- Target platform: linux/amd64,linux/arm64
- Using buildx with cache

Can you help fix this?
```

---

## 🐛 Common Build Failures

### 1. **Package.json Not Found**

**Error:**
```
npm ERR! enoent ENOENT: no such file or directory, open '/app/package.json'
```

**Cause:** COPY command in Dockerfile is incorrect

**How to Share with Cursor:**
```
The build is failing because package.json is not found. Error log:

[paste error log]

Current Dockerfile line causing issue:
COPY package*.json ./

Please help fix the COPY path.
```

---

### 2. **npm Install Failures**

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**How to Share with Cursor:**
```
npm install is failing with dependency conflicts. Full error:

[paste complete npm error output including the dependency tree]

Package.json dependencies:
[paste your package.json dependencies section]

Please help resolve the dependency conflict.
```

---

### 3. **Build Context Issues**

**Error:**
```
failed to solve: failed to read dockerfile: open /var/lib/docker/tmp/buildkit-mount123/Dockerfile: no such file or directory
```

**How to Share with Cursor:**
```
Docker can't find the Dockerfile. GitHub Actions config:

context: ./icfix
file: ./icfix/Dockerfile

Directory structure:
[paste output of: tree -L 2 icfix/]

Error:
[paste error]

Please help fix the build context configuration.
```

---

### 4. **Multi-platform Build Failures**

**Error:**
```
ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
------
 > [linux/arm64 build 8/12] RUN npm ci:
```

**How to Share with Cursor:**
```
Multi-platform build is failing on ARM64. Works on AMD64.

Error:
[paste error showing which platform failed]

Dockerfile:
[paste relevant Dockerfile sections]

Workflow platforms config:
platforms: linux/amd64,linux/arm64

Please help fix ARM64 compatibility.
```

---

## 🤖 Automated Debugging with Cursor

### Quick Command to Get Logs

Save this as a script `get-gh-logs.sh`:

```bash
#!/bin/bash

# Get the latest failed workflow run ID
FAILED_RUN=$(gh run list --status failure --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$FAILED_RUN" ]; then
    echo "No failed runs found"
    exit 1
fi

echo "Getting logs for run: $FAILED_RUN"

# Get the logs
gh run view $FAILED_RUN --log-failed > github-actions-error.log

echo "Logs saved to github-actions-error.log"
echo ""
echo "📋 Copy this message to Cursor:"
echo "=================================================="
echo "GitHub Actions build failed. Here's the error log:"
echo ""
cat github-actions-error.log
echo "=================================================="
echo ""
echo "Please analyze and fix the build errors above."
```

Make it executable:
```bash
chmod +x get-gh-logs.sh
```

Run it when a build fails:
```bash
./get-gh-logs.sh
```

Then copy the entire output and paste it to Cursor!

---

### Automated Fix Workflow

1. **Build fails on GitHub Actions**
   
2. **Run the script locally:**
   ```bash
   ./get-gh-logs.sh
   ```

3. **Copy the output**

4. **Open Cursor and paste:**
   ```
   GitHub Actions build failed. Here's the error log:
   
   [paste the output]
   
   Please analyze and fix the build errors.
   ```

5. **Cursor will:**
   - Read the error logs
   - Identify the root cause
   - Check your Dockerfile, package.json, and workflow files
   - Suggest or make fixes automatically
   - Create a commit with the fix

6. **Push the fix:**
   ```bash
   git push origin main
   ```

7. **GitHub Actions will automatically rebuild**

---

## 🔧 Enhanced Workflow with Better Logging

You can improve your workflow to show more detailed errors. Update your workflow:

```yaml
# Add this to your docker-build.yml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: ./icfix
    file: ./icfix/Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64,linux/arm64
    # Add verbose output
    build-args: |
      BUILDKIT_PROGRESS=plain
    outputs: type=docker,dest=/tmp/image.tar
  continue-on-error: true
  id: build

# Add debug step on failure
- name: Show build details on failure
  if: steps.build.outcome == 'failure'
  run: |
    echo "Build failed! Here's what we know:"
    echo "Context: ./icfix"
    echo "Dockerfile: ./icfix/Dockerfile"
    echo ""
    echo "Files in context:"
    ls -la ./icfix/
    echo ""
    echo "Package.json exists?"
    test -f ./icfix/package.json && echo "YES" || echo "NO"
    echo ""
    echo "Dockerfile content:"
    cat ./icfix/Dockerfile
```

This will show:
- File listing in build context
- Whether package.json exists
- Full Dockerfile content
- Making debugging much easier!

---

## 📚 Quick Reference

### Essential Commands

```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# Get logs from failed run
gh run view <run-id> --log-failed

# Download all logs
gh run download <run-id>

# Re-run a failed workflow
gh run rerun <run-id>

# Watch a running workflow
gh run watch

# Cancel a running workflow
gh run cancel <run-id>
```

### URLs to Bookmark

- **Actions Dashboard:** `https://github.com/khoinguyent/icfix-medusa-all/actions`
- **GHCR Packages:** `https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all`
- **Workflow Files:** `https://github.com/khoinguyent/icfix-medusa-all/tree/main/.github/workflows`

---

## 🎯 Best Practices

1. **Always include context** - Don't just paste the error, include what was happening before
2. **Include file contents** - Share relevant Dockerfile or package.json sections
3. **Mention the platform** - Specify if it's amd64, arm64, or both
4. **Share the workflow file** - Let Cursor see the GitHub Actions configuration
5. **Include directory structure** - Use `tree` or `ls` output to show file locations

---

## ✅ Checklist for Debugging with Cursor

When sharing build errors with Cursor, include:

- [ ] The specific workflow file name (docker-build.yml or deploy-backend.yml)
- [ ] The exact error message (full stack trace if available)
- [ ] The failed step name
- [ ] Build context (what files are being used)
- [ ] Relevant Dockerfile sections
- [ ] Package.json if npm/yarn errors
- [ ] Platform info (amd64/arm64)
- [ ] At least 20-50 lines of log context
- [ ] Branch and commit SHA

---

**Last Updated:** 2025-10-14
**Your Workflows:** docker-build.yml, deploy-backend.yml
**Container Registry:** ghcr.io/khoinguyent/icfix-medusa-all

