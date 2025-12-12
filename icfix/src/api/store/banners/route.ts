import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../modules/promotional-content"
import PromotionalContentService from "../../../modules/promotional-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService
    
    const position = req.query.position as string | undefined
    const isActiveParam = req.query.is_active
    const isActive = isActiveParam !== undefined 
      ? (typeof isActiveParam === "string" ? isActiveParam === "true" : Boolean(isActiveParam))
      : true // Default to only active banners

    let banners
    if (position) {
      banners = await promotionalContentService.getActiveBannersByPosition(position).catch(() => [])
    } else {
      banners = await promotionalContentService.listBanners({
        position: position,
        is_active: isActive,
      }).catch(() => [])
    }

    res.json({
      banners: banners || [],
      count: banners?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    res.json({
      banners: [],
      count: 0,
    })
  }
}
