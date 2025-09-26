#!/bin/bash

# Manual reindexing script for current deployment
echo "🔍 Manual Meilisearch reindexing..."

# Set environment variables
export MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY:-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6}

# Check if Meilisearch is running
echo "📡 Checking Meilisearch status..."
if ! curl -s "http://localhost:7700/health" > /dev/null; then
    echo "❌ Meilisearch is not running. Please start the services first."
    exit 1
fi

# Initialize index if it doesn't exist
echo "🔧 Initializing Meilisearch index..."
curl -X POST "http://localhost:7700/indexes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"uid": "products", "primaryKey": "id"}' \
     -s | jq .

# Configure searchable attributes
echo "⚙️  Configuring searchable attributes..."
curl -X PATCH "http://localhost:7700/indexes/products/settings/searchable-attributes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '["title", "description", "handle", "variant_sku", "variant_title", "collection_title", "category_title"]' \
     -s | jq .

# Configure displayed attributes
echo "📋 Configuring displayed attributes..."
curl -X PATCH "http://localhost:7700/indexes/products/settings/displayed-attributes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '["id", "title", "description", "handle", "thumbnail", "variants", "collection", "category"]' \
     -s | jq .

# Get products from Medusa API
echo "📦 Fetching products from Medusa API..."
PRODUCTS=$(curl -s "http://localhost:9002/store/products?limit=100" | jq '.products // []')

if [ "$PRODUCTS" = "[]" ] || [ "$PRODUCTS" = "null" ]; then
    echo "⚠️  No products found via store API. Trying admin API..."
    # Try admin API if store API doesn't work
    PRODUCTS=$(curl -s "http://localhost:9002/admin/products?limit=100" | jq '.products // []')
fi

PRODUCT_COUNT=$(echo "$PRODUCTS" | jq 'length')
echo "Found $PRODUCT_COUNT products to index"

if [ "$PRODUCT_COUNT" -eq 0 ]; then
    echo "❌ No products found. Please check your Medusa API."
    exit 1
fi

# Transform products for Meilisearch
echo "🔄 Transforming products for Meilisearch..."
TRANSFORMED_PRODUCTS=$(echo "$PRODUCTS" | jq '[.[] | {
    id: .id,
    title: .title,
    description: .description // "",
    handle: .handle,
    thumbnail: .thumbnail // "",
    created_at: .created_at,
    updated_at: .updated_at,
    variants: (.variants // [] | map({
        id: .id,
        sku: .sku // "",
        title: .title // "",
        price: .calculated_price?.calculated_amount // 0,
        inventory_quantity: .inventory_quantity // 0
    })),
    variant_sku: (.variants // [] | map(.sku) | join(" ")),
    variant_title: (.variants // [] | map(.title) | join(" ")),
    variant_price: (.variants // [] | map(.calculated_price?.calculated_amount // 0)),
    variant_inventory_quantity: (.variants // [] | map(.inventory_quantity // 0)),
    collection: (if .collection then {
        id: .collection.id,
        title: .collection.title,
        handle: .collection.handle
    } else null end),
    collection_id: .collection?.id,
    collection_title: .collection?.title // "",
    category: (if .categories and (.categories | length) > 0 then {
        id: .categories[0].id,
        title: .categories[0].name,
        handle: .categories[0].handle
    } else null end),
    category_id: .categories?[0]?.id,
    category_title: .categories?[0]?.name // ""
}]')

# Index products
echo "📊 Indexing products to Meilisearch..."
curl -X POST "http://localhost:7700/indexes/products/documents" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d "$TRANSFORMED_PRODUCTS" \
     -s | jq .

# Test search
echo "🧪 Testing search functionality..."
SEARCH_RESULTS=$(curl -s -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     "http://localhost:7700/indexes/products/search" \
     -H "Content-Type: application/json" \
     -d '{"q": "iPhone", "limit": 3}' | jq '.hits | length')

echo "✅ Reindexing complete!"
echo "🔍 Test search for 'iPhone' returned $SEARCH_RESULTS results"

if [ "$SEARCH_RESULTS" -gt 0 ]; then
    echo "🎉 Search is working correctly!"
else
    echo "⚠️  Search returned no results. Check your data and Meilisearch configuration."
fi
