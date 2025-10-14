#!/bin/bash

# Test Plugin Build Script
# This script verifies that the Gmail notification plugin is properly included in Docker build

set -e

echo "=================================="
echo "Testing Gmail Plugin Docker Build"
echo "=================================="
echo ""

# Build the image
echo "Building Docker image..."
docker-compose -f docker-compose-prod.yml build medusa-backend

echo ""
echo "=================================="
echo "Build complete! Check output above for:"
echo "  ✓ Found notification-gmail-oauth2 plugin"
echo "  ✓ Plugin package.json exists"
echo "  ✓ Plugin dependencies installed successfully"
echo "  ✓ PLUGIN SETUP COMPLETE"
echo "=================================="
echo ""

# Test the container
echo "Testing plugin in container..."
docker-compose -f docker-compose-prod.yml run --rm medusa-backend \
  sh -c "ls -la /app/plugins/notification-gmail-oauth2/ && \
         echo '' && \
         echo 'Plugin files verified!' && \
         cat /app/plugins/notification-gmail-oauth2/package.json"

echo ""
echo "=================================="
echo "✓ Gmail plugin is properly built!"
echo "=================================="

