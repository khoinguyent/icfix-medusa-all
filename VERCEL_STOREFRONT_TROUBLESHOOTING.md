# 🔍 Vercel Storefront Data Missing - Troubleshooting Guide

This guide helps diagnose and fix issues when the Vercel storefront is missing data compared to the backend server.

## 🎯 Quick Diagnosis

Run these scripts to compare data:

```bash
# Check what data is on the backend
./scripts/check-backend-data.sh

# Compare backend vs storefront (requires storefront URL)
./scripts/compare-storefront-backend-data.sh
```

## 🔍 Common Issues & Solutions

### Issue 1: Missing Environment Variables on Vercel

**Symptoms:**
- Storefront shows empty product list
- No regions available
- API calls fail in browser console

**Solution:**

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings → Environment Variables**

2. **Verify these variables are set:**
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx
   NEXT_PUBLIC_DEFAULT_REGION=vn
   ```

3. **Important:** After adding/updating environment variables:
   - **Redeploy** the application (Vercel doesn't auto-redeploy on env var changes)
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

### Issue 2: Incorrect Publishable API Key

**Symptoms:**
- Backend returns data when tested directly
- Storefront shows empty results
- Browser console shows 401/403 errors

**Solution:**

1. **Get the correct publishable key from backend:**
   ```bash
   # If using Docker
   docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
     "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;"
   ```

2. **Or from Admin UI:**
   - Login to Admin: `https://icfix.duckdns.org/app`
   - Go to: **Settings → Publishable API Keys**
   - Copy the key (starts with `pk_`)

3. **Update Vercel environment variable:**
   - Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to the correct key
   - **Redeploy** the application

4. **Verify the key works:**
   ```bash
   curl -H "x-publishable-api-key: pk_..." \
     https://icfix.duckdns.org/store/products
   ```

### Issue 3: Wrong Backend URL

**Symptoms:**
- Storefront can't connect to backend
- Network errors in browser console
- CORS errors

**Solution:**

1. **Verify backend URL is correct:**
   ```bash
   curl https://icfix.duckdns.org/health
   # Should return: {"status":"ok"} or {"status":"available"}
   ```

2. **Check Vercel environment variable:**
   - Ensure `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is set to `https://icfix.duckdns.org`
   - **Not** `http://localhost:9000` (that's for local dev only)

3. **Redeploy** after fixing

### Issue 4: CORS Configuration

**Symptoms:**
- Browser console shows CORS errors
- Network requests fail with CORS policy errors

**Solution:**

1. **Check backend CORS configuration:**
   ```bash
   # On backend server, check .env file
   STORE_CORS=https://your-storefront.vercel.app,https://your-storefront.vercel.app/*
   ```

2. **Add your Vercel storefront URL to backend CORS:**
   - Get your Vercel deployment URL (e.g., `https://icfix-storefront.vercel.app`)
   - Add it to `STORE_CORS` in backend `.env`
   - Restart backend: `docker restart icfix-backend`

3. **Verify CORS headers:**
   ```bash
   curl -I -H "Origin: https://your-storefront.vercel.app" \
     https://icfix.duckdns.org/store/products
   # Should see: Access-Control-Allow-Origin: https://your-storefront.vercel.app
   ```

### Issue 5: Build-Time vs Runtime Environment Variables

**Symptoms:**
- Environment variables are set but not working
- Old values still being used

**Solution:**

1. **Next.js requires `NEXT_PUBLIC_` prefix:**
   - Only variables starting with `NEXT_PUBLIC_` are available in the browser
   - These are embedded at **build time**, not runtime

2. **After changing `NEXT_PUBLIC_*` variables:**
   - **Must rebuild** the application
   - Vercel will rebuild automatically on git push
   - Or manually trigger redeploy

3. **Check build logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on a deployment → View Build Logs
   - Look for environment variable warnings

### Issue 6: Cache Issues

**Symptoms:**
- Data appears in one browser but not another
- Old data showing after updates

**Solution:**

1. **Clear Next.js cache:**
   - Vercel uses edge caching
   - Trigger a new deployment to clear cache
   - Or use revalidation webhooks (if configured)

2. **Check cache headers:**
   ```bash
   curl -I https://your-storefront.vercel.app
   # Look for Cache-Control headers
   ```

3. **Force revalidation:**
   - Make a change to trigger rebuild
   - Or use Vercel's "Redeploy" feature

## 🔧 Step-by-Step Fix Process

### Step 1: Verify Backend Has Data

```bash
# Check backend health
curl https://icfix.duckdns.org/health

# Check products (with publishable key)
curl -H "x-publishable-api-key: YOUR_KEY" \
  https://icfix.duckdns.org/store/products

# Check regions
curl https://icfix.duckdns.org/store/regions
```

**Expected:** Backend should return products and regions.

### Step 2: Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_DEFAULT_REGION`

### Step 3: Verify Storefront Configuration

Check your storefront code uses the environment variables correctly:

```typescript
// Should be in src/lib/config.ts
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

### Step 4: Test Storefront API Calls

Open browser console on your Vercel storefront and check:

1. **Network tab:** Look for failed requests to `/store/products` or `/store/regions`
2. **Console tab:** Look for errors about missing environment variables
3. **Application tab:** Check if cookies/session are being set

### Step 5: Redeploy After Fixes

**Critical:** After changing environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for build to complete
5. Test the storefront again

## 🧪 Testing Checklist

After applying fixes, verify:

- [ ] Backend health check returns OK
- [ ] Backend returns products when queried directly
- [ ] Vercel environment variables are set correctly
- [ ] Storefront has been redeployed after env var changes
- [ ] Browser console shows no CORS errors
- [ ] Browser console shows no 401/403 errors
- [ ] Products appear on storefront homepage
- [ ] Regions are available (checkout works)

## 📊 Diagnostic Commands

### Check Backend Data
```bash
./scripts/check-backend-data.sh
```

### Compare Backend vs Storefront
```bash
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
export STOREFRONT_URL=https://your-storefront.vercel.app
./scripts/compare-storefront-backend-data.sh
```

### Test API Endpoints Directly
```bash
# Products
curl -H "x-publishable-api-key: pk_..." \
  https://icfix.duckdns.org/store/products

# Regions
curl https://icfix.duckdns.org/store/regions

# Health
curl https://icfix.duckdns.org/health
```

## 🆘 Still Not Working?

If issues persist:

1. **Check Vercel Build Logs:**
   - Look for errors during build
   - Check if environment variables are being read

2. **Check Browser Console:**
   - Open DevTools → Console
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Verify Backend is Accessible:**
   ```bash
   # From your local machine
   curl https://icfix.duckdns.org/health
   
   # Should work from anywhere (not just server)
   ```

4. **Check Backend Logs:**
   ```bash
   docker logs icfix-backend
   # Look for CORS errors or API key validation errors
   ```

5. **Test with Local Storefront:**
   - Run storefront locally with same env vars
   - If local works but Vercel doesn't, it's a Vercel config issue
   - If both fail, it's a backend/API key issue

## 📝 Environment Variable Reference

### Required for Storefront:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx
NEXT_PUBLIC_DEFAULT_REGION=vn
```

### Optional:
```
REVALIDATE_SECRET=your_secret_here  # For webhook revalidation
NEXT_PUBLIC_BASE_URL=https://your-storefront.vercel.app  # For absolute URLs
```

## 🔗 Related Files

- `icfix-storefront/src/lib/config.ts` - SDK configuration
- `icfix-storefront/src/lib/data/products.ts` - Product fetching
- `icfix-storefront/src/lib/data/regions.ts` - Region fetching
- `icfix-storefront/src/middleware.ts` - Region middleware
- `icfix/medusa-config.ts` - Backend CORS configuration

---

**Last Updated:** 2025-01-XX  
**Backend URL:** https://icfix.duckdns.org

