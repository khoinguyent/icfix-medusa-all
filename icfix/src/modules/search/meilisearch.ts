export class MeiliSearchService {
  private client: any
  private indexName: string = "products"
  private MeiliSearch: any

  constructor() {
    // Initialize client will be done in async method
  }

  private async initializeClient() {
    if (!this.client) {
      const { MeiliSearch } = await import("meilisearch")
      this.MeiliSearch = MeiliSearch
      
      const host = process.env.MEILISEARCH_HOST || "http://localhost:7700"
      const apiKey = process.env.MEILISEARCH_API_KEY || "masterKey"
      
      this.client = new MeiliSearch({
        host,
        apiKey,
      })
    }
    return this.client
  }

  async initializeIndex() {
    try {
      const client = await this.initializeClient()
      
      // Check if index exists, if not create it
      const indexes = await client.getIndexes()
      const indexExists = indexes.results.some(index => index.uid === this.indexName)
      
      if (!indexExists) {
        await client.createIndex(this.indexName, {
          primaryKey: "id"
        })
        
        // Configure searchable attributes
        await client.index(this.indexName).updateSearchableAttributes([
          "title",
          "description", 
          "handle",
          "variant_sku",
          "variant_title",
          "collection_title",
          "category_title"
        ])
        
        // Configure displayed attributes
        await client.index(this.indexName).updateDisplayedAttributes([
          "id",
          "title",
          "description",
          "handle",
          "thumbnail",
          "variants",
          "collection",
          "category"
        ])
        
        // Configure filterable attributes
        await client.index(this.indexName).updateFilterableAttributes([
          "collection_id",
          "category_id",
          "variant_price",
          "variant_inventory_quantity"
        ])
        
        // Configure sortable attributes
        await client.index(this.indexName).updateSortableAttributes([
          "created_at",
          "updated_at",
          "variant_price"
        ])
      }
    } catch (error) {
      console.error("Error initializing MeiliSearch index:", error)
    }
  }

  async indexProduct(product: any) {
    try {
      const client = await this.initializeClient()
      const searchableProduct = this.transformProductForSearch(product)
      await client.index(this.indexName).addDocuments([searchableProduct])
    } catch (error) {
      console.error("Error indexing product:", error)
    }
  }

  async indexProducts(products: any[]) {
    try {
      const client = await this.initializeClient()
      const searchableProducts = products.map(product => this.transformProductForSearch(product))
      await client.index(this.indexName).addDocuments(searchableProducts)
    } catch (error) {
      console.error("Error indexing products:", error)
    }
  }

  async deleteProduct(productId: string) {
    try {
      const client = await this.initializeClient()
      await client.index(this.indexName).deleteDocument(productId)
    } catch (error) {
      console.error("Error deleting product from search:", error)
    }
  }

  async searchProducts(query: string, options: any = {}) {
    try {
      const client = await this.initializeClient()
      const searchOptions: any = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        sort: options.sort || [],
        ...options
      }
      
      // Only add filter if it's not empty and not an empty string
      if (options.filters && options.filters.trim() !== "") {
        searchOptions.filter = options.filters
      }
      
      const results = await client.index(this.indexName).search(query, searchOptions)
      return results
    } catch (error) {
      console.error("Error searching products:", error)
      return { hits: [], totalHits: 0 }
    }
  }

  private transformProductForSearch(product: any) {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      thumbnail: product.thumbnail,
      created_at: product.created_at,
      updated_at: product.updated_at,
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        price: variant.price,
        inventory_quantity: variant.inventory_quantity
      })) || [],
      variant_sku: product.variants?.map((v: any) => v.sku).join(" ") || "",
      variant_title: product.variants?.map((v: any) => v.title).join(" ") || "",
      variant_price: product.variants?.map((v: any) => v.price) || [],
      variant_inventory_quantity: product.variants?.map((v: any) => v.inventory_quantity) || [],
      collection: product.collection ? {
        id: product.collection.id,
        title: product.collection.title,
        handle: product.collection.handle
      } : null,
      collection_id: product.collection?.id || null,
      collection_title: product.collection?.title || "",
      category: product.category ? {
        id: product.category.id,
        title: product.category.title,
        handle: product.category.handle
      } : null,
      category_id: product.category?.id || null,
      category_title: product.category?.title || ""
    }
  }
}
