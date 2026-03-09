#!/bin/bash
# Fix Admin UI to point to local backend
# This script rebuilds the admin with the correct backend URL for local development

set -e

echo "🔧 Fixing Admin UI to point to local backend..."

cd "$(dirname "$0")/.."

# Set environment variable for local backend
export VITE_ADMIN_BACKEND_URL="http://localhost:9002"
export VITE_BASE_PATH="/app"

# Rebuild admin with local backend URL
echo "📦 Rebuilding admin with local backend URL..."
cd icfix
npm run build:admin

echo "✅ Admin rebuilt successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Restart admin container: docker restart medusa-admin-local"
echo "2. Access admin at: http://localhost:3001/app"
echo "3. Admin will now connect to: http://localhost:9002"
