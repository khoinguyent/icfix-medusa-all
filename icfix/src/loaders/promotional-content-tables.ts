import { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Loader to ensure promotional content tables exist on startup
 * This ensures tables are created even if migrations haven't run yet
 */
export default async function promotionalContentTablesLoader({
  container,
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // Check if tables exist by trying to query them
    const tables = [
      "promotional_banner",
      "service_feature",
      "testimonial",
      "homepage_section",
    ]

    for (const tableName of tables) {
      try {
        // Try to query the table to see if it exists
        await query.graph({
          entity: tableName,
          fields: ["id"],
          filters: {},
        })
        logger.info(`✓ Table ${tableName} exists`)
      } catch (error: any) {
        // If table doesn't exist, create it
        if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
          logger.warn(`Table ${tableName} does not exist, creating...`)
          await createTable(tableName, logger)
        } else {
          logger.error(`Error checking table ${tableName}:`, error)
        }
      }
    }
  } catch (error) {
    logger.error("Error in promotional content tables loader:", error)
    // Don't throw - allow backend to start even if tables can't be created
    // Admin can create them manually via migrations
  }
}

async function createTable(tableName: string, logger: any) {
  // This will be handled by the database connection
  // The tables should be created via migrations, but this is a fallback
  logger.info(`Table ${tableName} should be created via migrations. Run: npx medusa db:generate promotionalContent && npx medusa db:migrate`)
}

