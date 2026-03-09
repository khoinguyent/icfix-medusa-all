#!/bin/bash

# Direct deployment script for admin - simpler approach
# Deploys from icfix/admin directory directly

set -e

echo "🚀 Deploying Admin to Vercel (Direct Method)"
echo ""

cd "$(dirname "$0")/../icfix"

# Ensure admin is built
if [ ! -d "admin" ] || [ ! -f "admin/index.html" ]; then
    echo "📦 Building admin..."
    export VITE_ADMIN_BACKEND_URL="https://icfix.duckdns.org"
    npm run build:admin
fi

# Verify promotional content is in build
if ! grep -q "Promotional Content" admin/assets/*.js 2>/dev/null; then
    echo "❌ ERROR: Promotional Content route not found in build!"
    echo "Rebuilding admin..."
    export VITE_ADMIN_BACKEND_URL="https://icfix.duckdns.org"
    npm run build:admin
fi

echo "✅ Verified: Promotional Content route is in build"
echo ""

# Navigate to admin directory
cd admin

# Ensure vercel.json exists
if [ ! -f "vercel.json" ]; then
    cat > vercel.json << 'EOF'
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

# Ensure .vercel project config exists
mkdir -p .vercel
cat > .vercel/project.json << 'EOF'
{"projectId":"prj_sw6XD01lUbl74lUTtbpNQAHgipeL","orgId":"team_WsopvfvYrSKVEtPWKzJUHQgH","projectName":"icfix-medusa-all"}
EOF

echo "📤 Deploying to Vercel..."
echo "Project: icfix-medusa-all"
echo ""

# Deploy with archive to avoid rate limits
vercel --prod --yes --archive=tgz

echo ""
echo "✅ Deployment initiated!"
echo "Check status at: https://vercel.com/khoinguyents-projects/icfix-medusa-all"

