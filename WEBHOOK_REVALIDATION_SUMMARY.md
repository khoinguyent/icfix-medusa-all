# Webhook Revalidation Setup - Complete Summary

## ✅ Events Coverage

### Backend Subscriber (`icfix/src/subscribers/vercel-revalidate.ts`)
**Listening to 12 events:**
- `product.created`, `product.updated`, `product.deleted`
- `product-variant.created`, `product-variant.updated`, `product-variant.deleted`
- `product-collection.created`, `product-collection.updated`, `product-collection.deleted`
- `product-category.created`, `product-category.updated`, `product-category.deleted`

### Frontend Revalidate Route (`icfix-storefront/src/app/api/revalidate/route.ts`)
**Handling the same 12 events:**
- ✅ All events match between backend and frontend
- ✅ Revalidates static cache tags (works for webhooks without cookies)
- ✅ Revalidates dynamic cache tags (for user-specific caching)
- ✅ Revalidates specific pages and paths

## ✅ Static Cache Tags Added

### Categories (`icfix-storefront/src/lib/data/categories.ts`)
- ✅ `listCategories()` - static tag: `"categories"`
- ✅ `getCategoryByHandle()` - static tags: `"categories"`, `"category:{handle}"`

### Products (`icfix-storefront/src/lib/data/products.ts`)
- ✅ `getProductsById()` - static tag: `"products"`
- ✅ `getProductByHandle()` - static tags: `"products"`, `"product:{handle}"`
- ✅ `listProducts()` - static tag: `"products"`

### Collections (`icfix-storefront/src/lib/data/collections.ts`)
- ✅ `retrieveCollection()` - static tags: `"collections"`, `"collection:{id}"`
- ✅ `listCollections()` - static tag: `"collections"`
- ✅ `getCollectionByHandle()` - static tags: `"collections"`, `"collection:{handle}"`

## 📋 Do You Need to Rebuild?

### **Backend (`icfix`)**
**✅ YES - Rebuild Required**
- Code changes were made to `src/subscribers/vercel-revalidate.ts`
- Enhanced event data to include `handle` for better revalidation
- **Action**: Rebuild and redeploy backend

### **Frontend (`icfix-storefront`)**
**✅ YES - Rebuild Required**
- Code changes were made to:
  - `src/lib/data/categories.ts` (added static cache tags)
  - `src/lib/data/products.ts` (added static cache tags)
  - `src/lib/data/collections.ts` (added static cache tags)
  - `src/app/api/revalidate/route.ts` (enhanced revalidation logic)
- **Action**: Rebuild and redeploy frontend (Vercel)

### **Webhook Configuration**
**❌ NO - No Rebuild Needed**
- Webhooks are configured via Admin API or Admin UI
- Use the script: `icfix/src/scripts/create-webhook-via-api.ts`
- Or manually create webhooks in Admin → Settings → Webhooks

## 🔧 Webhook Setup Steps

### Option 1: Using the Script (Recommended)
```bash
cd icfix
docker exec -e ADMIN_API_KEY="sk_xxx" \
  -e WEBHOOK_TARGET_BASE="https://your-storefront.vercel.app/api/revalidate" \
  -e REVALIDATE_SECRET="your-secret" \
  icfix-backend \
  npx medusa exec src/scripts/create-webhook-via-api.ts
```

### Option 2: Manual Setup via Admin UI
1. Go to Admin → Settings → Webhooks
2. Create webhook for each event (or one webhook with multiple events)
3. URL: `https://your-storefront.vercel.app/api/revalidate?secret=YOUR_SECRET&event=<event-name>`
4. Method: POST
5. Events: Select all product/category/collection/variant events

## 🔐 Environment Variables Required

### Backend (`icfix`)
```env
REVALIDATE_ENDPOINT=https://your-storefront.vercel.app/api/revalidate
REVALIDATE_SECRET=your-secret-here
```

### Frontend (`icfix-storefront`)
```env
REVALIDATE_SECRET=your-secret-here  # Must match backend
```

## ✅ Testing Webhooks

After rebuilding both services:

1. **Test category update:**
   - Update a category in Admin
   - Check frontend logs: Should see revalidation request
   - Verify category appears/disappears on storefront immediately

2. **Test product update:**
   - Update a product in Admin
   - Check frontend logs: Should see revalidation request
   - Verify product changes appear on storefront immediately

3. **Manual revalidation:**
   ```bash
   curl -X POST "https://your-storefront.vercel.app/api/revalidate?secret=YOUR_SECRET&event=manual"
   ```

## 📝 Summary

- ✅ **All 12 events are covered** (backend subscriber + frontend handler)
- ✅ **Static cache tags added** to all product/category/collection data fetches
- ✅ **Backend rebuild required** (code changes made)
- ✅ **Frontend rebuild required** (code changes made)
- ❌ **Webhook setup** (no rebuild needed, configure via API/UI)

After rebuilding both services and setting up webhooks, changes in Medusa will immediately trigger revalidation on your storefront! 🚀

