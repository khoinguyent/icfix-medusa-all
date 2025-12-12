# Manual Admin Deployment to Vercel

Due to Vercel rate limits, here are alternative methods to deploy the fixed admin:

## Method 1: Wait and Retry (Recommended)

The rate limit resets after some time. Wait a few minutes, then run:

```bash
cd /Users/123khongbiet/Documents/medusa
./scripts/deploy-admin-workaround.sh
```

## Method 2: Deploy via Vercel Dashboard

1. Go to: https://vercel.com/khoinguyents-projects/icfix-medusa-all
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Or upload the `icfix/admin` directory manually

## Method 3: Use Vercel CLI with Archive (After Rate Limit Resets)

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
export VITE_ADMIN_BACKEND_URL="https://icfix.duckdns.org"
rm -rf admin
npm run build:admin

cd admin
vercel --prod --yes --archive=tgz
```

## What Was Fixed

✅ **Fixed `icfix/src/admin/lib/sdk.ts`**:
- Now checks `VITE_ADMIN_BACKEND_URL` (matches Vercel env var)
- Falls back to `MEDUSA_BACKEND_URL`
- Defaults to `https://icfix.duckdns.org` in production
- No longer defaults to `localhost:9000`

✅ **Verified Build**:
- The built admin now contains `https://icfix.duckdns.org` in the JavaScript bundle
- No `localhost:9000` references in production build

## Next Steps

1. Wait for Vercel rate limit to reset (or use dashboard method)
2. Deploy the fixed admin build
3. Test login at https://admin.icfix.vn
4. CORS errors should be resolved
