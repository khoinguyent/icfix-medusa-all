#!/bin/bash

# Fix Gmail OAuth2 Invalid Grant Error
# This script helps you generate a new refresh token

echo "🔧 Gmail OAuth2 Fix Script"
echo "=========================="
echo ""
echo "The 'invalid_grant' error means your refresh token has expired."
echo "You need to generate a new refresh token."
echo ""

# Check if .env file exists
ENV_FILE=""
if [ -f ".env" ]; then
    ENV_FILE=".env"
elif [ -f "icfix/.env" ]; then
    ENV_FILE="icfix/.env"
else
    ENV_FILE=$(find . -maxdepth 2 -name ".env" -type f 2>/dev/null | head -1)
fi

if [ -z "$ENV_FILE" ]; then
    echo "❌ No .env file found!"
    exit 1
fi

echo "✅ Found .env file at: $ENV_FILE"
echo ""

# Extract current values
source "$ENV_FILE"

echo "📋 Current Gmail Configuration:"
echo "  GMAIL_USER: $GMAIL_USER"
echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:10}..."
echo ""

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
    echo "Please set these in your .env file first"
    exit 1
fi

echo "🔄 To fix the 'invalid_grant' error, you need to generate a new refresh token:"
echo ""
echo "Step 1: Go to OAuth2 Playground"
echo "   https://developers.google.com/oauthplayground"
echo ""
echo "Step 2: Click the gear icon (⚙️) in the top right"
echo "   - Check 'Use your own OAuth credentials'"
echo "   - OAuth Client ID: $GOOGLE_CLIENT_ID"
echo "   - OAuth Client secret: $GOOGLE_CLIENT_SECRET"
echo ""
echo "Step 3: In the left panel, find 'Gmail API v1'"
echo "   - Select: https://www.googleapis.com/auth/gmail.send"
echo "   - Click 'Authorize APIs'"
echo "   - Sign in with: $GMAIL_USER"
echo "   - Click 'Allow'"
echo ""
echo "Step 4: In the right panel, click 'Exchange authorization code for tokens'"
echo "   - Copy the 'Refresh token' value"
echo ""
echo "Step 5: Update your .env file:"
echo "   nano $ENV_FILE"
echo ""
echo "   Replace the GOOGLE_REFRESH_TOKEN line with:"
echo "   GOOGLE_REFRESH_TOKEN=1//04[your-new-refresh-token]"
echo ""
echo "Step 6: Test again:"
echo "   ./test-gmail-docker.sh your-email@example.com"
echo ""
echo "💡 Tip: Refresh tokens can expire. You may need to regenerate them periodically."
echo ""
echo "🔗 Quick Links:"
echo "   OAuth Playground: https://developers.google.com/oauthplayground"
echo "   Google Cloud Console: https://console.cloud.google.com/apis/credentials"
