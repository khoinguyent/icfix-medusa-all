import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PROMOTIONAL_CONTENT_MODULE } from "../modules/promotional-content"
import PromotionalContentService from "../modules/promotional-content/service"

export default async function createCategorySection({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotionalContentService = container.resolve(
    PROMOTIONAL_CONTENT_MODULE
  ) as PromotionalContentService

  try {
    logger.info("Creating 'Shop by Category' homepage section...")

    // Check if section already exists
    const existingSections = await promotionalContentService.listHomepageSections(
      {
        section_type: "categories",
        is_active: true,
      }
    )

    if (existingSections && existingSections.length > 0) {
      logger.info(
        `Category section already exists (${existingSections.length} found). Skipping creation.`
      )
      return
    }

    // Create the category section
    const section = await promotionalContentService.createHomepageSections({
      section_type: "categories",
      title: "Shop by Category",
      subtitle: "Browse our products by category",
      display_order: 3,
      is_active: true,
      show_category_images: false,
      product_limit: null,
    })

    logger.info(`✓ Created homepage section: ${section.id}`)
    logger.info(`  Title: ${section.title}`)
    logger.info(`  Type: ${section.section_type}`)
    logger.info(`  Display Order: ${section.display_order}`)
  } catch (error) {
    logger.error("Error creating category section:", error)
    throw error
  }
}

