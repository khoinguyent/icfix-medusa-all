import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../modules/promotional-content"
import PromotionalContentService from "../../../modules/promotional-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService
    
    // Only fetch active service features
    const features = await promotionalContentService.listActiveServiceFeatures().catch(() => [])

    res.json({
      features: features || [],
      count: features?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching service features:", error)
    res.json({
      features: [],
      count: 0,
    })
  }
}
