import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  deleteProductsWorkflow,
  deleteRegionsWorkflow,
  deleteStockLocationsWorkflow,
  deleteApiKeysWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Clear Seed Data Script
 * 
 * This script removes all seeded data from the database:
 * - Products and variants
 * - Product categories
 * - Regions
 * - Stock locations
 * - Shipping options and fulfillment sets
 * - Publishable API keys
 * - Sales channels (except default)
 * 
 * Usage:
 *   npm run clear-seed
 * 
 * Or with Docker:
 *   docker exec -it icfix-backend npm run clear-seed
 */

export default async function clearSeedData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const productCategoryModuleService = container.resolve(Modules.PRODUCT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("🧹 Starting to clear seed data...");

  try {
    // 1. Delete Products
    logger.info("Deleting products...");
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title"],
    });

    if (products.length > 0) {
      await deleteProductsWorkflow(container).run({
        input: { ids: products.map((p: any) => p.id) },
      });
      logger.info(`✓ Deleted ${products.length} products`);
    } else {
      logger.info("No products to delete");
    }

    // 2. Delete Product Categories
    logger.info("Deleting product categories...");
    const categories = await productCategoryModuleService.listProductCategories();
    
    if (categories.length > 0) {
      for (const category of categories) {
        await productCategoryModuleService.deleteProductCategories([category.id]);
      }
      logger.info(`✓ Deleted ${categories.length} product categories`);
    } else {
      logger.info("No product categories to delete");
    }

    // 3. Delete Shipping Options and Fulfillment Sets
    logger.info("Deleting shipping options and fulfillment sets...");
    const shippingOptions = await fulfillmentModuleService.listShippingOptions();
    
    if (shippingOptions.length > 0) {
      for (const option of shippingOptions) {
        await fulfillmentModuleService.deleteShippingOptions([option.id]);
      }
      logger.info(`✓ Deleted ${shippingOptions.length} shipping options`);
    }

    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();
    
    if (fulfillmentSets.length > 0) {
      for (const set of fulfillmentSets) {
        await fulfillmentModuleService.deleteFulfillmentSets([set.id]);
      }
      logger.info(`✓ Deleted ${fulfillmentSets.length} fulfillment sets`);
    }

    // 4. Delete Stock Locations
    logger.info("Deleting stock locations...");
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    });

    if (stockLocations.length > 0) {
      await deleteStockLocationsWorkflow(container).run({
        input: { ids: stockLocations.map((loc: any) => loc.id) },
      });
      logger.info(`✓ Deleted ${stockLocations.length} stock locations`);
    } else {
      logger.info("No stock locations to delete");
    }

    // 5. Delete Regions
    logger.info("Deleting regions...");
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name"],
    });

    if (regions.length > 0) {
      await deleteRegionsWorkflow(container).run({
        input: { ids: regions.map((r: any) => r.id) },
      });
      logger.info(`✓ Deleted ${regions.length} regions`);
    } else {
      logger.info("No regions to delete");
    }

    // 6. Delete Publishable API Keys
    logger.info("Deleting publishable API keys...");
    const { data: apiKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "title", "type"],
      filters: {
        type: "publishable",
      },
    });

    if (apiKeys.length > 0) {
      await deleteApiKeysWorkflow(container).run({
        input: { ids: apiKeys.map((key: any) => key.id) },
      });
      logger.info(`✓ Deleted ${apiKeys.length} publishable API keys`);
    } else {
      logger.info("No publishable API keys to delete");
    }

    // 7. Delete Sales Channels (except Default)
    logger.info("Deleting sales channels (except default)...");
    const allSalesChannels = await salesChannelModuleService.listSalesChannels();
    const salesChannels = allSalesChannels.filter(
      (channel) => channel.name !== "Default Sales Channel"
    );

    if (salesChannels.length > 0) {
      for (const channel of salesChannels) {
        await salesChannelModuleService.deleteSalesChannels([channel.id]);
      }
      logger.info(`✓ Deleted ${salesChannels.length} sales channels`);
    } else {
      logger.info("No custom sales channels to delete");
    }

    // 8. Delete Shipping Profiles (except default)
    logger.info("Deleting shipping profiles (except default)...");
    const allShippingProfiles = await fulfillmentModuleService.listShippingProfiles();
    const shippingProfiles = allShippingProfiles.filter(
      (profile) => profile.type !== "default"
    );

    if (shippingProfiles.length > 0) {
      for (const profile of shippingProfiles) {
        await fulfillmentModuleService.deleteShippingProfiles([profile.id]);
      }
      logger.info(`✓ Deleted ${shippingProfiles.length} shipping profiles`);
    } else {
      logger.info("No custom shipping profiles to delete");
    }

    logger.info("✅ Successfully cleared all seed data!");
    logger.info("");
    logger.info("📊 Summary:");
    logger.info(`   - Products deleted: ${products.length}`);
    logger.info(`   - Categories deleted: ${categories.length}`);
    logger.info(`   - Regions deleted: ${regions.length}`);
    logger.info(`   - Stock locations deleted: ${stockLocations.length}`);
    logger.info(`   - API keys deleted: ${apiKeys.length}`);
    logger.info("");
    logger.info("🚀 You can now run the seed script again:");
    logger.info("   npm run seed");

  } catch (error) {
    logger.error("❌ Error clearing seed data:", error);
    throw error;
  }
}

