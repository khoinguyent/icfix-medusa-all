# Vercel Database Configuration Guide

## ⚠️ CRITICAL: Ensure Vercel Uses Production Database

When deploying to Vercel, the admin UI must use the **production database**, not the local database.

## Environment Variables for Vercel

### For Admin UI Deployment (icfix/admin)

In Vercel project settings, set these environment variables:

```bash
# Backend URL - Points to production server
VITE_ADMIN_BACKEND_URL=https://icfix.duckdns.org

# Base path for admin
VITE_BASE_PATH=/app
```

**⚠️ DO NOT set DATABASE_URL in Vercel for admin UI** - The admin UI is static and doesn't connect to the database directly.

### For Backend Deployment (if deploying backend to Vercel)

If you deploy the backend to Vercel, set:

```bash
# Production Database (NOT local)
DATABASE_URL=postgresql://icfix_user:YOUR_PASSWORD@YOUR_DB_HOST:5432/icfix_db

# Other required variables
REDIS_URL=redis://YOUR_REDIS_HOST:6379
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
# ... other production variables
```

## How Admin UI Works

1. **Admin UI is static files** - Built with `npm run build:admin`
2. **Backend URL is baked in at build time** - Set via `VITE_ADMIN_BACKEND_URL`
3. **Admin connects to backend API** - Not directly to database
4. **Backend handles database connections** - Using `DATABASE_URL` from backend environment

## Local vs Production

### Local Development
- Admin backend URL: `http://localhost:9002`
- Database: Local PostgreSQL in Docker
- Set in: `icfix/.env.local` (for rebuild) or rebuild with `VITE_ADMIN_BACKEND_URL=http://localhost:9002`

### Production (Vercel)
- Admin backend URL: `https://icfix.duckdns.org`
- Database: Production PostgreSQL on server
- Set in: Vercel environment variables

## Verification

### Check Local Admin
```bash
# Rebuild admin for local
cd icfix
VITE_ADMIN_BACKEND_URL="http://localhost:9002" npm run build:admin

# Restart container
docker restart medusa-admin-local

# Test
curl http://localhost:3001/app
```

### Check Vercel Admin
1. Go to Vercel project settings
2. Check Environment Variables
3. Verify `VITE_ADMIN_BACKEND_URL=https://icfix.duckdns.org`
4. Redeploy if needed

## Important Notes

- **Admin UI is client-side** - It makes API calls to the backend
- **Backend connects to database** - Using `DATABASE_URL` from backend's environment
- **Vercel admin deployment** - Only needs `VITE_ADMIN_BACKEND_URL`, not `DATABASE_URL`
- **Backend on server** - Uses production `DATABASE_URL` from server's `.env` file
