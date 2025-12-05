#!/bin/bash

# Manual reindexing script for current deployment
echo "🔍 Manual Meilisearch reindexing..."

# Set environment variables
export MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY:-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6}
export PUBLISHABLE_KEY=${PUBLISHABLE_KEY:-pk_53afd5ff50ddf33cabde30f87e3e60474d68c56ece5e340cc0fd22abaef5c59c}

if [ -z "$PUBLISHABLE_KEY" ]; then
  echo "❌ PUBLISHABLE_KEY is not set. Export PUBLISHABLE_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY."
  echo "   Example: PUBLISHABLE_KEY=pk_xxx ./scripts/manual-reindex.sh"
  exit 1
fi

# Check if Meilisearch is running
echo "📡 Checking Meilisearch status..."
if ! curl -s "http://localhost:7700/health" > /dev/null; then
    echo "❌ Meilisearch is not running. Please start the services first."
    exit 1
fi

# Initialize index if it doesn't exist
echo "🔧 Initializing Meilisearch index..."
INDEX_TASK=$(curl -s -X POST "http://localhost:7700/indexes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"uid": "products", "primaryKey": "id"}')
echo "$INDEX_TASK" | jq .

wait_for_task() {
  local task_id=$1
  local timeout=${2:-60}
  local waited=0
  while [ $waited -lt $timeout ]; do
    status=$(curl -s -H "Authorization: Bearer $MEILISEARCH_API_KEY" "http://localhost:7700/tasks/$task_id" | jq -r '.status')
    if [ "$status" = "succeeded" ]; then
      return 0
    fi
    if [ "$status" = "failed" ]; then
      echo "❌ Task $task_id failed" >&2
      return 1
    fi
    sleep 1
    waited=$((waited+1))
  done
  echo "⚠️  Timed out waiting for task $task_id" >&2
  return 1
}

# Wait for index creation if we received a taskUid
IDX_TASK_ID=$(echo "$INDEX_TASK" | jq -r '.taskUid // empty')
if [ -n "$IDX_TASK_ID" ]; then
  wait_for_task "$IDX_TASK_ID" 30 || true
fi

# Configure searchable attributes
echo "⚙️  Configuring searchable attributes..."
SA_TASK=$(curl -s -X PATCH "http://localhost:7700/indexes/products/settings/searchable-attributes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '["title", "description", "handle", "variant_sku", "variant_title", "collection_title", "category_title"]')
echo "$SA_TASK" | jq .
SA_TASK_ID=$(echo "$SA_TASK" | jq -r '.taskUid // empty')
if [ -n "$SA_TASK_ID" ]; then
  wait_for_task "$SA_TASK_ID" 30 || true
fi

# Configure displayed attributes
echo "📋 Configuring displayed attributes..."
DA_TASK=$(curl -s -X PATCH "http://localhost:7700/indexes/products/settings/displayed-attributes" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d '["id", "title", "description", "handle", "thumbnail", "variants", "collection", "category"]')
echo "$DA_TASK" | jq .
DA_TASK_ID=$(echo "$DA_TASK" | jq -r '.taskUid // empty')
if [ -n "$DA_TASK_ID" ]; then
  wait_for_task "$DA_TASK_ID" 30 || true
fi

# Get products from Medusa API (try Nginx HTTPS, then HTTP, then direct backend)
echo "📦 Fetching products from Medusa API..."

HOST_HEADER_OPT=""
if [ -n "$HOST_HEADER" ]; then
  HOST_HEADER_OPT=(-H "Host: $HOST_HEADER")
fi

RAW_RESP=""

# 1) Try HTTPS via Nginx
if RAW_RESP=$(curl -sS -L -k "https://127.0.0.1/store/products?limit=200" -H "x-publishable-api-key: $PUBLISHABLE_KEY" "${HOST_HEADER_OPT[@]}" 2>/dev/null); then
  :
fi

# 2) If empty, try HTTP via Nginx
if [ -z "$RAW_RESP" ] || ! echo "$RAW_RESP" | jq -e '.' >/dev/null 2>&1; then
  RAW_RESP=$(curl -sS -L "http://127.0.0.1/store/products?limit=200" -H "x-publishable-api-key: $PUBLISHABLE_KEY" "${HOST_HEADER_OPT[@]}" 2>/dev/null)
fi

# 3) If still empty, try direct backend (node fetch) inside container
if [ -z "$RAW_RESP" ] || ! echo "$RAW_RESP" | jq -e '.' >/dev/null 2>&1; then
  echo "⚠️  Falling back to querying inside backend container..."
  RAW_RESP=$(docker exec icfix-backend node -e "fetch('http://localhost:9000/store/products?limit=200',{headers:{'x-publishable-api-key':'$PUBLISHABLE_KEY'}}).then(r=>r.json()).then(j=>console.log(JSON.stringify(j))).catch(()=>{})" 2>/dev/null)
fi

# Debug: if jq fails, show first 200 chars of response
if ! echo "$RAW_RESP" | jq -e '.' >/dev/null 2>&1; then
  echo "⚠️  Response is not valid JSON. First 200 chars:"
  echo "$RAW_RESP" | head -c 200; echo
fi

PRODUCTS=$(echo "$RAW_RESP" | jq '.products // []' 2>/dev/null || echo '[]')
PRODUCT_COUNT=$(echo "$PRODUCTS" | jq 'length // 0')
echo "Found ${PRODUCT_COUNT} products to index"

# Transform products for Meilisearch (avoid jq optional chaining to support older versions)
echo "🔄 Transforming products for Meilisearch..."
TRANSFORMED_PRODUCTS=$(echo "$PRODUCTS" | jq '[.[] | {
    id: .id,
    title: .title,
    description: (.description // ""),
    handle: .handle,
    thumbnail: (.thumbnail // ""),
    created_at: .created_at,
    updated_at: .updated_at,
    variants: ((.variants // []) | map({
        id: .id,
        sku: (.sku // ""),
        title: (.title // ""),
        price: ((.calculated_price // {}) | .calculated_amount // 0),
        inventory_quantity: (.inventory_quantity // 0)
    })),
    variant_sku: ((.variants // []) | map(.sku // "") | join(" ")),
    variant_title: ((.variants // []) | map(.title // "") | join(" ")),
    variant_price: ((.variants // []) | map(((.calculated_price // {}) | .calculated_amount // 0))),
    variant_inventory_quantity: ((.variants // []) | map(.inventory_quantity // 0)),
    collection: (if (.collection // null) then {
        id: .collection.id,
        title: .collection.title,
        handle: .collection.handle
    } else null end),
    collection_id: ((.collection // {}) | .id // null),
    collection_title: ((.collection // {}) | .title // ""),
    category: (if ((.categories // []) | length) > 0 then {
        id: ((.categories // [])[0] | .id // null),
        title: ((.categories // [])[0] | .name // ""),
        handle: ((.categories // [])[0] | .handle // "")
    } else null end),
    category_id: ((.categories // [])[0] | .id // null),
    category_title: ((.categories // [])[0] | .name // "")
}]')

# Index products
echo "📊 Indexing products to Meilisearch..."
ADD_TASK=$(curl -s -X POST "http://localhost:7700/indexes/products/documents" \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
     -H "Content-Type: application/json" \
     -d "$TRANSFORMED_PRODUCTS")
echo "$ADD_TASK" | jq .
ADD_TASK_ID=$(echo "$ADD_TASK" | jq -r '.taskUid // empty')
if [ -n "$ADD_TASK_ID" ]; then
  echo "⏳ Waiting for documents to be indexed..."
  wait_for_task "$ADD_TASK_ID" 60 || true
fi

# Test search
echo "🧪 Testing search functionality..."
# SEARCH_RESULTS=$(curl -s -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
#      "http://localhost:7700/indexes/products/search" \
#      -H "Content-Type: application/json" \
#      -d '{"q": "iPhone", "limit": 3}' | jq '.hits | length')

# if [ "$SEARCH_RESULTS" -eq 0 ] 2>/dev/null; then
ALT_RESULTS=$(curl -s -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
    "http://localhost:7700/indexes/products/search" \
    -H "Content-Type: application/json" \
    -d '{"q": "laptop", "limit": 3}' | jq '.hits | length')
echo "🔎 Fallback search for 'laptop' returned $ALT_RESULTS results"
# fi

echo "✅ Reindexing complete!"
echo "🔍 Test search for 'laptop' returned $SEARCH_RESULTS results"

if [ "$SEARCH_RESULTS" -gt 0 ]; then
    echo "🎉 Search is working correctly!"
else
    echo "⚠️  Search returned no results. Check your data and Meilisearch configuration."
fi
