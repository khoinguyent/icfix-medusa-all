import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { EntityManager } from "@mikro-orm/knex"

/**
 * Ensure promotional content tables exist
 * This script creates tables if they don't exist
 * 
 * Usage:
 *   npx medusa exec ./src/scripts/ensure-promotional-tables.ts
 */
export default async function ensurePromotionalTables({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const manager = container.resolve<EntityManager>(ContainerRegistrationKeys.MANAGER)

  try {
    logger.info("Checking promotional content tables...")

    // Use raw SQL to create tables if they don't exist
    const createTablesSQL = `
      -- Create promotional_banner table
      CREATE TABLE IF NOT EXISTS promotional_banner (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        mobile_image_url TEXT,
        link_type TEXT CHECK (link_type IN ('product', 'collection', 'category', 'external')),
        link_value TEXT,
        button_text TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        position TEXT DEFAULT 'homepage' CHECK (position IN ('hero', 'homepage', 'category', 'product', 'sidebar')),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      -- Create service_feature table
      CREATE TABLE IF NOT EXISTS service_feature (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      -- Create testimonial table
      CREATE TABLE IF NOT EXISTS testimonial (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_title TEXT,
        customer_avatar_url TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      -- Create homepage_section table
      CREATE TABLE IF NOT EXISTS homepage_section (
        id TEXT PRIMARY KEY,
        section_type TEXT NOT NULL CHECK (section_type IN ('featured_products', 'new_arrivals', 'best_sellers', 'categories', 'testimonials', 'promotional')),
        title TEXT NOT NULL,
        subtitle TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        collection_id TEXT,
        category_id TEXT,
        product_limit INTEGER,
        promotional_banner_id TEXT,
        show_category_images BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `

    // Execute SQL directly - CREATE TABLE IF NOT EXISTS is idempotent
    await manager.execute(createTablesSQL)

    logger.info("✅ Promotional content tables verified/created")
  } catch (error) {
    logger.error("Error ensuring promotional content tables:", error)
    // Don't throw - allow script to complete
  }
}

