import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../../modules/promotional-content"
import PromotionalContentService from "../../../../../modules/promotional-content/service"
import { UpdateHomepageSectionRequest } from "../../types"
import { triggerStorefrontRevalidation } from "../../../../../lib/revalidate-storefront"

// Get a single homepage section
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    const section = await promotionalContentService.retrieveHomepageSection(id)

    res.json({
      section,
    })
  } catch (error) {
    console.error("Error fetching homepage section:", error)
    res.status(500).json({
      message: "Failed to fetch homepage section",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Update a homepage section
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params
    const updateData = req.body as UpdateHomepageSectionRequest

    const section = await promotionalContentService.updateHomepageSections({
      id,
      ...updateData,
    } as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "homepage-section.updated",
      id: section?.id || id,
    })

    res.json({
      section,
    })
  } catch (error) {
    console.error("Error updating homepage section:", error)
    res.status(500).json({
      message: "Failed to update homepage section",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Delete a homepage section
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    await promotionalContentService.deleteHomepageSections([id])

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "homepage-section.deleted",
      id,
    })

    res.status(200).json({
      id,
      object: "homepage_section",
      deleted: true,
    })
  } catch (error) {
    console.error("Error deleting homepage section:", error)
    res.status(500).json({
      message: "Failed to delete homepage section",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

