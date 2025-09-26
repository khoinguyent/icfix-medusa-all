#!/usr/bin/env ts-node

import { MedusaApp } from "@medusajs/framework"
import { MeiliSearchService } from "../modules/search/meilisearch"

async function reindexProducts() {
  console.log("Starting product re-indexing...")
  
  try {
    // Initialize Medusa app
    const { container } = await MedusaApp({
      workingDirectory: __dirname + "/../..",
    })
    
    // Initialize search service
    const searchService = new MeiliSearchService()
    await searchService.initializeIndex()
    
    // Get product service
    const productModuleService = container.resolve("productModuleService")
    
    // Get all products with relations
    const products = await productModuleService.listProducts({
      relations: [
        "variants",
        "collection",
        "categories", 
        "images"
      ]
    })
    
    console.log(`Found ${products.length} products to index`)
    
    // Index all products
    await searchService.indexProducts(products)
    
    console.log("✅ Successfully re-indexed all products!")
    
    // Test search
    const testResults = await searchService.searchProducts("iPhone")
    console.log(`Test search for "iPhone" returned ${testResults.hits?.length || 0} results`)
    
  } catch (error) {
    console.error("❌ Error during re-indexing:", error)
    process.exit(1)
  }
  
  process.exit(0)
}

reindexProducts()
