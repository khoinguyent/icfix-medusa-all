#!/bin/bash
# Simple script to check Docker image for commit df27e02

SERVER_IP="116.118.48.209"
SERVER_USER="root"
SERVER_PASS="46532@Nvc"

echo "=== Checking Docker Image for Commit df27e02 ==="
echo ""

sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /root/icfix-medusa

echo "1. Pulling latest image from GHCR..."
docker pull ghcr.io/khoinguyent/icfix-backend:latest 2>&1 | tail -5

echo ""
echo "2. Local Docker images:"
docker images ghcr.io/khoinguyent/icfix-backend --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" 2>/dev/null || echo "No images found"

echo ""
echo "3. Image details:"
docker inspect ghcr.io/khoinguyent/icfix-backend:latest --format "Created: {{.Created}}" 2>/dev/null || echo "Cannot inspect image"

echo ""
echo "4. Image size:"
docker images ghcr.io/khoinguyent/icfix-backend:latest --format "{{.Size}}" 2>/dev/null || echo "Cannot get size"
EOF

