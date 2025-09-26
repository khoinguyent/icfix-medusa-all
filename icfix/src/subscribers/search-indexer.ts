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
          
          // Get the product with all relations
          const productService = container.resolve("productService")
          const product = await productService.retrieveProduct(productId, {
            relations: [
              "variants",
              "variants.prices", 
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
        }
        break
        
      case "product-variant.created":
      case "product-variant.updated":
      case "product-variant.deleted":
        const variantProductId = (event.data as any)?.product_id
        if (variantProductId) {
          console.log(`Re-indexing product due to variant ${event.name}: ${variantProductId}`)
          
          // Re-index the parent product when variants change
          const productService = container.resolve("productService")
          const product = await productService.retrieveProduct(variantProductId, {
            relations: [
              "variants",
              "variants.prices",
              "collection", 
              "categories",
              "images"
            ]
          })
          
          if (product) {
            await searchService.indexProduct(product)
            console.log(`Successfully re-indexed product: ${variantProductId}`)
          }
        }
        break
    }
  } catch (error) {
    console.error(`Error in search indexer for event ${event.name}:`, error)
  }
}
