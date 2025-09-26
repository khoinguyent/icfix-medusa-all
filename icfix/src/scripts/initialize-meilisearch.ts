import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function initializeMeiliSearch({ container }: ExecArgs) {
  console.log("Initializing MeiliSearch...")
  
  try {
    const { MeiliSearchService } = await import("../modules/search/meilisearch")
    const searchService = new MeiliSearchService()
    
    // Initialize the index
    await searchService.initializeIndex()
    console.log("MeiliSearch index initialized")
    
    // Get all products and index them
    const productModuleService = container.resolve(ContainerRegistrationKeys.MODULE)
    const products = await productModuleService.listProducts({}, {
      relations: ["variants", "collection", "category"]
    })
    
    console.log(`Indexing ${products.length} products...`)
    await searchService.indexProducts(products)
    
    console.log("MeiliSearch initialization completed successfully!")
    console.log(`Indexed ${products.length} products`)
    
  } catch (error) {
    console.error("Error initializing MeiliSearch:", error)
    throw error
  }
}
