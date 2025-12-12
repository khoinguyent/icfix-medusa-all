#!/bin/bash

# Script to pull latest image and restart services on server
# Usage: ./scripts/pull-and-restart.sh

set -e

echo "🚀 Pulling latest image and restarting services..."

# Image name
IMAGE_NAME="ghcr.io/khoinguyent/icfix-medusa-all:latest"

# Pull latest image
echo "📦 Pulling latest image: $IMAGE_NAME"
docker pull "$IMAGE_NAME"

# Restart services using docker-compose
echo "🔄 Restarting services..."
docker-compose -f docker-compose-prod.yml up -d --force-recreate medusa-backend

# Wait for service to be healthy
echo "⏳ Waiting for backend to be healthy..."
sleep 10

# Check service status
echo "📊 Service status:"
docker-compose -f docker-compose-prod.yml ps medusa-backend

# Show recent logs
echo "📋 Recent logs (last 30 lines):"
docker-compose -f docker-compose-prod.yml logs --tail=30 medusa-backend

echo "✅ Deployment complete!"
