#!/bin/bash

# Script to check backend server configuration for revalidation
# Usage: ./scripts/check-backend-config.sh

SERVER_IP="116.118.48.209"
SERVER_USER="root"

echo "======================================"
echo "Backend Server Configuration Check"
echo "======================================"
echo "Server: $SERVER_USER@$SERVER_IP"
echo ""

# Check if we can connect
echo "1. Testing SSH connection..."
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "echo 'Connected'" > /dev/null 2>&1; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ Cannot connect to server"
    echo "   Please check:"
    echo "   - Server is accessible: ping $SERVER_IP"
    echo "   - SSH port 22 is open"
    echo "   - Credentials are correct"
    exit 1
fi

echo ""
echo "2. Checking Docker containers..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    echo "   Docker containers:"
    docker ps --format "   - {{.Names}}: {{.Status}}" 2>/dev/null || echo "   ❌ Docker not running"
ENDSSH

echo ""
echo "3. Checking backend container environment variables..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    if docker ps | grep -q "icfix-backend\|medusa-backend"; then
        CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "icfix-backend|medusa-backend" | head -1)
        echo "   Container: $CONTAINER"
        echo ""
        echo "   REVALIDATE_ENDPOINT:"
        docker exec "$CONTAINER" env | grep REVALIDATE_ENDPOINT || echo "   ❌ Not set"
        echo ""
        echo "   REVALIDATE_SECRET:"
        docker exec "$CONTAINER" env | grep REVALIDATE_SECRET | sed 's/=.*/=***HIDDEN***/' || echo "   ❌ Not set"
        echo ""
        echo "   WEBHOOK_TARGET_BASE:"
        docker exec "$CONTAINER" env | grep WEBHOOK_TARGET_BASE || echo "   ❌ Not set"
    else
        echo "   ❌ Backend container not found"
    fi
ENDSSH

echo ""
echo "4. Checking backend logs for revalidation activity..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "icfix-backend|medusa-backend" | head -1)
    if [ -n "$CONTAINER" ]; then
        echo "   Recent revalidation logs (last 20 lines):"
        docker logs "$CONTAINER" 2>&1 | grep -i "revalidate" | tail -5 || echo "   No revalidation logs found"
    fi
ENDSSH

echo ""
echo "5. Checking if subscriber file exists..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "icfix-backend|medusa-backend" | head -1)
    if [ -n "$CONTAINER" ]; then
        if docker exec "$CONTAINER" test -f "/app/src/subscribers/vercel-revalidate.ts" 2>/dev/null; then
            echo "   ✅ Subscriber file exists"
        else
            echo "   ❌ Subscriber file not found"
        fi
    fi
ENDSSH

echo ""
echo "6. Testing backend health endpoint..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    if curl -sf http://localhost:9000/health > /dev/null 2>&1; then
        echo "   ✅ Backend health check passed"
        curl -s http://localhost:9000/health | head -1
    else
        echo "   ❌ Backend health check failed"
    fi
ENDSSH

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "To connect to server:"
echo "  ssh icfix-backend"
echo "  or"
echo "  ssh root@116.118.48.209"
echo ""
echo "To check backend logs:"
echo "  ssh icfix-backend 'docker logs -f icfix-backend'"
echo ""
echo "To check environment variables:"
echo "  ssh icfix-backend 'docker exec icfix-backend env | grep REVALIDATE'"

