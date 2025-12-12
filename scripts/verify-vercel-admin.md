# Vercel Admin Build Verification

## Issue
Admin UI is built locally but not updating on Vercel even after pushing to git.

## Root Cause
The `vercel.json` was configured to skip the build and use pre-built assets:
- `installCommand`: `echo 'Skipping install - using pre-built assets'`
- `buildCommand`: `echo 'Skipping build - using pre-built assets from repository'`

This meant Vercel was not actually building the admin, just serving static files from the `admin` directory.

## Solution
Updated `vercel.json` to actually build the admin on Vercel:
- `installCommand`: `npm install --legacy-peer-deps`
- `buildCommand`: `npm run build:admin`
- `outputDirectory`: `admin` (unchanged)

## Build Process
The `build:admin` script:
1. Runs `node node_modules/@medusajs/cli/cli.js build --admin-only`
2. Copies built files from `.medusa/client/.medusa/admin/*` to `admin/` directory

## Required Vercel Environment Variables
Make sure these are set in Vercel project settings:
- `VITE_ADMIN_BACKEND_URL` or `MEDUSA_BACKEND_URL` - Backend API URL (defaults to https://icfix.duckdns.org)
- `VITE_BASE_PATH` - Base path for admin (defaults to `/`)

## Verification Steps
1. Push the updated `vercel.json` to git
2. Vercel should automatically trigger a new deployment
3. Check Vercel deployment logs to verify:
   - `npm install --legacy-peer-deps` runs successfully
   - `npm run build:admin` runs successfully
   - Admin files are generated in `admin/` directory
4. Verify the admin UI is updated on Vercel

## If Build Still Fails
1. Check Vercel build logs for errors
2. Verify Node.js version (should be >= 20)
3. Check if all dependencies are installed correctly
4. Verify environment variables are set correctly
