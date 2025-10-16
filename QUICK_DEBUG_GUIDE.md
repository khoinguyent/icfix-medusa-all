# 🚨 Quick Debug Guide - GitHub Actions Build Failures

One-page reference for quickly getting build logs and fixing issues with Cursor.

---

## 🎯 When Build Fails - Do This:

### **Option 1: Use the Helper Script (Easiest)** ⭐

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/get-build-logs.sh
```

**This will:**
1. ✅ Fetch the latest failed build logs
2. ✅ Format them for Cursor
3. ✅ Include all relevant context
4. ✅ Show you what to copy/paste

**Just copy the output and paste it into Cursor!**

---

### **Option 2: Manual Method (GitHub Web)**

1. Go to: https://github.com/khoinguyent/icfix-medusa-all/actions
2. Click the failed run (marked with ❌)
3. Click the failed job name
4. Click the failed step
5. Copy the error logs (include 20-50 lines of context)
6. Paste into Cursor with this template:

```
GitHub Actions build failed. Please help fix it.

**Workflow:** [workflow name]
**Error Log:**
```
[paste logs here]
```

**Request:** Please analyze and fix the build errors above.
```

---

### **Option 3: GitHub CLI**

```bash
# Get latest failed run logs
gh run list --status failure --limit 1
gh run view <RUN_ID> --log-failed

# Copy output and share with Cursor
```

---

## 📋 What to Include When Sharing with Cursor

**Minimum Requirements:**
- ✅ The error message itself
- ✅ 20-50 lines of context before the error
- ✅ Which workflow file failed (docker-build.yml or deploy-backend.yml)
- ✅ What step failed

**Better (includes automatically with script):**
- ✅ Dockerfile content
- ✅ Build context (file listing)
- ✅ Workflow configuration
- ✅ Branch and commit info

---

## 🔍 Common Build Errors & Quick Fixes

### **Error 1: "package.json not found"**
```
npm ERR! enoent ENOENT: no such file or directory, open '/app/package.json'
```
**Tell Cursor:**
```
Build failing - package.json not found in Docker build.
Error: [paste error]
Dockerfile: [paste relevant COPY commands]
Please fix the COPY path.
```

---

### **Error 2: npm install fails**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```
**Tell Cursor:**
```
npm install failing with dependency conflicts.
Error: [paste full npm error including dependency tree]
Please fix package.json dependencies.
```

---

### **Error 3: Multi-platform build fails**
```
ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete
 > [linux/arm64 build 8/12] RUN npm ci:
```
**Tell Cursor:**
```
Build fails on ARM64 platform but works on AMD64.
Error: [paste error]
Workflow uses: platforms: linux/amd64,linux/arm64
Please fix ARM64 compatibility.
```

---

### **Error 4: Build context issues**
```
failed to read dockerfile: open /var/lib/docker/tmp/buildkit-mount/Dockerfile: no such file
```
**Tell Cursor:**
```
Docker can't find Dockerfile.
Workflow config:
  context: ./icfix
  file: ./icfix/Dockerfile
Error: [paste error]
Please fix build context.
```

---

## 🚀 Complete Workflow

```bash
# 1. Build fails on GitHub
# 2. Run the script
./scripts/get-build-logs.sh

# 3. Copy the formatted output

# 4. Open Cursor and paste

# 5. Cursor analyzes and fixes

# 6. Review the changes

# 7. Commit and push
git add .
git commit -m "fix: resolve build error"
git push origin main

# 8. GitHub Actions will automatically rebuild
```

---

## 🔗 Quick Links

- **Actions Dashboard:** https://github.com/khoinguyent/icfix-medusa-all/actions
- **GHCR Packages:** https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all
- **Full Debug Guide:** [GITHUB_ACTIONS_DEBUG.md](./GITHUB_ACTIONS_DEBUG.md)

---

## 💡 Pro Tips

1. **Always use the script** - It formats everything perfectly for Cursor
2. **Include context** - More context = better fixes
3. **Check the basics first:**
   ```bash
   # Does Dockerfile exist?
   ls -la icfix/Dockerfile
   
   # Does package.json exist?
   ls -la icfix/package.json
   
   # Are workflow paths correct?
   cat .github/workflows/docker-build.yml | grep -A 3 "context:"
   ```

4. **Test locally before pushing:**
   ```bash
   # Build the Docker image locally
   cd icfix
   docker build -t test-build .
   ```

---

## 📞 Emergency Commands

```bash
# View latest failed run
gh run list --status failure --limit 1

# Re-run the failed build
gh run rerun <RUN_ID>

# Cancel a running build
gh run cancel <RUN_ID>

# Watch a running build
gh run watch
```

---

## ✅ Verification After Fix

```bash
# 1. Check GitHub Actions status
gh run list --limit 5

# 2. Verify image was pushed to GHCR
docker pull ghcr.io/khoinguyent/icfix-medusa-all:latest

# 3. Check image works
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:latest npm --version
```

---

**Remember:** The script `./scripts/get-build-logs.sh` does all the heavy lifting for you!

**Last Updated:** 2025-10-14

