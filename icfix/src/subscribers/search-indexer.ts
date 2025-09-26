import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated", 
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted"
  ],
}

export default async function searchIndexerHandler({
  event,
  container,
}: SubscriberArgs) {
  const { MeiliSearchService } = require("../modules/search/meilisearch")
  const searchService = new MeiliSearchService()
  
  try {
    switch (event.name) {
      case "product.created":
      case "product.updated":
        const productId = (event.data as any)?.id
        if (productId) {
          console.log(`Indexing product ${event.name}: ${productId}`)
          
          // Get the full product data from the database
          const productModuleService = container.resolve("productModuleService")
          const product = await productModuleService.retrieveProduct(productId, {
            relations: [
              "variants",
              "collection",
              "categories",
              "images"
            ]
          })
          
          if (product) {
            await searchService.indexProduct(product)
            console.log(`Successfully indexed product: ${productId}`)
          }
        }
        break
        
      case "product.deleted":
        const deletedProductId = (event.data as any)?.id
        if (deletedProductId) {
          console.log(`Deleting product from search index: ${deletedProductId}`)
          await searchService.deleteProduct(deletedProductId)
          console.log(`Successfully deleted product from search: ${deletedProductId}`)
        }
        break
        
      case "product-variant.created":
      case "product-variant.updated":
      case "product-variant.deleted":
        const variantId = (event.data as any)?.id
        const productIdFromVariant = (event.data as any)?.product_id
        
        if (productIdFromVariant) {
          console.log(`Re-indexing product due to variant ${event.name}: ${productIdFromVariant}`)
          
          // Get the full product data and re-index
          const productModuleService = container.resolve("productModuleService")
          const product = await productModuleService.retrieveProduct(productIdFromVariant, {
            relations: [
              "variants",
              "collection", 
              "categories",
              "images"
            ]
          })
          
          if (product) {
            await searchService.indexProduct(product)
            console.log(`Successfully re-indexed product after variant change: ${productIdFromVariant}`)
          }
        }
        break
    }
  } catch (error) {
    console.error(`Error in search indexer for event ${event.name}:`, error)
  }
}
