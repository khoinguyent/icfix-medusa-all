# Using Pre-built Admin Assets on Vercel

This guide explains how to build the admin UI locally and deploy pre-built assets to Vercel.

## Why Pre-built Assets?

- **Faster deployments**: No build time on Vercel
- **Consistent builds**: Build once, deploy everywhere
- **Better control**: Test locally before deploying
- **Reduced Vercel build minutes**: Save on build time

## Setup

### 1. Vercel Configuration

The `vercel.json` is configured to skip building and use pre-built assets:

```json
{
  "installCommand": "echo 'Using pre-built admin assets from repository'",
  "buildCommand": "echo 'Skipping build - using pre-built admin assets'",
  "outputDirectory": "admin"
}
```

### 2. Build Process

The admin is built using:
```bash
npm run build:admin
```

This command:
1. Builds the admin UI using Medusa CLI
2. Copies files from `.medusa/client/.medusa/admin/*` to `admin/` directory
3. The `admin/` directory is committed to git

## Workflow

### Option 1: Automated Script (Recommended)

```bash
# Build and commit admin
./scripts/build-and-commit-admin.sh

# Or with custom commit message
./scripts/build-and-commit-admin.sh "Update admin with new features"
```

The script will:
1. Build the admin locally
2. Show what changed
3. Ask for confirmation
4. Commit changes
5. Optionally push to remote

### Option 2: Manual Steps

```bash
# 1. Navigate to icfix directory
cd icfix

# 2. Build the admin
npm run build:admin

# 3. Go back to project root
cd ..

# 4. Check what changed
git status icfix/admin

# 5. Stage the changes
git add icfix/admin

# 6. Commit
git commit -m "chore: update admin UI build"

# 7. Push to trigger Vercel deployment
git push origin main
```

## Important Notes

### ✅ Admin Directory Must Be in Git

The `admin/` directory is **NOT** in `.gitignore`, so it will be committed to git.

**Check if admin is tracked:**
```bash
git ls-files icfix/admin | head -5
```

### ⚠️ File Size Considerations

The admin build can be large (4000+ files). Make sure:
- Git LFS is not needed (files are typically small JS/CSS)
- Repository size limits are acceptable
- Git history doesn't bloat too much

### 🔄 When to Rebuild

Rebuild and commit admin when:
- ✅ You modify admin UI code (`src/admin/`)
- ✅ You update Medusa admin dependencies
- ✅ You change admin configuration in `medusa-config.ts`
- ✅ You want to test a new admin build

**Don't rebuild if:**
- ❌ Only backend changes
- ❌ Only storefront changes
- ❌ Only database migrations

## Troubleshooting

### Admin Not Updating on Vercel

1. **Check if admin directory is committed:**
   ```bash
   git ls-files icfix/admin | wc -l
   ```
   Should show thousands of files.

2. **Verify vercel.json:**
   ```bash
   cat icfix/vercel.json
   ```
   Should have `buildCommand` that skips build.

3. **Check Vercel deployment logs:**
   - Go to Vercel dashboard
   - Check latest deployment
   - Verify it's using pre-built assets

### Build Fails Locally

1. **Clear cache:**
   ```bash
   cd icfix
   rm -rf .medusa admin node_modules/.cache
   npm run build:admin
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be >= 20
   ```

3. **Reinstall dependencies:**
   ```bash
   cd icfix
   rm -rf node_modules
   npm install --legacy-peer-deps
   npm run build:admin
   ```

## Alternative: Build on Vercel

If you prefer to build on Vercel instead, update `vercel.json`:

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build:admin",
  "outputDirectory": "admin"
}
```

This will build on every deployment but requires:
- All dependencies available on Vercel
- Environment variables configured
- Longer build times

## Best Practices

1. **Build before major releases**: Always test locally first
2. **Commit message**: Use descriptive messages like "Update admin UI - add promotional content"
3. **Version control**: Consider tagging releases
4. **CI/CD**: Can automate this in GitHub Actions if needed
