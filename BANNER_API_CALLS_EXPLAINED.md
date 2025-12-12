# Why Banner API Calls Don't Show in Browser Network Tab

## ✅ Current Status

**Store API routes are now deployed and working!**
- ✅ `/store/homepage-content` - Returns banners, features, testimonials
- ✅ `/store/banners` - Returns banner data
- ✅ `/store/service-features` - Returns service features
- ✅ `/store/testimonials` - Returns testimonials

**API Test Results:**
- 3 hero banners available
- 4 service features available
- 5 testimonials available

## 🔍 Why You Don't See API Calls in Browser Network Tab

### The Issue
You're looking in the **browser Network tab**, but the API calls happen **server-side** during Next.js Server-Side Rendering (SSR).

### How Next.js SSR Works

1. **User visits page:** `store.icfix.vn/vi/vn`
2. **Vercel server receives request**
3. **Server-side code runs:**
   ```typescript
   // This runs on Vercel server, NOT in browser
   const homepageContent = await getHomepageContent()
   const heroBanners = await getHeroBanners("hero")
   ```
4. **API calls happen on server:**
   - `GET https://icfix.duckdns.org/store/homepage-content`
   - `GET https://icfix.duckdns.org/store/banners?position=hero&is_active=true`
5. **Server renders HTML with data**
6. **Browser receives complete HTML** (already includes banner data)

### What You See in Browser Network Tab

The browser Network tab only shows:
- ✅ **Client-side requests** (fetch/XHR from browser JavaScript)
- ✅ **Static assets** (images, CSS, JS files)
- ✅ **Next.js RSC requests** (React Server Components - what you're seeing)

The browser Network tab does NOT show:
- ❌ **Server-side API calls** (happen on Vercel server)
- ❌ **SSR data fetching** (happens before HTML is sent)

## 📊 Where to See Server-Side API Calls

### Option 1: Vercel Function Logs (Recommended)
1. Go to: Vercel Dashboard → `icfix-medusa-storefront`
2. **Deployments** → Latest deployment
3. **Functions** tab → **View Function Logs**
4. Look for:
   - `[Homepage] Fetching homepage content from: ...`
   - `[Banners] Fetching banners for position: hero`
   - `[Homepage] Response received: ...`

### Option 2: Enable Debug Mode
1. Add to Vercel env vars: `NEXT_PUBLIC_DEBUG_HOMEPAGE=true`
2. Redeploy
3. Check Vercel function logs for detailed logging

### Option 3: Check Server-Side Console
The `console.log()` statements in `homepage.ts` appear in:
- **Vercel function logs** (not browser console)
- **Server-side rendering logs**

## 🧪 How to Verify API Calls Are Happening

### Method 1: Check Vercel Logs
```bash
# In Vercel Dashboard
Deployments → Latest → Functions → View Logs
# Look for [Homepage] and [Banners] messages
```

### Method 2: Test API Directly
```bash
# Test with publishable key
curl -H "x-publishable-api-key: YOUR_KEY" \
  https://icfix.duckdns.org/store/homepage-content

# Should return JSON with banners, features, testimonials
```

### Method 3: Check Rendered HTML
1. View page source: `View → Developer → View Source`
2. Search for banner-related content
3. If banners are in HTML, API calls succeeded

## 🎯 Why Banners Still Might Not Show

Even though API calls work, banners might not show if:

1. **Empty arrays returned:**
   - API returns `[]` (no active banners)
   - Components check `if (array.length > 0)` → false
   - Nothing renders

2. **Component rendering issues:**
   - Components exist but have CSS/styling issues
   - Components hidden by CSS
   - JavaScript errors preventing render

3. **Cache issues:**
   - Old cached HTML being served
   - Next.js cache not invalidated
   - Browser cache showing old version

## ✅ Solution Applied

1. ✅ **Deployed store API routes** to backend
2. ✅ **Added publishable key headers** to all homepage functions
3. ✅ **Verified API returns data** (3 banners, 4 features, 5 testimonials)
4. ✅ **Backend restarted** with new routes

## 🚀 Next Steps

1. **Wait for Vercel to rebuild** (if auto-deploy enabled)
2. **Or manually redeploy** in Vercel dashboard
3. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Vercel function logs** to see server-side API calls
5. **Verify banners appear** on the homepage

## 📝 Summary

- ✅ API routes are deployed and working
- ✅ API returns correct data
- ✅ Code includes publishable key headers
- ⚠️ API calls happen server-side (not visible in browser Network tab)
- ✅ Check Vercel function logs to see server-side calls
- ✅ Banners should appear after Vercel rebuilds

The banners should now work! The API calls are happening server-side, which is why you don't see them in the browser Network tab.
