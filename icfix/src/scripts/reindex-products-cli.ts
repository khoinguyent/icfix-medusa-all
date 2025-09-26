import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { MeiliSearchService } from "../modules/search/meilisearch"

export default async function reindexProducts({ container }: ExecArgs) {
  console.log("Starting product re-indexing...")
  
  try {
    // Initialize search service
    const searchService = new MeiliSearchService()
    await searchService.initializeIndex()
    
    // Get product service
    const productModuleService = container.resolve(Modules.PRODUCT)
    
    // Get all products
    const products = await productModuleService.listProducts()
    
    // For each product, get full details with relations
    const productsWithRelations = await Promise.all(
      products.map(async (product) => {
        return await productModuleService.retrieveProduct(product.id, {
          relations: [
            "variants",
            "collection",
            "categories", 
            "images"
          ]
        })
      })
    )
    
    console.log(`Found ${productsWithRelations.length} products to index`)
    
    // Index all products
    await searchService.indexProducts(productsWithRelations)
    
    console.log("✅ Successfully re-indexed all products!")
    
    // Test search
    const testResults = await searchService.searchProducts("iPhone")
    console.log(`Test search for "iPhone" returned ${testResults.hits?.length || 0} results`)
    
  } catch (error) {
    console.error("❌ Error during re-indexing:", error)
    throw error
  }
}
