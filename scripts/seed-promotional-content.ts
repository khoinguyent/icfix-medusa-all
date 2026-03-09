import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import { PROMOTIONAL_CONTENT_MODULE } from "../icfix/src/modules/promotional-content";
import PromotionalContentService from "../icfix/src/modules/promotional-content/service";

/**
 * Seed Promotional Content Data
 * 
 * This script seeds sample promotional content data:
 * - Hero banners
 * - Homepage sections
 * - Service features
 * - Testimonials
 * 
 * Usage:
 *   npm run seed-promotional
 * 
 * Or with Docker:
 *   docker exec -it medusa-backend-local npx medusa exec ./src/scripts/seed-promotional-content.ts
 */

export default async function seedPromotionalContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  try {
    const promotionalContentService = container.resolve(
      PROMOTIONAL_CONTENT_MODULE
    ) as PromotionalContentService;

    logger.info("🌱 Starting to seed promotional content data...");

    // 1. Create Service Features
    logger.info("Creating service features...");
    const serviceFeatures = [
      {
        title: "Free Shipping",
        description: "For all orders $200",
        icon_url: null,
        display_order: 1,
        is_active: true,
      },
      {
        title: "1 & 1 Returns",
        description: "Cancellation after 1 day",
        icon_url: null,
        display_order: 2,
        is_active: true,
      },
      {
        title: "100% Secure Payments",
        description: "Gurantee secure payments",
        icon_url: null,
        display_order: 3,
        is_active: true,
      },
      {
        title: "24/7 Dedicated Support",
        description: "Anywhere & anytime",
        icon_url: null,
        display_order: 4,
        is_active: true,
      },
    ];

    for (const feature of serviceFeatures) {
      await promotionalContentService.createServiceFeatures([feature]);
      logger.info(`✓ Created service feature: ${feature.title}`);
    }

    // 2. Create Testimonials
    logger.info("Creating testimonials...");
    const testimonials = [
      {
        customer_name: "Davis Dorwart",
        customer_title: "Serial Entrepreneur",
        customer_avatar_url: null,
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
        display_order: 1,
        is_active: true,
      },
      {
        customer_name: "Wilson Dias",
        customer_title: "Backend Developer",
        customer_avatar_url: null,
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
        display_order: 2,
        is_active: true,
      },
      {
        customer_name: "Davis Dorwart",
        customer_title: "Serial Entrepreneur",
        customer_avatar_url: null,
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
        display_order: 3,
        is_active: true,
      },
      {
        customer_name: "Wilson Dias",
        customer_title: "Backend Developer",
        customer_avatar_url: null,
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
        display_order: 4,
        is_active: true,
      },
    ];

    for (const testimonial of testimonials) {
      await promotionalContentService.createTestimonials([testimonial]);
      logger.info(`✓ Created testimonial: ${testimonial.customer_name}`);
    }

    logger.info("✅ Promotional content seeded successfully!");
    logger.info("");
    logger.info("Note: Hero banners and homepage sections should be created via Admin UI");
    logger.info("or added manually to the database after collections/categories are set up.");

  } catch (error) {
    logger.error("❌ Error seeding promotional content:", error);
    throw error;
  }
}

