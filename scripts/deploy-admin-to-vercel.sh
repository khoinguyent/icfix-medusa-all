#!/bin/bash

# Script to deploy pre-built admin to Vercel
# This bypasses Vercel build and uses local build

set -e

echo "🚀 Deploying Admin to Vercel (icfix-medusa-all)"
echo ""

# Navigate to icfix directory
cd "$(dirname "$0")/../icfix"

# Ensure admin is built
if [ ! -d "admin" ] || [ ! -f "admin/index.html" ]; then
    echo "📦 Building admin..."
    npm run build:admin
fi

echo "✅ Admin build verified"
echo ""

# Check vercel.json in admin directory
if [ ! -f "admin/vercel.json" ]; then
    echo "📝 Creating vercel.json in admin directory..."
    cat > admin/vercel.json << 'EOF'
{
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
fi

# Ensure .vercel is linked to correct project
echo "🔗 Linking to icfix-medusa-all project..."
cd admin

# Remove existing .vercel if wrong project
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    CORRECT_ID="prj_sw6XD01lUbl74lUTtbpNQAHgipeL"
    if [ "$PROJECT_ID" != "$CORRECT_ID" ]; then
        echo "⚠️  Wrong project linked, fixing..."
        rm -rf .vercel
    fi
fi

# Link to correct project if not linked
if [ ! -f ".vercel/project.json" ]; then
    mkdir -p .vercel
    cat > .vercel/project.json << 'EOF'
{"projectId":"prj_sw6XD01lUbl74lUTtbpNQAHgipeL","orgId":"team_WsopvfvYrSKVEtPWKzJUHQgH","projectName":"icfix-medusa-all"}
EOF
fi

echo "📤 Deploying to Vercel..."
echo ""

# Deploy using vercel CLI
# Use --force to override root directory setting
vercel --prod --yes --force 2>&1 | tee /tmp/vercel-deploy.log

# Check deployment status
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Admin should be available at: https://admin.icfix.vn"
    echo ""
    echo "⏳ Wait a few seconds for propagation, then test:"
    echo "   curl -I https://admin.icfix.vn"
else
    echo ""
    echo "❌ Deployment failed. Check logs above."
    echo ""
    echo "💡 If you see 'root directory' error, you need to:"
    echo "   1. Go to https://vercel.com/khoinguyents-projects/icfix-medusa-all/settings"
    echo "   2. Remove or update the 'Root Directory' setting"
    echo "   3. Run this script again"
    exit 1
fi
