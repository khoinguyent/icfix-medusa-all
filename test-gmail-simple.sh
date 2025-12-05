#!/bin/bash

# Simple Gmail Test - Run directly inside container
# Usage: docker exec -it icfix-backend /app/test-gmail-simple.sh recipient@example.com

RECIPIENT_EMAIL="$1"

if [ -z "$RECIPIENT_EMAIL" ]; then
    echo "❌ Usage: ./test-gmail-simple.sh recipient@example.com"
    echo ""
    echo "Run from inside container:"
    echo "  docker exec -it icfix-backend /app/test-gmail-simple.sh test@gmail.com"
    exit 1
fi

echo "📧 Simple Gmail Test"
echo "==================="
echo "Recipient: $RECIPIENT_EMAIL"
echo ""

# Check if .env exists
if [ ! -f "/app/.env" ]; then
    echo "❌ .env file not found in /app/.env"
    echo "Please copy your .env file to the container first:"
    echo "  docker cp icfix/.env icfix-backend:/app/.env"
    exit 1
fi

echo "✅ Found .env file"

# Check required variables
echo "🔍 Checking Gmail credentials..."
source /app/.env

MISSING_VARS=()
[ -z "$GMAIL_USER" ] && MISSING_VARS+=("GMAIL_USER")
[ -z "$GOOGLE_CLIENT_ID" ] && MISSING_VARS+=("GOOGLE_CLIENT_ID")
[ -z "$GOOGLE_CLIENT_SECRET" ] && MISSING_VARS+=("GOOGLE_CLIENT_SECRET")
[ -z "$GOOGLE_REFRESH_TOKEN" ] && MISSING_VARS+=("GOOGLE_REFRESH_TOKEN")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing environment variables:"
    printf '   - %s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please add these to your .env file"
    exit 1
fi

echo "✅ All Gmail credentials found"
echo "From: $GMAIL_USER"
echo ""

# Run the test
echo "📤 Sending test email..."
node /app/test-gmail-direct.js "$RECIPIENT_EMAIL"
