#!/bin/bash

# Script to manually trigger cache revalidation on Vercel storefront
# Usage: ./scripts/revalidate-cache.sh [event]

set -e

EVENT=${1:-"manual"}
STOREFRONT_URL=${STOREFRONT_URL:-"https://icfix.vn"}
REVALIDATE_SECRET=${REVALIDATE_SECRET:-""}

if [ -z "$REVALIDATE_SECRET" ]; then
  echo "❌ Error: REVALIDATE_SECRET environment variable is not set"
  echo ""
  echo "Set it in your .env file or export it:"
  echo "  export REVALIDATE_SECRET=your_secret_here"
  exit 1
fi

echo "🔄 Triggering cache revalidation..."
echo "  Storefront: $STOREFRONT_URL"
echo "  Event: $EVENT"
echo ""

REVALIDATE_URL="${STOREFRONT_URL}/api/revalidate?secret=${REVALIDATE_SECRET}&event=${EVENT}"

RESPONSE=$(curl -s -X POST "$REVALIDATE_URL" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$RESPONSE" | grep -q "revalidated"; then
  echo "✅ Cache revalidation successful!"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
  echo "❌ Cache revalidation failed!"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "💡 Note: It may take a few seconds for changes to appear on the frontend"

