# 🔍 Storefront Data Missing - Analysis & Solution

## 📊 Current Status

Based on the diagnostic check:

### ✅ Backend Server Status
- **URL:** `https://icfix.duckdns.org`
- **Health:** ✅ Backend is responding
- **API Protection:** ✅ Backend requires publishable API key for store endpoints

### ❌ Issue Identified

**The backend requires a publishable API key (`x-publishable-api-key` header) to access:**
- `/store/products` endpoint
- `/store/regions` endpoint

**This means the Vercel storefront MUST have the correct `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` environment variable set.**

## 🎯 Root Cause

The storefront on Vercel is likely missing or has an incorrect publishable API key. Without this key:
1. API calls to `/store/products` fail
2. API calls to `/store/regions` fail
3. Storefront shows empty product lists
4. No regions available for checkout

## ✅ Solution Steps

### Step 1: Get the Publishable API Key

**Option A: From Backend Database (if you have SSH access)**
```bash
docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
  "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;"
```

**Option B: From Admin UI**
1. Login to Admin: `https://icfix.duckdns.org/app`
2. Navigate to: **Settings → Publishable API Keys**
3. Copy the key (starts with `pk_`)

**Option C: Create a new key if none exists**
1. Login to Admin: `https://icfix.duckdns.org/app`
2. Go to: **Settings → Publishable API Keys**
3. Click **Create Key**
4. Copy the generated key

### Step 2: Set Environment Variables on Vercel

1. **Go to Vercel Dashboard:**
   - Navigate to your storefront project
   - Click **Settings** → **Environment Variables**

2. **Add/Update these variables:**

   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx  # ← Your actual key
   NEXT_PUBLIC_DEFAULT_REGION=vn
   ```

3. **Important:** Make sure to:
   - Set for **Production**, **Preview**, and **Development** environments
   - Use the exact key from backend (starts with `pk_`)

### Step 3: Redeploy the Storefront

**Critical:** Environment variables with `NEXT_PUBLIC_` prefix are embedded at **build time**, so you MUST redeploy:

1. Go to **Deployments** tab in Vercel
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for build to complete

### Step 4: Verify the Fix

**Test the storefront:**
1. Open your Vercel storefront URL
2. Check browser console (F12 → Console tab)
3. Look for any API errors
4. Verify products are showing

**Test API directly:**
```bash
# Replace YOUR_KEY with actual publishable key
curl -H "x-publishable-api-key: YOUR_KEY" \
  https://icfix.duckdns.org/store/products

# Should return products, not an error
```

## 🔍 Verification Checklist

After applying the fix, verify:

- [ ] Publishable API key is set in Vercel environment variables
- [ ] Storefront has been redeployed after setting the key
- [ ] Backend returns products when queried with the key
- [ ] Storefront homepage shows products
- [ ] Browser console shows no API errors
- [ ] Regions are available (checkout works)

## 🧪 Diagnostic Commands

### Test Backend with Publishable Key
```bash
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
curl -H "x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" \
  https://icfix.duckdns.org/store/products
```

### Compare Backend vs Storefront
```bash
# Run the comparison script
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
export STOREFRONT_URL=https://your-storefront.vercel.app
./scripts/compare-storefront-backend-data.sh
```

## 📝 Code Reference

The storefront uses the publishable key in these locations:

1. **SDK Configuration** (`icfix-storefront/src/lib/config.ts`):
   ```typescript
   export const sdk = new Medusa({
     baseUrl: MEDUSA_BACKEND_URL,
     publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
   })
   ```

2. **Direct API Calls** (`icfix-storefront/src/lib/data/search.ts`):
   ```typescript
   headers: {
     "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
   }
   ```

3. **Middleware** (`icfix-storefront/src/middleware.ts`):
   ```typescript
   const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
   ```

## 🚨 Common Mistakes

1. **❌ Using secret key instead of publishable key**
   - Secret keys start with `sk_`
   - Publishable keys start with `pk_`
   - Storefront needs `pk_`, not `sk_`

2. **❌ Not redeploying after setting env vars**
   - `NEXT_PUBLIC_*` vars are embedded at build time
   - Must redeploy for changes to take effect

3. **❌ Wrong backend URL**
   - Should be `https://icfix.duckdns.org`
   - Not `http://localhost:9000` (local dev only)

4. **❌ Key not set for all environments**
   - Set for Production, Preview, AND Development
   - Vercel uses different env vars per environment

## 📚 Additional Resources

- **Troubleshooting Guide:** See `VERCEL_STOREFRONT_TROUBLESHOOTING.md`
- **Backend Config:** See `icfix/medusa-config.ts`
- **Storefront Config:** See `icfix-storefront/src/lib/config.ts`

---

**Issue Date:** 2025-01-XX  
**Status:** ⚠️ Requires publishable API key configuration on Vercel  
**Priority:** High - Storefront cannot display products without this

