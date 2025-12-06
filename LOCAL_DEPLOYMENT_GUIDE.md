# Local Deployment Guide

Deploy admin and frontend locally using Docker (bypasses Vercel deployment limits).

## Prerequisites

- Docker and Docker Compose installed
- Backend running at `api.icfix.vn` or locally

## Architecture

```
┌─────────────────┐
│  Admin (nginx)  │ :3001 → Backend API (api.icfix.vn:9000)
│  Static Assets  │
└─────────────────┘

┌─────────────────┐
│ Frontend (Next) │ :3000 → Backend API (api.icfix.vn:9000)
│   or nginx      │
└─────────────────┘
```

## Step 1: Update Backend CORS

### Option A: SSH to Backend Server

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/ssh-to-server.sh
```

Then edit `/root/icfix-medusa/.env`:

```bash
# Add localhost URLs to CORS
ADMIN_CORS=https://admin.icfix.vn,http://localhost:3001,http://127.0.0.1:3001
STORE_CORS=https://store.icfix.vn,http://localhost:3000,http://127.0.0.1:3000
AUTH_CORS=https://admin.icfix.vn,https://store.icfix.vn,http://localhost:3001,http://localhost:3000,http://127.0.0.1:3001,http://127.0.0.1:3000
```

Restart backend:
```bash
cd /root/icfix-medusa
docker-compose restart medusa-backend
```

### Option B: Add to docker-compose-prod.yml (Recommended)

Update the `.env` file on your local machine (`/Users/123khongbiet/Documents/medusa/.env`):

```env
ADMIN_CORS=https://admin.icfix.vn,http://localhost:3001
STORE_CORS=https://store.icfix.vn,http://localhost:3000
AUTH_CORS=https://admin.icfix.vn,https://store.icfix.vn,http://localhost:3001,http://localhost:3000
```

Then redeploy backend with updated env vars.

## Step 2: Deploy Admin Locally

### Build Admin (if not already built)

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
VITE_ADMIN_BACKEND_URL=https://api.icfix.vn VITE_BASE_PATH=/app npm run build:admin
```

### Start Admin with Docker

```bash
cd /Users/123khongbiet/Documents/medusa
docker-compose -f docker-compose.local.yml up -d admin-local
```

### Access Admin

- **URL**: http://localhost:3001/app
- **Login**: `admin@icfix.vn` / `admin123@`

### Verify

```bash
# Check logs
docker logs medusa-admin-local

# Test admin API
curl http://localhost:3001/app/
```

## Step 3: Deploy Frontend Locally (Optional)

### Option A: Run Next.js Development Server

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
npm run dev
# Access at: http://localhost:3000
```

### Option B: Run Next.js Production Server

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront

# Build for production
npm run build

# Start production server
npm start
# Access at: http://localhost:3000
```

### Option C: Docker with Next.js Server

```bash
cd /Users/123khongbiet/Documents/medusa
docker-compose -f docker-compose.local.yml up -d storefront-local
```

## Step 4: Verify Everything Works

### Test Admin

1. Open: http://localhost:3001/app
2. Login with admin credentials
3. Check Products, Orders, Settings
4. Verify API calls to `api.icfix.vn` succeed

### Test Frontend

1. Open: http://localhost:3000
2. Browse products
3. Add to cart
4. Check checkout flow

## Troubleshooting

### CORS Errors

**Error**: `Access to fetch at 'https://api.icfix.vn/...' has been blocked by CORS policy`

**Fix**: Verify backend CORS settings include `http://localhost:3001` and `http://localhost:3000`

### Admin Blank Page

**Error**: Admin loads but shows blank page

**Fix**: 
1. Check browser console for errors
2. Verify `VITE_ADMIN_BACKEND_URL` was set during build
3. Rebuild admin with correct env vars

### Connection Refused

**Error**: `ERR_CONNECTION_REFUSED`

**Fix**:
1. Ensure backend is running: `curl https://api.icfix.vn/health`
2. Check Docker containers: `docker ps`
3. Restart containers: `docker-compose -f docker-compose.local.yml restart`

## Stop Local Services

```bash
# Stop all local services
docker-compose -f docker-compose.local.yml down

# Stop specific service
docker-compose -f docker-compose.local.yml stop admin-local
docker-compose -f docker-compose.local.yml stop storefront-local
```

## Advantages of Local Deployment

✅ **No Vercel limits** - Deploy as many times as needed
✅ **Faster iteration** - No CI/CD wait time
✅ **Full control** - Customize nginx, caching, headers
✅ **Cost savings** - No hosting costs for static assets
✅ **Development flexibility** - Test changes locally before pushing

## Production Considerations

When ready to deploy to production:

1. Update `VITE_ADMIN_BACKEND_URL` to production URL
2. Rebuild admin: `npm run build:admin`
3. Commit to git (triggers Vercel auto-deploy when limit resets)
4. Or serve from your own server with nginx

