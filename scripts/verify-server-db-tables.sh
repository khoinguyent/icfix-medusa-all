#!/bin/bash

# Script to verify promotional content tables on server database
# Run this on the backend server

echo "🔍 Verifying Promotional Content Tables on Server Database..."
echo ""

# Check if we're on the server (look for icfix-postgres container)
if ! docker ps | grep -q "icfix-postgres"; then
    echo "❌ Error: icfix-postgres container not found"
    echo "   Make sure you're running this on the server with docker-compose-prod.yml"
    exit 1
fi

# Get database credentials from environment or docker-compose
POSTGRES_DB=${POSTGRES_DB:-icfix_db}
POSTGRES_USER=${POSTGRES_USER:-icfix_user}

echo "📊 Database: $POSTGRES_DB"
echo "👤 User: $POSTGRES_USER"
echo ""

# List all tables
echo "📋 Listing all tables..."
docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt" | grep -E "(promotional_banner|service_feature|testimonial|homepage_section|List of relations)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check each promotional content table
echo "✅ Checking Promotional Content Tables:"
echo ""

# 1. promotional_banner
echo "1️⃣  promotional_banner:"
if docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d promotional_banner" > /dev/null 2>&1; then
    echo "   ✓ Table exists"
    COUNT=$(docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM promotional_banner;" | xargs)
    echo "   📊 Records: $COUNT"
    docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d promotional_banner" | head -20
else
    echo "   ❌ Table does NOT exist"
fi
echo ""

# 2. service_feature
echo "2️⃣  service_feature:"
if docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d service_feature" > /dev/null 2>&1; then
    echo "   ✓ Table exists"
    COUNT=$(docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM service_feature;" | xargs)
    echo "   📊 Records: $COUNT"
    docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d service_feature" | head -15
else
    echo "   ❌ Table does NOT exist"
fi
echo ""

# 3. testimonial
echo "3️⃣  testimonial:"
if docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d testimonial" > /dev/null 2>&1; then
    echo "   ✓ Table exists"
    COUNT=$(docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM testimonial;" | xargs)
    echo "   📊 Records: $COUNT"
    docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d testimonial" | head -15
else
    echo "   ❌ Table does NOT exist"
fi
echo ""

# 4. homepage_section
echo "4️⃣  homepage_section:"
if docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d homepage_section" > /dev/null 2>&1; then
    echo "   ✓ Table exists"
    COUNT=$(docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM homepage_section;" | xargs)
    echo "   📊 Records: $COUNT"
    docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d homepage_section" | head -15
else
    echo "   ❌ Table does NOT exist"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Summary:"
echo ""

# Final verification
ALL_EXIST=true
for table in promotional_banner service_feature testimonial homepage_section; do
    if docker exec icfix-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d $table" > /dev/null 2>&1; then
        echo "   ✅ $table - EXISTS"
    else
        echo "   ❌ $table - MISSING"
        ALL_EXIST=false
    fi
done

echo ""
if [ "$ALL_EXIST" = true ]; then
    echo "🎉 All promotional content tables are present in the server database!"
else
    echo "⚠️  Some tables are missing. Run migrations:"
    echo "   docker exec icfix-backend npm run db:migrate"
fi
