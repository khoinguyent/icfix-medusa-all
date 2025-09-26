import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework"

export default async function indexProducts({ container }: ExecArgs) {
  console.log("Starting product indexing...")
  
  try {
    const { MeiliSearchService } = await import("../modules/search/meilisearch.js")
    const searchService = new MeiliSearchService()
    
    // Initialize the index first
    await searchService.initializeIndex()
    console.log("MeiliSearch index initialized")
    
    // Get product service
    const productService = container.resolve(ContainerRegistrationKeys.PRODUCT_SERVICE)
    
    // Fetch all products with their variants, collections, and categories
    const products = await productService.listProducts({
      relations: [
        "variants",
        "variants.prices",
        "collection",
        "categories",
        "images"
      ]
    })
    
    console.log(`Found ${products.length} products to index`)
    
    if (products.length > 0) {
      // Index all products
      await searchService.indexProducts(products)
      console.log(`Successfully indexed ${products.length} products`)
      
      // Verify indexing by doing a test search
      const testResults = await searchService.searchProducts("test", { limit: 1 })
      console.log(`Test search returned ${testResults.totalHits} results`)
    } else {
      console.log("No products found to index")
    }
    
    console.log("Product indexing completed successfully!")
    
  } catch (error) {
    console.error("Error indexing products:", error)
    throw error
  }
}
