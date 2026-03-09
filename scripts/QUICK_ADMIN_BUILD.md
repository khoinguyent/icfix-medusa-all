# Quick Guide: Building Admin for Vercel

## Current Setup ✅

Your `vercel.json` is configured to use **pre-built assets** from git:
- ✅ Skips build on Vercel
- ✅ Uses `admin/` directory from repository
- ✅ Faster deployments

## How It Works

1. **Build locally** → Creates `icfix/admin/` directory
2. **Commit to git** → Admin files are tracked in repository
3. **Push to GitHub** → Triggers Vercel deployment
4. **Vercel serves** → Uses pre-built files from `admin/` directory

## Quick Commands

### Build and Deploy (Automated)
```bash
./scripts/build-and-commit-admin.sh
```

### Manual Build and Deploy
```bash
# 1. Build admin
cd icfix
npm run build:admin

# 2. Commit and push
cd ..
git add icfix/admin
git commit -m "chore: update admin UI"
git push origin main
```

## When to Rebuild

**Rebuild when:**
- ✅ You modify `src/admin/` files
- ✅ You update admin dependencies
- ✅ You change `medusa-config.ts` admin settings

**Don't rebuild when:**
- ❌ Only backend API changes
- ❌ Only storefront changes
- ❌ Only database changes

## Verify It's Working

1. **Check admin is in git:**
   ```bash
   git ls-files icfix/admin | wc -l
   # Should show thousands of files
   ```

2. **Check Vercel deployment:**
   - Go to Vercel dashboard
   - Check latest deployment logs
   - Should see: "Skipping build - using pre-built admin assets"

3. **Test admin UI:**
   - Visit your Vercel admin URL
   - Verify changes are visible

## Troubleshooting

**Admin not updating?**
1. Make sure `admin/` directory is committed: `git ls-files icfix/admin`
2. Check `vercel.json` has skip build commands
3. Verify Vercel deployment used the latest commit

**Build fails locally?**
```bash
cd icfix
rm -rf .medusa admin node_modules/.cache
npm install --legacy-peer-deps
npm run build:admin
```
