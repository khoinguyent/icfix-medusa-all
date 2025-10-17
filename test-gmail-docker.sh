#!/bin/bash

# Gmail Test Script for Docker
# Usage: ./test-gmail-docker.sh recipient@example.com
# 
# This script:
# 1. Copies your local .env file to the Docker container
# 2. Runs the Gmail test script inside the container
# 3. Shows the results

if [ -z "$1" ]; then
    echo "❌ Usage: ./test-gmail-docker.sh recipient@example.com"
    echo ""
    echo "Example:"
    echo "  ./test-gmail-docker.sh test@gmail.com"
    exit 1
fi

RECIPIENT_EMAIL="$1"
CONTAINER_NAME="icfix-backend"

# Find .env file - check multiple possible locations
ENV_FILE=""
if [ -f ".env" ]; then
    ENV_FILE=".env"
elif [ -f "icfix/.env" ]; then
    ENV_FILE="icfix/.env"
else
    # Look for any .env file in current directory and subdirectories
    ENV_FILE=$(find . -maxdepth 2 -name ".env" -type f 2>/dev/null | head -1)
fi

echo "📧 Gmail Docker Test Script"
echo "============================"
echo "Recipient: $RECIPIENT_EMAIL"
echo "Container: $CONTAINER_NAME"
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container '$CONTAINER_NAME' is not running"
    echo "Please start it first:"
    echo "  docker-compose -f docker-compose-prod.yml up -d medusa-backend"
    exit 1
fi

echo "✅ Container is running"

# Check if .env file exists
if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Searched locations:"
    echo "  - ./.env"
    echo "  - ./icfix/.env"
    echo "  - Any .env file in current directory"
    echo ""
    echo "Please create .env file with Gmail OAuth2 credentials:"
    echo "  nano .env"
    echo ""
    echo "Required variables:"
    echo "  GMAIL_USER=your-email@gmail.com"
    echo "  GOOGLE_CLIENT_ID=your-client-id"
    echo "  GOOGLE_CLIENT_SECRET=your-client-secret"
    echo "  GOOGLE_REFRESH_TOKEN=your-refresh-token"
    echo "  STORE_NAME=\"Your Store Name\""
    echo "  STORE_URL=https://yourstore.com"
    exit 1
fi

echo "✅ Found .env file at: $ENV_FILE"

# Copy .env to container
echo "🔄 Copying .env file from $ENV_FILE to container..."
if docker cp "$ENV_FILE" "$CONTAINER_NAME:/app/.env"; then
    echo "✅ .env file copied successfully"
else
    echo "❌ Failed to copy .env file to container"
    exit 1
fi

echo ""
echo "📤 Running Gmail test..."
echo "========================"

# Run the test script
docker exec "$CONTAINER_NAME" node /app/test-gmail-direct.js "$RECIPIENT_EMAIL"
EXIT_CODE=$?

echo ""
echo "========================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 Test completed successfully!"
    echo "📬 Check the inbox of $RECIPIENT_EMAIL"
    echo "📧 Also check spam/junk folder"
else
    echo "❌ Test failed with exit code: $EXIT_CODE"
    echo "Check the output above for error details"
fi