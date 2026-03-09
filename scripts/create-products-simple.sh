#!/bin/bash
# Create products using Admin API
# This requires proper authentication

BACKEND_URL="http://localhost:9002"
EMAIL="admin@icfix.vn"
PASSWORD="admin123@"

echo "🌱 Creating products via Admin API..."

# Note: Product creation is complex and requires:
# - Proper authentication
# - Variants with prices
# - Options
# - Sales channels
# - Shipping profiles

echo "⚠️  Product creation via API requires proper authentication."
echo "💡 Recommended: Use Admin UI at http://localhost:3001 to create products"
echo "   Or run the full seed script in development mode:"
echo "   docker exec medusa-backend-local sh -c 'cd /app && NODE_ENV=development npm run seed'"
