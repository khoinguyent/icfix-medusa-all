import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../modules/promotional-content"
import PromotionalContentService from "../../../../modules/promotional-content/service"
import { CreateHomepageSectionRequest } from "../types"
import { triggerStorefrontRevalidation } from "../../../../lib/revalidate-storefront"

// List all homepage sections
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

    const sections = await promotionalContentService.listHomepageSections(
      isActive !== undefined ? { is_active: isActive } : {},
      {
        order: { display_order: "ASC" },
      }
    )

    res.json({
      sections: sections || [],
      count: sections?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    res.status(500).json({
      message: "Failed to fetch homepage sections",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Create a new homepage section
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const sectionData = req.body as CreateHomepageSectionRequest

    // Validate required fields
    if (!sectionData?.section_type || !sectionData?.title) {
      return res.status(400).json({
        message: "Missing required fields: section_type, title",
      })
    }

    const section = await promotionalContentService.createHomepageSections(sectionData as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "homepage-section.created",
      id: section?.id,
    })

    res.status(201).json({
      section,
    })
  } catch (error) {
    console.error("Error creating homepage section:", error)
    res.status(500).json({
      message: "Failed to create homepage section",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

