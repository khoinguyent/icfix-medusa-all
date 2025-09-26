#!/bin/bash

# Quick deployment script for GHCR images
echo "🚀 Deploying latest Medusa image from GHCR..."

# Set environment variables
export MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY:-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6}

# Pull latest image
echo "📦 Pulling latest image..."
docker pull ghcr.io/khoinguyent/icfix-medusa-all:latest

# Restart services
echo "🔄 Restarting services..."
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Initialize search
echo "🔧 Setting up search..."
docker exec icfix-backend npm run ts-node src/scripts/initialize-meilisearch.ts
docker exec icfix-backend npm run ts-node src/scripts/reindex-products.ts

echo "✅ Deployment complete!"
echo "🧪 Testing search..."
curl -s -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     "http://localhost:7700/indexes/products/search" \
     -H "Content-Type: application/json" \
     -d '{"q": "iPhone", "limit": 3}' | jq '.hits | length'

echo "📊 Search results count above should be > 0"
