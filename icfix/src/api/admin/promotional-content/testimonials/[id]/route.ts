import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../../modules/promotional-content"
import PromotionalContentService from "../../../../../modules/promotional-content/service"
import { UpdateTestimonialRequest } from "../../types"
import { triggerStorefrontRevalidation } from "../../../../../lib/revalidate-storefront"

// Get a single testimonial
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    const testimonial = await promotionalContentService.retrieveTestimonial(id)

    res.json({
      testimonial,
    })
  } catch (error) {
    console.error("Error fetching testimonial:", error)
    res.status(500).json({
      message: "Failed to fetch testimonial",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Update a testimonial
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params
    const updateData = req.body as UpdateTestimonialRequest

    const testimonial = await promotionalContentService.updateTestimonials({
      id,
      ...updateData,
    } as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "testimonial.updated",
      id: testimonial?.id || id,
    })

    res.json({
      testimonial,
    })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    res.status(500).json({
      message: "Failed to update testimonial",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Delete a testimonial
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const { id } = req.params

    await promotionalContentService.deleteTestimonials([id])

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "testimonial.deleted",
      id,
    })

    res.status(200).json({
      id,
      object: "testimonial",
      deleted: true,
    })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    res.status(500).json({
      message: "Failed to delete testimonial",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

