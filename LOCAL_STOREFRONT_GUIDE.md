# Local Storefront Quick Start

**✅ Status**: Storefront configured and ready to run locally

## Environment Variables

The storefront is configured with:
- ✅ `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://icfix.duckdns.org`
- ✅ `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_43c3b3d995dbe3b2899bfffcb23355936e34f475e99e75e873c7b73349b78330`
- ✅ `REVALIDATE_SECRET=ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615`
- ✅ `NEXT_PUBLIC_DEFAULT_REGION=vn`

## Start Storefront

### Option 1: Using the Script (Recommended)

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/start-local-storefront.sh
```

### Option 2: Manual Start

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront

# If using Yarn
yarn dev

# Or if using npm
npm run dev
```

## Access Storefront

- **URL**: http://localhost:3000
- **Backend**: https://icfix.duckdns.org
- **Status**: Development mode with hot reload

## Verify It Works

1. **Open**: http://localhost:3000
2. **Check**: Products, categories, and cart should load
3. **Test**: Add products to cart, browse categories

## Troubleshooting

### Products/Categories Not Loading

**Check**:
1. Publishable API key is valid: `pk_43c3b3d995dbe3b2899bfffcb23355936e34f475e99e75e873c7b73349b78330`
2. Backend is accessible: `curl https://icfix.duckdns.org/health`
3. CORS allows localhost:3000 (already configured ✅)

### CORS Errors

**Fix**: Backend CORS already includes `http://localhost:3000` ✅

### Build Errors

If you see module resolution errors:
```bash
# Clean and reinstall
rm -rf node_modules .next
yarn install  # or npm install
yarn dev      # or npm run dev
```

## Production Build (Optional)

To build for production:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
yarn build
yarn start
```

## Architecture

```
┌──────────────────────────┐
│   Your Browser           │
│   localhost:3000         │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Next.js Dev Server     │
│   (Local, Port 3000)     │
│                          │
│   - Hot reload           │
│   - Fast refresh         │
│   - Development mode     │
└───────────┬──────────────┘
            │
            │ API Requests
            ▼
┌──────────────────────────┐
│   Backend Server         │
│   icfix.duckdns.org      │
│                          │
│   CORS allows:           │
│   - localhost:3000 ✅    │
└──────────────────────────┘
```

## Benefits of Local Development

✅ **Fast iteration** - Hot reload, instant changes
✅ **Easy debugging** - Full source maps, React DevTools
✅ **No Docker overhead** - Direct Node.js execution
✅ **Better performance** - No containerization overhead

## Summary

Your storefront is ready! Just run:
```bash
./scripts/start-local-storefront.sh
```

Then open http://localhost:3000 in your browser! 🚀

