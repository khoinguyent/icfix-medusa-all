import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../modules/promotional-content"
import PromotionalContentService from "../../../modules/promotional-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService
    
    // Fetch all homepage content - only active items
    // Returns empty arrays if no data or all inactive
    const [heroBanners, sections, serviceFeatures, testimonials] = await Promise.all([
      promotionalContentService.getActiveBannersByPosition("hero").catch(() => []),
      promotionalContentService.listActiveHomepageSections().catch(() => []),
      promotionalContentService.listActiveServiceFeatures().catch(() => []),
      promotionalContentService.listActiveTestimonials().catch(() => []),
    ])

    res.json({
      hero_banners: heroBanners || [],
      homepage_sections: sections || [],
      service_features: serviceFeatures || [],
      testimonials: testimonials || [],
    })
  } catch (error) {
    console.error("Error fetching homepage content:", error)
    // Return empty arrays on error so frontend can hide sections
    res.json({
      hero_banners: [],
      homepage_sections: [],
      service_features: [],
      testimonials: [],
    })
  }
}
