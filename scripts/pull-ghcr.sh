#!/bin/bash

# Script to pull GHCR image with multiple fallback options
echo "🚀 Pulling GHCR image with fallback options..."

# Set the base image name
BASE_IMAGE="ghcr.io/khoinguyent/icfix-medusa-all"

# Try different tag combinations
TAGS=("latest" "main" "main-latest" "medusa-meilisearch")

# Function to try pulling an image
try_pull() {
    local image_tag="$1"
    echo "📦 Attempting to pull $image_tag..."
    
    if docker pull "$image_tag" 2>/dev/null; then
        echo "✅ Successfully pulled $image_tag"
        return 0
    else
        echo "❌ Failed to pull $image_tag"
        return 1
    fi
}

# Try to authenticate with GHCR if token is available
if [ -n "$GHCR_TOKEN" ]; then
    echo "🔐 Authenticating with GHCR..."
    echo "$GHCR_TOKEN" | docker login ghcr.io -u khoinguyent --password-stdin
elif [ -n "$GITHUB_TOKEN" ]; then
    echo "🔐 Authenticating with GHCR using GitHub token..."
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u khoinguyent --password-stdin
fi

# Try each tag
for tag in "${TAGS[@]}"; do
    if try_pull "$BASE_IMAGE:$tag"; then
        echo "🎉 Successfully pulled $BASE_IMAGE:$tag"
        exit 0
    fi
done

# If all tags failed, try without authentication
echo "🔄 Trying without authentication..."
for tag in "${TAGS[@]}"; do
    if try_pull "$BASE_IMAGE:$tag"; then
        echo "🎉 Successfully pulled $BASE_IMAGE:$tag"
        exit 0
    fi
done

# Check if the image exists in GitHub Packages
echo "🌐 Please check GitHub Packages manually:"
echo "https://github.com/khoinguyent/icfix-medusa-all/pkgs/container/icfix-medusa-all"
echo ""
echo "🔍 Common issues:"
echo "1. Image might be private - check package visibility settings"
echo "2. Image might not have 'latest' tag - check available tags"
echo "3. Build might have failed - check GitHub Actions logs"
echo "4. Image might be for different architecture"

# Show current architecture
echo ""
echo "🖥️  Current system architecture:"
uname -m
echo ""
echo "🐳 Docker info:"
docker version --format '{{.Server.Arch}}' 2>/dev/null || echo "Could not get Docker architecture"

exit 1
