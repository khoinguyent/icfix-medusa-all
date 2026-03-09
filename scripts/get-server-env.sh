#!/bin/bash

# Get server .env configuration and propose local version

# Load server credentials
if [ -f "scripts/.env" ]; then
    source scripts/.env
else
    echo "Error: scripts/.env not found"
    exit 1
fi

SERVER_IP="${SERVER_IP:-116.118.48.209}"
SERVER_USER="${SERVER_USER:-root}"

echo "========================================="
echo "  Fetching Server .env Configuration"
echo "========================================="
echo ""

# Fetch .env file from server
echo "Fetching .env from server..."
ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "cd /root/icfix-medusa && cat .env 2>/dev/null" > /tmp/server-env.txt 2>&1

if [ ! -s /tmp/server-env.txt ]; then
    echo "Error: Could not fetch .env file from server"
    exit 1
fi

echo "✅ Server .env fetched successfully"
echo ""

# Extract environment variable names (excluding database)
echo "=== Environment Variables Found (excluding database) ==="
echo ""
grep -v "^#" /tmp/server-env.txt | grep -v "^$" | grep -v -E "^(DATABASE_URL|POSTGRES_|DB_)" | cut -d= -f1 | sort | while read var; do
    echo "  - $var"
done

echo ""
echo "=== Proposing Local .env Configuration ==="
echo ""

# Create local .env proposal
cat > /tmp/local-env-proposal.txt << 'EOF'
# ===========================================
# Local Development Environment Variables
# Based on server configuration (excluding database)
# ===========================================

# Node Environment
NODE_ENV=development

# ===========================================
# Database Configuration (LOCAL - Different from server)
# ===========================================
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medusa
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_URL=redis://redis:6379

# ===========================================
# MeiliSearch Configuration
# ===========================================
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=masterKey
MEILISEARCH_ENV=development

# ===========================================
# Medusa Security Configuration
# ===========================================
EOF

# Extract non-database values from server
grep -v "^#" /tmp/server-env.txt | grep -v "^$" | grep -v -E "^(DATABASE_URL|POSTGRES_|DB_)" | while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Mask sensitive values but show structure
        case "$key" in
            *SECRET*|*PASSWORD*|*KEY*|*TOKEN*|*ACCESS*)
                echo "$key=***USE_SERVER_VALUE***" >> /tmp/local-env-proposal.txt
                ;;
            *CORS*|*URL*|*ENDPOINT*|*HOST*)
                # Show structure but use localhost
                local_value=$(echo "$value" | sed 's|https://icfix\.duckdns\.org|http://localhost:9000|g' | sed 's|https://store\.icfix\.vn|http://localhost:3000|g' | sed 's|https://admin\.icfix\.vn|http://localhost:3001|g')
                echo "$key=$local_value" >> /tmp/local-env-proposal.txt
                ;;
            *)
                echo "$key=$value" >> /tmp/local-env-proposal.txt
                ;;
        esac
    fi
done

cat /tmp/local-env-proposal.txt
echo ""
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""
echo "1. Review the proposed .env above"
echo "2. Copy server values for secrets (JWT_SECRET, COOKIE_SECRET, etc.)"
echo "3. Update CORS URLs to use localhost"
echo "4. Update R2/Storage URLs if needed for local development"
echo ""
echo "Full server .env saved to: /tmp/server-env.txt"

