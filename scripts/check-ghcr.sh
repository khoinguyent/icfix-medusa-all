#!/bin/bash

# Script to check GHCR image availability and tags
echo "🔍 Checking GHCR image availability..."

# Set the image name
IMAGE_NAME="ghcr.io/khoinguyent/icfix-medusa-all"

echo "📋 Checking available tags for $IMAGE_NAME"

# Try to authenticate with GHCR (if needed)
echo "🔐 Attempting to authenticate with GHCR..."
if [ -n "$GHCR_TOKEN" ]; then
    echo "$GHCR_TOKEN" | docker login ghcr.io -u khoinguyent --password-stdin
else
    echo "⚠️  No GHCR_TOKEN found. Trying without authentication..."
fi

# Check if the image exists
echo "🔍 Checking if image exists..."
if docker manifest inspect "$IMAGE_NAME:latest" >/dev/null 2>&1; then
    echo "✅ Image $IMAGE_NAME:latest exists!"
    
    # List available tags
    echo "📋 Available tags:"
    docker manifest inspect "$IMAGE_NAME:latest" | jq -r '.manifests[].platform.architecture' 2>/dev/null || echo "Could not list architectures"
    
else
    echo "❌ Image $IMAGE_NAME:latest not found"
    
    # Try other possible tag names
    echo "🔍 Trying other possible tag names..."
    
    for tag in "main" "main-latest" "medusa-meilisearch"; do
        echo "Checking $IMAGE_NAME:$tag..."
        if docker manifest inspect "$IMAGE_NAME:$tag" >/dev/null 2>&1; then
            echo "✅ Found $IMAGE_NAME:$tag"
        else
            echo "❌ $IMAGE_NAME:$tag not found"
        fi
    done
fi

# Check GitHub Packages directly
echo "🌐 Checking GitHub Packages..."
echo "Visit: https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all"

# Alternative image names to try
echo "🔍 Alternative image names to try:"
echo "1. ghcr.io/khoinguyent/icfix-medusa-all:latest"
echo "2. ghcr.io/khoinguyent/icfix-medusa-all:main"
echo "3. ghcr.io/khoinguyent/icfix-medusa-all:main-latest"

# Try to pull with different names
echo "📦 Attempting to pull with different names..."
for tag in "latest" "main" "main-latest"; do
    echo "Trying to pull $IMAGE_NAME:$tag..."
    if docker pull "$IMAGE_NAME:$tag" 2>/dev/null; then
        echo "✅ Successfully pulled $IMAGE_NAME:$tag"
        break
    else
        echo "❌ Failed to pull $IMAGE_NAME:$tag"
    fi
done
