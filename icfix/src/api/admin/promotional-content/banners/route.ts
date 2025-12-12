import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../modules/promotional-content"
import PromotionalContentService from "../../../../modules/promotional-content/service"
import { CreateBannerRequest } from "../types"
import { triggerStorefrontRevalidation } from "../../../../lib/revalidate-storefront"

// List all banners
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const position = req.query.position as string | undefined
    const isActiveParam = req.query.is_active
    const isActive = isActiveParam !== undefined
      ? (typeof isActiveParam === "string" ? isActiveParam === "true" : Boolean(isActiveParam))
      : undefined // Admin can see all, not just active

    const banners = await promotionalContentService.listBanners({
      position,
      is_active: isActive,
    })

    res.json({
      banners: banners || [],
      count: banners?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    res.status(500).json({
      message: "Failed to fetch banners",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Create a new banner
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const bannerData = req.body as CreateBannerRequest

    // Validate required fields
    if (!bannerData?.title || !bannerData?.image_url || !bannerData?.position) {
      return res.status(400).json({
        message: "Missing required fields: title, image_url, position",
      })
    }

    const banner = await promotionalContentService.createPromotionalBanners(bannerData as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "promotional-banner.created",
      position: bannerData.position,
      id: banner?.id,
    })

    res.status(201).json({
      banner,
    })
  } catch (error) {
    console.error("Error creating banner:", error)
    res.status(500).json({
      message: "Failed to create banner",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

