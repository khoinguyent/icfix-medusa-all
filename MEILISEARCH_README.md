# MeiliSearch Integration for Medusa v2

This implementation provides a custom MeiliSearch integration for Medusa v2, since the official MeiliSearch plugin is only compatible with Medusa v1.

## Features

- **Full-text search** with typo tolerance
- **Real-time indexing** of products when created, updated, or deleted
- **Advanced filtering** by collection, category, price, and inventory
- **Sorting** by creation date, update date, and price
- **Search API** endpoint for storefront integration
- **Automatic product indexing** via event subscribers

## Setup

### 1. Start MeiliSearch Server

```bash
# Using Docker (recommended)
docker run -it --rm -p 7700:7700 -e MEILI_MASTER_KEY=masterKey getmeili/meilisearch:latest

# Or install locally
curl -L https://install.meilisearch.com | sh
./meilisearch --master-key=masterKey
```

### 2. Environment Variables

Add these environment variables to your `.env` file:

```bash
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### 3. Initialize Search Index

Run the initialization script to create the index and populate it with existing products:

```bash
npm run init-search
```

### 4. Start the Application

```bash
npm run dev
```

## API Endpoints

### Search Products

**POST/GET** `/store/search`

**Request Body:**
```json
{
  "q": "search query",
  "limit": 20,
  "offset": 0,
  "filters": "collection_id=123",
  "sort": ["created_at:desc"]
}
```

**Response:**
```json
{
  "hits": [
    {
      "id": "prod_123",
      "title": "Product Title",
      "description": "Product description",
      "handle": "product-handle",
      "thumbnail": "https://...",
      "variants": [...],
      "collection": {...},
      "category": {...}
    }
  ],
  "totalHits": 25,
  "query": "search query",
  "limit": 20,
  "offset": 0
}
```

## Search Configuration

The search index is configured with:

- **Searchable attributes**: title, description, handle, variant_sku, variant_title, collection_title, category_title
- **Displayed attributes**: id, title, description, handle, thumbnail, variants, collection, category
- **Filterable attributes**: collection_id, category_id, variant_price, variant_inventory_quantity
- **Sortable attributes**: created_at, updated_at, variant_price

## Storefront Integration

The storefront includes:

- **Search input** in the navigation header
- **Search results** component with product cards
- **Search in results** component for filtering within categories
- **Automatic search** when query parameter `q` is present

## File Structure

```
src/
├── modules/search/
│   └── meilisearch.ts          # MeiliSearch service
├── api/store/search/
│   └── route.ts                # Search API endpoint
├── subscribers/
│   └── search-indexer.ts       # Product indexing subscriber
└── scripts/
    └── initialize-meilisearch.ts # Index initialization script
```

## Customization

### Adding More Searchable Fields

Edit the `transformProductForSearch` method in `src/modules/search/meilisearch.ts`:

```typescript
private transformProductForSearch(product: any) {
  return {
    // ... existing fields
    tags: product.tags?.map(tag => tag.value).join(" ") || "",
    // Add more fields as needed
  }
}
```

Then update the searchable attributes in `initializeIndex()`:

```typescript
await this.client.index(this.indexName).updateSearchableAttributes([
  "title",
  "description", 
  "handle",
  "variant_sku",
  "tags", // Add new field
  // ... other fields
])
```

### Custom Filtering

Add custom filters in the search API:

```typescript
// In route.ts
const searchOptions = {
  filters: `collection_id=${collectionId} AND variant_price >= ${minPrice}`,
  // ... other options
}
```

## Troubleshooting

### MeiliSearch Connection Issues

1. Ensure MeiliSearch server is running on the correct port
2. Check environment variables are set correctly
3. Verify network connectivity between Medusa and MeiliSearch

### Search Not Working

1. Run `npm run init-search` to reinitialize the index
2. Check the subscriber is working by creating/updating a product
3. Verify the search API endpoint is accessible

### Performance Issues

1. Consider pagination for large result sets
2. Optimize searchable attributes to only include necessary fields
3. Use filters to reduce search scope when possible

## License

This implementation is provided as-is for educational and development purposes.
