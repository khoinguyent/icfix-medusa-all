import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../modules/promotional-content"
import PromotionalContentService from "../../../modules/promotional-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService
    
    // Only fetch active testimonials
    const testimonials = await promotionalContentService.listActiveTestimonials().catch(() => [])

    res.json({
      testimonials: testimonials || [],
      count: testimonials?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    res.json({
      testimonials: [],
      count: 0,
    })
  }
}
