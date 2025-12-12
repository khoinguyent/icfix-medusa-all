import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMOTIONAL_CONTENT_MODULE } from "../../../../modules/promotional-content"
import PromotionalContentService from "../../../../modules/promotional-content/service"
import { CreateTestimonialRequest } from "../types"
import { triggerStorefrontRevalidation } from "../../../../lib/revalidate-storefront"

// List all testimonials
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

    const testimonials = await promotionalContentService.listTestimonials(
      isActive !== undefined ? { is_active: isActive } : {},
      {
        order: { display_order: "ASC" },
      }
    )

    res.json({
      testimonials: testimonials || [],
      count: testimonials?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    res.status(500).json({
      message: "Failed to fetch testimonials",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Create a new testimonial
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const promotionalContentService = req.scope.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService

    const testimonialData = req.body as CreateTestimonialRequest

    // Validate required fields
    if (!testimonialData?.customer_name || !testimonialData?.comment || !testimonialData?.rating) {
      return res.status(400).json({
        message: "Missing required fields: customer_name, comment, rating",
      })
    }

    const testimonial = await promotionalContentService.createTestimonials(testimonialData as any)

    // Trigger storefront revalidation
    await triggerStorefrontRevalidation({
      event: "testimonial.created",
      id: testimonial?.id,
    })

    res.status(201).json({
      testimonial,
    })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    res.status(500).json({
      message: "Failed to create testimonial",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

