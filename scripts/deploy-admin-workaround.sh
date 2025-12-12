#!/bin/bash

# Workaround script to deploy admin when Vercel has root directory setting
# Creates temporary structure matching Vercel's expectations

set -e

echo "🚀 Deploying Admin to Vercel (Workaround Method)"
echo ""

cd "$(dirname "$0")/../icfix"

# Ensure admin is built
if [ ! -d "admin" ] || [ ! -f "admin/index.html" ]; then
    echo "📦 Building admin..."
    npm run build:admin
fi

# Create temporary directory structure
TEMP_DIR=$(mktemp -d)
echo "📁 Creating temporary deployment structure in: $TEMP_DIR"

# Copy admin files to temp/icfix/admin
mkdir -p "$TEMP_DIR/icfix"
cp -r admin "$TEMP_DIR/icfix/"

# Create vercel.json in icfix subdirectory (matching root directory setting)
cat > "$TEMP_DIR/icfix/vercel.json" << 'EOF'
{
  "installCommand": "echo 'Using pre-built admin'",
  "buildCommand": "echo 'Skipping build - using pre-built admin'",
  "outputDirectory": "admin",
  "framework": null,
  "rewrites": [
    {
      "source": "/((?!assets).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF

# Link to correct project
cd "$TEMP_DIR"
mkdir -p .vercel
cat > .vercel/project.json << 'EOF'
{"projectId":"prj_sw6XD01lUbl74lUTtbpNQAHgipeL","orgId":"team_WsopvfvYrSKVEtPWKzJUHQgH","projectName":"icfix-medusa-all"}
EOF

echo "📤 Deploying from temporary directory..."
vercel --prod --yes --archive=tgz --archive=tgz

# Cleanup
echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Deployment complete!"
