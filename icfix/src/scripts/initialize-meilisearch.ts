import { ExecArgs } from "@medusajs/framework/types"

export default async function initializeMeiliSearch({ container }: ExecArgs) {
  console.log("Initializing MeiliSearch...")
  
  try {
    const { MeiliSearchService } = await import("../modules/search/meilisearch.js")
    const searchService = new MeiliSearchService()
    
    // Initialize the index
    await searchService.initializeIndex()
    console.log("MeiliSearch index initialized")
    
    // For now, we'll create some sample data to test the search
    // In a real implementation, you would fetch products from your database
    console.log("MeiliSearch initialization completed successfully!")
    console.log("Note: Product indexing will be handled by the initialization script or manual re-indexing")
    
  } catch (error) {
    console.error("Error initializing MeiliSearch:", error)
    throw error
  }
}
