import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../modules/promotional-content"
import PromotionalContentService from "../../../modules/promotional-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService
    
    // Only fetch active homepage sections
    const sections = await promotionalContentService.listActiveHomepageSections().catch(() => [])

    res.json({
      sections: sections || [],
      count: sections?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    res.json({
      sections: [],
      count: 0,
    })
  }
}
