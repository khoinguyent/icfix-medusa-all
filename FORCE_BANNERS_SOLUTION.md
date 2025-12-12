# Force Banners to Show - Complete Solution

## ✅ Current Status

**Data exists in database:**
- ✅ 3 active banners (hero position)
- ✅ 4 active service features
- ✅ 5 active testimonials

**Code is deployed:**
- ✅ All components (HeroCarousel, ServiceFeatures, Testimonials) are in code
- ✅ Latest commit: `50865d3461` (with debug logging)
- ✅ Code is on `main` branch and pushed

## 🔴 Root Cause

**The API calls are failing because `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is missing in Vercel.**

When the publishable key is missing:
1. API returns: `"Publishable API key required"`
2. Code catches error and returns empty arrays: `[]`
3. Components check `if (array.length > 0)` → false
4. Nothing renders

## 🛠️ Solution Steps

### Step 1: Get Publishable API Key

**Option A: From Admin Panel**
1. Go to: `https://admin.icfix.vn` or `https://icfix.duckdns.org/app`
2. Login with: `admin@icfix.vn` / `admin123@`
3. Go to: **Settings** → **Publishable API Keys**
4. Copy the key (starts with `pk_`)

**Option B: From Database**
```bash
docker exec icfix-postgres psql -U icfix_admin -d icfix_db -c "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;"
```

### Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select: `icfix-medusa-storefront` project
3. Go to: **Settings** → **Environment Variables**
4. Click: **Add New**
5. Add:
   - **Key:** `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
   - **Value:** `pk_...` (your key from step 1)
   - **Environment:** Production, Preview, Development (select all)
6. Click: **Save**

### Step 3: Verify Other Variables

Also ensure these are set:
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = `https://icfix.duckdns.org`
- `NEXT_PUBLIC_DEFAULT_REGION` = `vn`

### Step 4: Redeploy

**Option A: Automatic (if auto-deploy enabled)**
- Just wait - Vercel will auto-deploy when env vars change

**Option B: Manual Redeploy**
1. Go to: **Deployments** tab
2. Click on latest deployment
3. Click: **⋯** (three dots) → **Redeploy**
4. **Uncheck:** "Use existing Build Cache"
5. Click: **Redeploy**

### Step 5: Verify

1. Wait for deployment to complete
2. Visit: `https://store.icfix.vn`
3. You should see:
   - Hero carousel with banners
   - Service features section
   - Testimonials section

## 🔍 Debug Mode (Optional)

To see what's happening in logs:

1. Add to Vercel env vars:
   - `NEXT_PUBLIC_DEBUG_HOMEPAGE` = `true`
2. Redeploy
3. Check Vercel function logs:
   - **Deployments** → Latest → **Functions** → **View Logs**
   - Look for `[Homepage]` and `[Banners]` messages
   - Check if API calls are succeeding

## 🧪 Test API Directly

Test if API works with publishable key:

```bash
# Replace YOUR_KEY with actual publishable key
curl -H "x-publishable-api-key: YOUR_KEY" \
  https://icfix.duckdns.org/store/homepage-content

# Should return JSON with banners, features, testimonials
```

## 📋 Checklist

- [ ] Publishable key obtained from admin panel
- [ ] `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` added to Vercel
- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` set to `https://icfix.duckdns.org`
- [ ] `NEXT_PUBLIC_DEFAULT_REGION` set to `vn`
- [ ] Redeployed (with cache disabled)
- [ ] Verified banners show on storefront

## 🚨 If Still Not Working

1. **Check Vercel Logs:**
   - Look for API errors
   - Check if publishable key is being sent
   - Look for `[Homepage]` debug messages

2. **Test API with Key:**
   ```bash
   curl -H "x-publishable-api-key: YOUR_KEY" \
     https://icfix.duckdns.org/store/homepage-content
   ```
   - If this works, issue is in Vercel env vars
   - If this fails, issue is in backend/API

3. **Check Backend CORS:**
   - Ensure `STORE_CORS` includes `https://store.icfix.vn`
   - Check `medusa-config.ts` CORS settings

4. **Verify Data:**
   - Data exists (already verified: 3 banners, 4 features, 5 testimonials)
   - All items have `is_active = true`

## 💡 Quick Test

To verify components render (even with empty data), temporarily modify:

```typescript
// In page.tsx, change:
{heroBanners.length > 0 ? (
  <HeroCarousel banners={heroBanners} />
) : null}

// To:
<HeroCarousel banners={heroBanners.length > 0 ? heroBanners : [{
  id: 'test',
  title: 'Test Banner',
  image_url: '/hero_iphone_17_pro.jpg',
  position: 'hero',
  display_order: 1,
  is_active: true
}]} />
```

This will show a test banner even if API fails, confirming components work.
