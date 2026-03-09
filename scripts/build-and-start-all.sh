#!/bin/bash
set -e

echo "========================================="
echo "Building and Starting All Services"
echo "========================================="

# Step 1: Build Admin
echo ""
echo "Step 1: Building Admin Bundle..."
cd /Users/123khongbiet/Documents/medusa/icfix
npm run build:admin

if [ ! -f "admin/index.html" ]; then
    echo "ERROR: Admin build failed - admin/index.html not found"
    exit 1
fi

echo "✅ Admin built successfully"

# Step 2: Start Services
echo ""
echo "Step 2: Building and starting Docker services..."
cd /Users/123khongbiet/Documents/medusa
docker-compose -f docker-compose.local.yml up -d --build

echo "✅ Services starting..."

# Step 3: Wait for backend
echo ""
echo "Step 3: Waiting for backend to be ready (30 seconds)..."
sleep 30

# Step 4: Run migrations
echo ""
echo "Step 4: Running database migrations..."
docker exec -it medusa-backend-local npx medusa db:migrate || echo "⚠️  Migrations may have already run or backend not ready yet"

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "📍 Service URLs:"
echo "  Backend:    http://localhost:9000"
echo "  Admin:      http://localhost:3001"
echo "  Storefront: http://localhost:3000"
echo ""
