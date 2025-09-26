import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
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
        // For now, we'll just log the event and handle indexing later
        // The initialization script will handle bulk indexing
        console.log(`Product ${event.name}: ${(event.data as any)?.id}`)
        break
        
      case "product.deleted":
        const productId = (event.data as any)?.id
        if (productId) {
          await searchService.deleteProduct(productId)
        }
        break
        
      case "product-variant.created":
      case "product-variant.updated":
      case "product-variant.deleted":
        // For now, we'll just log the event
        console.log(`Product variant ${event.name}: ${(event.data as any)?.id}`)
        break
    }
  } catch (error) {
    console.error(`Error in search indexer for event ${event.name}:`, error)
  }
}
