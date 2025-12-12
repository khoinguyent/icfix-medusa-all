# Check Vercel Environment Variables

## Required Variables for Storefront

The storefront needs these environment variables in Vercel:

1. **NEXT_PUBLIC_MEDUSA_BACKEND_URL**
   - Value: `https://icfix.duckdns.org`
   - Required: Yes
   - Purpose: Backend API URL

2. **NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY** ⚠️ **CRITICAL**
   - Value: `pk_...` (get from admin panel)
   - Required: Yes
   - Purpose: Authenticate API requests
   - **If missing, banners won't show!**

3. **NEXT_PUBLIC_DEFAULT_REGION**
   - Value: `vn`
   - Required: Yes
   - Purpose: Default region/country

4. **NEXT_PUBLIC_DEBUG_HOMEPAGE** (Optional)
   - Value: `true`
   - Required: No
   - Purpose: Enable debug logging

## How to Check/Add in Vercel

1. Go to: https://vercel.com/dashboard
2. Select: `icfix-medusa-storefront` project
3. Go to: **Settings** → **Environment Variables**
4. Check if all three required variables are set
5. If `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is missing:
   - Get key from admin panel (Settings → Publishable API Keys)
   - Add to Vercel
   - Redeploy

## How to Get Publishable Key

**Option 1: From Admin UI**
1. Login: `https://admin.icfix.vn` or `https://icfix.duckdns.org/app`
2. Go to: Settings → Publishable API Keys
3. Copy the key (starts with `pk_`)

**Option 2: From Database**
```bash
docker exec icfix-postgres psql -U icfix_admin -d icfix_db -c "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;"
```
