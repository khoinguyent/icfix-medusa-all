import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../modules/promotional-content"
import PromotionalContentService from "../../../../modules/promotional-content/service"
import { CreateServiceFeatureRequest } from "../types"
import { triggerStorefrontRevalidation } from "../../../../lib/revalidate-storefront"

// List all service features
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const isActiveParam = req.query.is_active
    const isActive = isActiveParam !== undefined
      ? (typeof isActiveParam === "string" ? isActiveParam === "true" : Boolean(isActiveParam))
      : undefined

    const features = await promotionalContentService.listServiceFeatures(
      isActive !== undefined ? { is_active: isActive } : {},
      {
        order: { display_order: "ASC" },
      }
    )

    res.json({
      features: features || [],
      count: features?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching service features:", error)
    res.status(500).json({
      message: "Failed to fetch service features",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Create a new service feature
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const featureData = req.body as CreateServiceFeatureRequest

    // Validate required fields
    if (!featureData?.title) {
      return res.status(400).json({
        message: "Missing required field: title",
      })
    }

    const feature = await promotionalContentService.createServiceFeatures(featureData as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "service-feature.created",
      id: feature?.id,
    })

    res.status(201).json({
      feature,
    })
  } catch (error) {
    console.error("Error creating service feature:", error)
    res.status(500).json({
      message: "Failed to create service feature",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

