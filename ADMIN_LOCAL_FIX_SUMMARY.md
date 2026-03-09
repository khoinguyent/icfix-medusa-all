# Admin UI Local Configuration - Fixed ✅

## Issues Fixed

### 1. Admin UI on Port 3001 ✅
- **Problem**: Admin was pointing to `https://icfix.duckdns.org` instead of local backend
- **Solution**: Rebuilt admin with `VITE_ADMIN_BACKEND_URL="http://localhost:9002"`
- **Status**: ✅ Fixed - Admin now connects to local backend

### 2. Backend Database Connection ✅
- **Problem**: Need to ensure backend uses local PostgreSQL
- **Solution**: Backend is correctly configured via `docker-compose.local.yml`
- **Status**: ✅ Verified - Backend uses `postgres://postgres:postgres@postgres:5432/medusa`

### 3. Vercel Database Configuration ✅
- **Problem**: Need to ensure Vercel uses production database, not local
- **Solution**: Created documentation guide
- **Status**: ✅ Documented - See `scripts/vercel-db-config-guide.md`

## Current Configuration

### Local Development
- **Admin UI**: `http://localhost:3001/app`
- **Backend API**: `http://localhost:9002`
- **Database**: Local PostgreSQL (`medusa-postgres-local` on port 5439)
- **Admin Backend URL**: `http://localhost:9002` (baked into admin build)

### Production (Vercel)
- **Admin UI**: Deployed to Vercel
- **Backend API**: `https://icfix.duckdns.org`
- **Database**: Production PostgreSQL on server
- **Admin Backend URL**: `https://icfix.duckdns.org` (set in Vercel env vars)

## How It Works

1. **Admin UI is static files** - Built with `npm run build:admin`
2. **Backend URL is embedded at build time** - Set via `VITE_ADMIN_BACKEND_URL`
3. **For local**: Rebuild with `VITE_ADMIN_BACKEND_URL="http://localhost:9002"`
4. **For Vercel**: Set `VITE_ADMIN_BACKEND_URL="https://icfix.duckdns.org"` in Vercel env vars

## Quick Commands

### Rebuild Admin for Local
```bash
cd icfix
VITE_ADMIN_BACKEND_URL="http://localhost:9002" npm run build:admin
docker restart medusa-admin-local
```

### Or use the script
```bash
./scripts/fix-admin-local-backend.sh
```

### Verify Backend Database
```bash
# Check backend is using local DB
docker exec medusa-backend-local printenv | grep DATABASE_URL
# Should show: DATABASE_URL=postgres://postgres:postgres@postgres:5432/medusa
```

## Vercel Configuration

### Required Environment Variables in Vercel

**For Admin UI Project:**
- `VITE_ADMIN_BACKEND_URL=https://icfix.duckdns.org`
- `VITE_BASE_PATH=/app`

**⚠️ DO NOT set DATABASE_URL in Vercel for admin UI** - Admin is static and doesn't connect to DB directly.

**For Backend (if deployed to Vercel):**
- `DATABASE_URL=postgresql://icfix_user:PASSWORD@HOST:5432/icfix_db` (production DB)
- Other production environment variables

## Verification

### Test Local Admin
1. Access: http://localhost:3001/app
2. Should connect to: http://localhost:9002
3. Backend should use: Local PostgreSQL database

### Test Vercel Admin
1. Check Vercel environment variables
2. Verify `VITE_ADMIN_BACKEND_URL=https://icfix.duckdns.org`
3. Admin should connect to production backend
4. Production backend uses production database

## Files Modified

1. ✅ Rebuilt `icfix/admin/` with local backend URL
2. ✅ Created `scripts/fix-admin-local-backend.sh` for easy rebuild
3. ✅ Created `scripts/vercel-db-config-guide.md` for Vercel setup
4. ✅ Verified backend database configuration in `docker-compose.local.yml`

## Next Steps

1. ✅ Admin UI now works locally on port 3001
2. ✅ Backend correctly uses local PostgreSQL
3. ⚠️ **Verify Vercel environment variables** - Ensure `VITE_ADMIN_BACKEND_URL=https://icfix.duckdns.org` is set
4. ⚠️ **Verify production backend** - Ensure production backend uses production database (not local)
