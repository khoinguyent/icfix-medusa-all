# Backend Rebuild Required

## ✅ What We Just Did (Temporary Fix)

We deployed the store API routes directly to the running container:
- Copied compiled routes to `/app/.medusa/server/src/api/store/`
- Restarted the container
- Routes are now working

**⚠️ This is temporary!** If the container is recreated, these files will be lost.

## 🔄 Permanent Solution: Rebuild Docker Image

### Why Rebuild is Needed

1. **Store API routes were not committed to git** (now fixed - just committed)
2. **Docker image was built without these routes**
3. **Current container has routes (temporary copy)**
4. **New containers from image won't have routes**

### Steps to Rebuild

#### Option 1: Let GitHub Actions Build (Recommended)

1. **Code is already pushed** (store API routes just committed)
2. **GitHub Actions will auto-build** when code is pushed to `main`
3. **Check build status:**
   - Go to: https://github.com/khoinguyent/icfix-medusa-all/actions
   - Look for "Build and Push Backend Docker Image" workflow
   - Wait for it to complete

4. **Pull new image on server:**
   ```bash
   docker pull ghcr.io/khoinguyent/icfix-backend:latest
   docker-compose -f docker-compose-prod.yml pull medusa-backend
   docker-compose -f docker-compose-prod.yml up -d medusa-backend
   ```

#### Option 2: Manual Build (If GitHub Actions Fails)

1. **Build locally:**
   ```bash
   cd icfix
   docker build -t ghcr.io/khoinguyent/icfix-backend:latest .
   ```

2. **Push to GHCR:**
   ```bash
   docker push ghcr.io/khoinguyent/icfix-backend:latest
   ```

3. **Pull on server:**
   ```bash
   docker pull ghcr.io/khoinguyent/icfix-backend:latest
   docker-compose -f docker-compose-prod.yml up -d medusa-backend
   ```

## ⏰ Timeline

### Current State (Temporary)
- ✅ Routes work (copied directly to container)
- ⚠️ Will be lost if container restarts/recreates
- ✅ API is functional right now

### After Rebuild (Permanent)
- ✅ Routes included in Docker image
- ✅ Survives container restarts
- ✅ All new deployments will have routes

## 🎯 Do You Need to Rebuild Now?

### No, if:
- Current setup is working
- You don't plan to restart/recreate containers
- Temporary fix is acceptable

### Yes, if:
- You want a permanent solution
- You plan to scale/restart containers
- You want routes in the image for future deployments

## 📋 Quick Answer

**Short answer:** Yes, you should rebuild eventually for a permanent fix, but it's not urgent if the current setup is working.

**Recommended:** Let GitHub Actions build automatically (it should trigger on the push we just made). Then pull the new image on the server when ready.

## 🔍 Verify Routes Are in Image

After rebuild, verify routes are included:

```bash
# On server
docker run --rm ghcr.io/khoinguyent/icfix-backend:latest \
  ls -la /app/.medusa/server/src/api/store/

# Should show:
# banners/
# homepage-content/
# service-features/
# testimonials/
# homepage-sections/
```
