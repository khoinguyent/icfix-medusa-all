# Local Admin Quick Start

**✅ Status**: Admin is now running locally at `http://localhost:3001/app`

## What We Set Up

### 1. ✅ Backend CORS Updated
The backend at `api.icfix.vn` now accepts requests from:
- ✅ `http://localhost:3001` (local admin)
- ✅ `http://localhost:3000` (local frontend)
- ✅ `https://admin.icfix.vn` (production admin)
- ✅ `https://store.icfix.vn` (production frontend)

### 2. ✅ Local Admin Deployed
- **URL**: http://localhost:3001/app
- **Method**: Docker + nginx serving static assets
- **Backend**: https://api.icfix.vn
- **No Vercel limits**: Deploy/rebuild as many times as needed

## Access Admin

```bash
# Open in browser
open http://localhost:3001/app

# Login credentials
Email:    admin@icfix.vn
Password: admin123@
```

## Common Commands

```bash
# View logs
docker logs -f medusa-admin-local

# Restart admin
docker restart medusa-admin-local

# Stop admin
docker stop medusa-admin-local

# Start admin again
docker start medusa-admin-local

# Completely remove (keeps build files)
docker-compose -f docker-compose.local.yml down
```

## Rebuild Admin (if needed)

If you make changes to admin code or need to update environment variables:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix

# Rebuild with production settings
VITE_ADMIN_BACKEND_URL=https://api.icfix.vn VITE_BASE_PATH=/app npm run build:admin

# Restart container to pick up new build
docker restart medusa-admin-local
```

## Troubleshooting

### Admin shows blank page
**Fix**: Check browser console for errors. Most likely:
1. Backend is down: `curl https://api.icfix.vn/health`
2. CORS error: Run `./scripts/update-backend-cors.exp` again

### Container won't start
**Fix**:
```bash
# Check logs
docker logs medusa-admin-local

# Restart Docker if needed
# Check if port 3001 is in use
lsof -i :3001

# Remove and recreate
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d admin-local
```

### Can't connect to backend
**Fix**:
1. Verify backend is running: `ssh root@116.118.48.209`
2. Check container: `docker ps | grep icfix-backend`
3. Check logs: `docker logs icfix-backend`

## Architecture

```
┌──────────────────────────┐
│   Your Browser           │
│   localhost:3001/app     │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Docker Container       │
│   nginx (port 80 → 3001) │
│                          │
│   Serves static files:   │
│   /app/index.html        │
│   /app/assets/*.js       │
│   /app/assets/*.css      │
└───────────┬──────────────┘
            │
            │ API Requests
            ▼
┌──────────────────────────┐
│   Backend Server         │
│   api.icfix.vn:9000      │
│                          │
│   CORS allows:           │
│   - localhost:3001 ✅    │
└──────────────────────────┘
```

## Benefits vs Vercel

| Feature | Vercel | Local Docker |
|---------|--------|--------------|
| Deployment Limit | 100/day ❌ | Unlimited ✅ |
| Build Time | ~2 minutes | Instant restart |
| CORS Setup | Production URLs | localhost + production |
| Cost | Free tier | Free |
| Control | Limited | Full access |
| Speed | CDN (fast) | Local (instant) |

## When to Use What

### Use Local Admin When:
- ✅ Hit Vercel deployment limit
- ✅ Testing admin changes frequently
- ✅ Developing plugins or customizations
- ✅ Need instant feedback
- ✅ Working offline (with local backend)

### Use Vercel Admin When:
- ✅ Production deployment
- ✅ Sharing with team
- ✅ CDN performance needed
- ✅ Automatic Git deployments

## Next Steps

### Deploy Frontend Locally (Optional)

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront

# Development mode
npm run dev
# Access at: http://localhost:3000

# OR Production mode
npm run build && npm start
# Access at: http://localhost:3000
```

### Push to Vercel (when limit resets)

```bash
cd /Users/123khongbiet/Documents/medusa

# Commit latest admin build
git add icfix/admin/
git commit -m "chore: update admin build"
git push origin main

# Vercel auto-deploys (if limit allows)
# Or wait 24 hours for limit reset
```

## Files Created

```
/Users/123khongbiet/Documents/medusa/
├── docker-compose.local.yml          # Docker config for local services
├── nginx/
│   └── admin.conf                     # Nginx config for admin
├── scripts/
│   ├── update-backend-cors.exp        # Update backend CORS
│   └── setup-local-admin.sh           # Setup script
├── LOCAL_DEPLOYMENT_GUIDE.md          # Full documentation
└── LOCAL_ADMIN_QUICKSTART.md          # This file
```

## Summary

✅ **Admin running locally**: http://localhost:3001/app
✅ **Backend CORS configured**: Accepts localhost requests  
✅ **No Vercel limits**: Rebuild/restart as needed
✅ **Production quality**: Same build as Vercel uses

**Your admin is ready to use! 🎉**

