#!/bin/bash

# Script to build admin locally and commit to git for Vercel deployment
# Usage: ./scripts/build-and-commit-admin.sh [commit-message]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ICFIX_DIR="$PROJECT_ROOT/icfix"

echo "🔨 Building Admin UI locally..."

cd "$ICFIX_DIR"

# Build the admin
echo "📦 Running build:admin..."
npm run build:admin

# Check if admin directory was created
if [ ! -d "admin" ] || [ -z "$(ls -A admin 2>/dev/null)" ]; then
    echo "❌ Error: Admin directory is empty or doesn't exist!"
    echo "Build may have failed. Check the output above."
    exit 1
fi

echo "✅ Admin built successfully!"

# Check git status
cd "$PROJECT_ROOT"
if [ -z "$(git status --porcelain icfix/admin)" ]; then
    echo "ℹ️  No changes to admin directory. Already up to date."
    exit 0
fi

# Show what will be committed
echo ""
echo "📋 Changes to be committed:"
git status --short icfix/admin | head -20

# Commit message
COMMIT_MSG="${1:-Update admin UI build}"
if [ "$COMMIT_MSG" = "auto" ]; then
    COMMIT_MSG="chore: update admin UI build $(date +%Y-%m-%d)"
fi

# Ask for confirmation
echo ""
read -p "Commit and push these changes? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. Changes are staged but not committed."
    exit 0
fi

# Stage and commit
echo "📝 Committing changes..."
git add icfix/admin
git commit -m "$COMMIT_MSG"

# Ask about pushing
read -p "Push to remote? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to remote..."
    git push origin main
    echo "✅ Pushed! Vercel will deploy the new admin build."
else
    echo "ℹ️  Committed locally. Push manually when ready:"
    echo "   git push origin main"
fi
