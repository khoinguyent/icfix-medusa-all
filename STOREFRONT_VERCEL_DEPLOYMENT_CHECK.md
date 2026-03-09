# Storefront Vercel Deployment Verification

## ✅ Code Status

**All promotional content code IS committed and pushed to main branch:**

- ✅ `HeroCarousel` component exists and is imported
- ✅ `ServiceFeatures` component exists and is imported  
- ✅ `Testimonials` component exists and is imported
- ✅ `getHomepageContent()` and `getHeroBanners()` are being called
- ✅ Latest commit: `8ebf3a869a` (error handling improvements)
- ✅ Previous commit: `86fc11e0bd` (promotional content revalidation)

## 🔍 Why Vercel Might Show Old UI

### Possible Causes:

1. **Vercel Not Auto-Deploying from Main**
   - Vercel project might be connected to a different branch
   - Auto-deploy might be disabled
   - Check: Vercel Dashboard → Project Settings → Git

2. **Vercel Using Cached Build**
   - Vercel caches builds for performance
   - Old build might be served from cache
   - Solution: Trigger manual redeploy

3. **Vercel Project Connected to Wrong Branch**
   - Project might be connected to `storefront-nextmerce` branch instead of `main`
   - Check: Vercel Dashboard → Project Settings → Git → Production Branch

4. **Build Errors Preventing Deployment**
   - Check Vercel deployment logs for build errors
   - Environment variables might be missing

5. **Root Directory Not Set Correctly**
   - Vercel might be building from wrong directory
   - Should be: `icfix-storefront/`

## 🛠️ How to Fix

### Step 1: Verify Vercel Project Settings

1. Go to: https://vercel.com/dashboard
2. Select project: `icfix-medusa-storefront`
3. Go to: **Settings** → **Git**
4. Verify:
   - **Production Branch:** `main` (not `storefront-nextmerce`)
   - **Root Directory:** `icfix-storefront` (if using monorepo)
   - **Auto-deploy:** Enabled

### Step 2: Trigger Manual Redeploy

**Option A: Via Vercel Dashboard**
1. Go to: **Deployments** tab
2. Click on latest deployment
3. Click: **Redeploy** (three dots menu)
4. Select: **Use existing Build Cache** = OFF (to force fresh build)

**Option B: Via Git Push (Trigger)**
```bash
# Make a small change to trigger rebuild
cd icfix-storefront
echo "# Trigger Vercel rebuild - $(date)" >> README.md
git add README.md
git commit -m "chore: Trigger Vercel rebuild"
git push origin main
```

**Option C: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
cd icfix-storefront
vercel link

# Deploy
vercel --prod
```

### Step 3: Check Build Logs

1. Go to: Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. Check **Build Logs** for:
   - Build errors
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### Step 4: Verify Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-key>`
- `NEXT_PUBLIC_DEFAULT_REGION=vn`

## 📋 Code Verification

The homepage code (`page.tsx`) includes:

```typescript
// ✅ Hero Carousel
{heroBanners.length > 0 ? (
  <HeroCarousel banners={heroBanners} />
) : null}

// ✅ Service Features
{service_features.length > 0 && (
  <ServiceFeatures features={service_features} />
)}

// ✅ Testimonials
{testimonials.length > 0 && 
 !homepage_sections.some(s => s.section_type === "testimonials" && s.is_active) && 
 <Testimonials testimonials={testimonials} />}
```

All components are properly imported and used.

## 🎯 Quick Fix Script

Create a trigger commit to force Vercel rebuild:

```bash
cd /Users/123khongbiet/Documents/medusa
cd icfix-storefront
echo "# Vercel rebuild trigger - $(date)" >> .vercel-rebuild
git add .vercel-rebuild
git commit -m "chore: Trigger Vercel rebuild for promotional content"
git push origin main
```

## 🔍 Debugging Steps

1. **Check if components are in build:**
   - Look for `HeroCarousel`, `ServiceFeatures`, `Testimonials` in build output
   - Check if they're being tree-shaken out

2. **Check if data is being fetched:**
   - Add console.logs in `getHomepageContent()` and `getHeroBanners()`
   - Check Vercel function logs for API calls

3. **Check if backend API is accessible:**
   ```bash
   curl https://icfix.duckdns.org/store/homepage-content
   curl https://icfix.duckdns.org/store/banners?position=hero&is_active=true
   ```

4. **Check Vercel build output:**
   - Look for warnings about missing components
   - Check if TypeScript compilation succeeded

## 📝 Next Steps

1. **Immediate:** Trigger manual redeploy in Vercel (disable cache)
2. **Verify:** Check Vercel project is connected to `main` branch
3. **Check:** Review latest deployment logs for errors
4. **Test:** Visit storefront after redeploy to see if sections appear
