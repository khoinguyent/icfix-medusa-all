import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../../modules/promotional-content"
import PromotionalContentService from "../../../../../modules/promotional-content/service"
import { UpdateBannerRequest } from "../../types"
import { triggerStorefrontRevalidation } from "../../../../../lib/revalidate-storefront"

// Get a single banner
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    const banner = await promotionalContentService.retrievePromotionalBanner(id)

    res.json({
      banner,
    })
  } catch (error) {
    console.error("Error fetching banner:", error)
    res.status(500).json({
      message: "Failed to fetch banner",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Update a banner
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params
    const updateData = req.body as UpdateBannerRequest

    const banner = await promotionalContentService.updatePromotionalBanners({
      id,
      ...updateData,
    } as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "promotional-banner.updated",
      position: updateData.position || banner?.position,
      id: banner?.id || id,
    })

    res.json({
      banner,
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    res.status(500).json({
      message: "Failed to update banner",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Delete a banner
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    // Get banner before deletion to get position for revalidation
    let bannerPosition: string | undefined
    try {
      const banner = await promotionalContentService.retrievePromotionalBanner(id)
      bannerPosition = banner?.position
    } catch (error) {
      // Ignore error if banner doesn't exist
    }

    await promotionalContentService.deletePromotionalBanners([id])

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "promotional-banner.deleted",
      position: bannerPosition,
      id,
    })

    res.status(200).json({
      id,
      object: "banner",
      deleted: true,
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    res.status(500).json({
      message: "Failed to delete banner",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

