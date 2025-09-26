import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MeiliSearchService } from "../modules/search/meilisearch"

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
  const searchService = new MeiliSearchService()
  
  try {
    switch (event.name) {
      case "product.created":
      case "product.updated":
        // Get the full product with variants, collection, and category
        const productModuleService = container.resolve(ContainerRegistrationKeys.MODULE)
        const product = await productModuleService.retrieveProduct(event.data.id, {
          relations: ["variants", "collection", "category"]
        })
        
        await searchService.indexProduct(product)
        break
        
      case "product.deleted":
        await searchService.deleteProduct(event.data.id)
        break
        
      case "product-variant.created":
      case "product-variant.updated":
      case "product-variant.deleted":
        // When variants change, re-index the parent product
        const variantModuleService = container.resolve(ContainerRegistrationKeys.MODULE)
        const variant = await variantModuleService.retrieveProductVariant(event.data.id, {
          relations: ["product"]
        })
        
        const productModuleService2 = container.resolve(ContainerRegistrationKeys.MODULE)
        const fullProduct = await productModuleService2.retrieveProduct(variant.product_id, {
          relations: ["variants", "collection", "category"]
        })
        
        await searchService.indexProduct(fullProduct)
        break
    }
  } catch (error) {
    console.error(`Error in search indexer for event ${event.name}:`, error)
  }
}
