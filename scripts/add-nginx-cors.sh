#!/bin/bash
# Add Nginx CORS configuration
# Handles OPTIONS preflight and hides Medusa CORS headers to prevent duplicates

NGINX_CONF="nginx/conf.d/medusa.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo "Error: $NGINX_CONF not found"
    exit 1
fi

# Backup
cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

# Check if already configured
if grep -q "Handle OPTIONS preflight requests directly" "$NGINX_CONF"; then
    echo "CORS already configured in $NGINX_CONF"
    exit 0
fi

# Create temp file with OPTIONS handler
cat > /tmp/nginx_cors_options.txt << 'EOF'
    # Handle OPTIONS preflight requests directly (before proxying)
    if ($request_method = OPTIONS) {
      add_header Access-Control-Allow-Origin $http_origin always;
      add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
      add_header Access-Control-Allow-Headers "Content-Type, Authorization, Baggage, Sentry-Trace" always;
      add_header Access-Control-Allow-Credentials "true" always;
      add_header Content-Length 0 always;
      add_header Content-Type text/plain always;
      return 204;
    }
EOF

# Insert OPTIONS handler before location block
sed -i '/location \//r /tmp/nginx_cors_options.txt' "$NGINX_CONF"

# Add CORS headers and hide backend headers in location block
sed -i '/proxy_set_header X-Forwarded-Proto/a\
    # Hide CORS headers from backend (prevent duplicates)\
    proxy_hide_header Access-Control-Allow-Origin;\
    proxy_hide_header Access-Control-Allow-Credentials;\
    proxy_hide_header Access-Control-Allow-Methods;\
    proxy_hide_header Access-Control-Allow-Headers;\
    # Add CORS headers from Nginx (single source of truth)\
    add_header Access-Control-Allow-Origin $http_origin always;\
    add_header Access-Control-Allow-Credentials "true" always;' "$NGINX_CONF"

echo "✅ CORS configuration added to $NGINX_CONF"
echo "⚠️  Please test with: docker exec icfix-nginx nginx -t"
echo "⚠️  Then reload with: docker exec icfix-nginx nginx -s reload"

