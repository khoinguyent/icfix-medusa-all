import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../../modules/promotional-content"
import PromotionalContentService from "../../../../../modules/promotional-content/service"
import { UpdateServiceFeatureRequest } from "../../types"
import { triggerStorefrontRevalidation } from "../../../../../lib/revalidate-storefront"

// Get a single service feature
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    const feature = await promotionalContentService.retrieveServiceFeature(id)

    res.json({
      feature,
    })
  } catch (error) {
    console.error("Error fetching service feature:", error)
    res.status(500).json({
      message: "Failed to fetch service feature",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Update a service feature
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params
    const updateData = req.body as UpdateServiceFeatureRequest

    const feature = await promotionalContentService.updateServiceFeatures({
      id,
      ...updateData,
    } as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "service-feature.updated",
      id: feature?.id || id,
    })

    res.json({
      feature,
    })
  } catch (error) {
    console.error("Error updating service feature:", error)
    res.status(500).json({
      message: "Failed to update service feature",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Delete a service feature
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    await promotionalContentService.deleteServiceFeatures([id])

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "service-feature.deleted",
      id,
    })

    res.status(200).json({
      id,
      object: "service_feature",
      deleted: true,
    })
  } catch (error) {
    console.error("Error deleting service feature:", error)
    res.status(500).json({
      message: "Failed to delete service feature",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

