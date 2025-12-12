# Force Banners to Show on Storefront

## Problem
Even though the code is deployed, banners, service features, and testimonials are not showing on the storefront.

## Root Causes

### 1. Missing Publishable API Key in Vercel
The most likely issue is that `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is not set in Vercel environment variables.

**How to check:**
1. Go to: Vercel Dashboard → `icfix-medusa-storefront` project
2. Settings → Environment Variables
3. Look for: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. If missing, add it with your publishable key from admin panel

**How to get the publishable key:**
1. Login to admin: `https://admin.icfix.vn` or `https://icfix.duckdns.org/app`
2. Go to: Settings → Publishable API Keys
3. Copy the key (starts with `pk_`)
4. Add to Vercel: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...`

### 2. No Data in Database
Even with the correct key, if there's no promotional content in the database, nothing will show.

**Check if data exists:**
```bash
# From server
docker exec icfix-postgres psql -U icfix_admin -d icfix_db -c "SELECT COUNT(*) FROM promotional_banner WHERE is_active = true;"
docker exec icfix-postgres psql -U icfix_admin -d icfix_db -c "SELECT COUNT(*) FROM service_feature WHERE is_active = true;"
docker exec icfix-postgres psql -U icfix_admin -d icfix_db -c "SELECT COUNT(*) FROM testimonial WHERE is_active = true;"
```

**If no data, seed it:**
```bash
# Run the seed script
docker exec icfix-backend bash -c "cd /app && cat /tmp/seed-promotional-content.sql | PGPASSWORD=icf1x@dm1n psql -h icfix-postgres -U icfix_admin -d icfix_db"
```

### 3. API Calls Failing Silently
The code catches errors and returns empty arrays, so failures are silent.

**Enable debug mode:**
1. In Vercel, add environment variable:
   - `NEXT_PUBLIC_DEBUG_HOMEPAGE=true`
2. Redeploy
3. Check Vercel function logs to see what's happening

## Quick Fixes

### Fix 1: Add Publishable Key to Vercel
1. Get publishable key from admin panel
2. Vercel → Project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` = `pk_...`
4. Redeploy (or wait for auto-deploy)

### Fix 2: Verify Data Exists
Check if promotional content exists in database. If not, seed it using the SQL script.

### Fix 3: Enable Debug Logging
Add `NEXT_PUBLIC_DEBUG_HOMEPAGE=true` to Vercel env vars to see what's happening in logs.

### Fix 4: Force Show (Temporary Test)
To test if components render, temporarily modify the code to show placeholders even with empty data.

## Verification Steps

1. **Check Vercel Environment Variables:**
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...` ← **CRITICAL**
   - `NEXT_PUBLIC_DEFAULT_REGION=vn`

2. **Check Backend API (with key):**
   ```bash
   curl -H "x-publishable-api-key: YOUR_KEY" https://icfix.duckdns.org/store/homepage-content
   ```

3. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → Latest → Functions → View Logs
   - Look for `[Homepage]` or `[Banners]` debug messages
   - Look for API errors

4. **Check Database:**
   - Verify promotional content exists and is active

## Most Likely Solution

**90% chance the issue is missing `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in Vercel.**

1. Add the key to Vercel environment variables
2. Redeploy
3. Banners should appear
