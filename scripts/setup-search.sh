#!/bin/bash

# Setup Meilisearch real-time indexing for Medusa (GHCR deployment)
echo "🔍 Setting up Meilisearch real-time indexing..."

# Check if we're in the right directory
if [ ! -f "docker-compose-prod.yml" ]; then
    echo "❌ Please run this script from the medusa project root directory"
    exit 1
fi

# Set environment variables if not already set
export MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY:-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6}

# Get the latest image tag from GHCR
echo "📦 Pulling latest image from GHCR..."
docker pull ghcr.io/khoinguyent/icfix-medusa-all:latest

echo "🔄 Restarting services with latest image..."
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔧 Initializing Meilisearch index..."
docker exec icfix-backend npm run ts-node src/scripts/initialize-meilisearch.ts

echo "📊 Re-indexing all products..."
docker exec icfix-backend npm run medusa exec src/scripts/reindex-products-cli.ts

echo "🧪 Testing search functionality..."
# Test if Meilisearch is working
curl -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     "http://localhost:7700/indexes/products/search" \
     -H "Content-Type: application/json" \
     -d '{"q": "iPhone", "limit": 5}' | jq .

echo "✅ Setup complete! Real-time indexing is now active."
echo ""
echo "📝 To monitor indexing in real-time, run:"
echo "   docker logs -f icfix-backend | grep -E '(Indexing|Successfully indexed)'"
echo ""
echo "🔍 To test search manually:"
echo "   curl -H 'Authorization: Bearer $MEILISEARCH_API_KEY' \\"
echo "        'http://localhost:7700/indexes/products/search' \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"q\": \"iPhone\", \"limit\": 10}'"
