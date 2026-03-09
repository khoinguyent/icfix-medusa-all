#!/bin/bash

# Script to build admin locally and prepare for Vercel deployment
# Usage: ./scripts/build-and-deploy-admin.sh

set -e

echo "🚀 Building Admin UI for Vercel Deployment"
echo "=========================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../icfix" || exit 1

echo "📦 Step 1: Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "🔨 Step 2: Building admin UI..."
npm run build:admin

echo ""
echo "✅ Step 3: Verifying build output..."
if [ -d "admin" ] && [ "$(ls -A admin)" ]; then
    echo "✓ Admin directory exists and contains files"
    ADMIN_FILE_COUNT=$(find admin -type f | wc -l | tr -d ' ')
    echo "✓ Found $ADMIN_FILE_COUNT files in admin directory"
else
    echo "❌ Error: Admin directory is empty or doesn't exist!"
    exit 1
fi

echo ""
echo "📋 Step 4: Checking git status..."
cd ..
git status icfix/admin --short | head -20 || echo "No changes detected"

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Stage admin files: git add icfix/admin"
echo "3. Commit: git commit -m 'Update admin build'"
echo "4. Push: git push origin main"
echo ""
echo "Vercel will automatically deploy the pre-built admin assets."
echo "=========================================="
