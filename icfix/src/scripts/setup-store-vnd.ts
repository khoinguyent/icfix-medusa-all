import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Setup Store for Vietnam (VND currency, VN location)
 * 
 * This script ensures the store is properly configured with:
 * - VND as the default currency
 * - Vietnam (VN) as the region
 * - Tax region for Vietnam
 * 
 * Usage:
 *   npx medusa exec ./src/scripts/setup-store-vnd.ts
 * 
 * Or with Docker:
 *   docker exec -it medusa-backend-local npx medusa exec ./src/scripts/setup-store-vnd.ts
 */

export default async function setupStoreVND({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const storeModuleService = container.resolve(Modules.STORE);

  const countryCode = "vn"; // Vietnam
  const currencyCode = "vnd"; // Vietnamese Dong

  try {
    logger.info("🏪 Setting up store for Vietnam (VND currency, VN location)...");

    // 1. Get or update store
    logger.info("📦 Updating store configuration...");
    const [store] = await storeModuleService.listStores();
    
    if (!store) {
      throw new Error("Store not found. Please ensure the database is initialized.");
    }

    // Check if VND is already set as default currency
    const hasVND = store.supported_currencies?.some(
      (curr: any) => curr.currency_code === currencyCode && curr.is_default
    );

    if (!hasVND) {
      logger.info(`Setting VND (${currencyCode.toUpperCase()}) as default currency...`);
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            supported_currencies: [
              {
                currency_code: currencyCode,
                is_default: true,
              },
            ],
          },
        },
      });
      logger.info("✅ Store currency set to VND");
    } else {
      logger.info("✅ Store already has VND as default currency");
    }

    // 2. Check if Vietnam region exists
    logger.info("🌏 Checking Vietnam region...");
    const { data: existingRegions } = await query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code", "countries"],
      filters: {
        countries: {
          $contains: countryCode.toUpperCase(),
        },
      },
    });

    let region;
    if (existingRegions && existingRegions.length > 0) {
      region = existingRegions[0];
      logger.info(`✅ Vietnam region already exists: ${region.name} (${region.id})`);
      
      // Verify currency code matches
      if (region.currency_code !== currencyCode) {
        logger.warn(`⚠️  Region currency is ${region.currency_code}, expected ${currencyCode}. Region needs manual update.`);
      }
    } else {
      logger.info("Creating Vietnam region...");
      const { result: regionResult } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Vietnam",
              currency_code: currencyCode,
              countries: [countryCode],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      region = regionResult[0];
      logger.info(`✅ Created Vietnam region: ${region.name} (${region.id})`);
    }

    // 3. Check if tax region exists for Vietnam
    logger.info("💰 Checking tax region for Vietnam...");
    const { data: existingTaxRegions } = await query.graph({
      entity: "tax_region",
      fields: ["id", "country_code", "provider_id"],
      filters: {
        country_code: countryCode.toUpperCase(),
      },
    });

    if (existingTaxRegions && existingTaxRegions.length > 0) {
      logger.info(`✅ Tax region already exists for ${countryCode.toUpperCase()}`);
    } else {
      logger.info(`Creating tax region for ${countryCode.toUpperCase()}...`);
      await createTaxRegionsWorkflow(container).run({
        input: [
          {
            country_code: countryCode.toUpperCase(),
            provider_id: "tp_system",
          },
        ],
      });
      logger.info(`✅ Created tax region for ${countryCode.toUpperCase()}`);
    }

    // 4. Summary
    logger.info("");
    logger.info("🎉 Store setup complete!");
    logger.info("");
    logger.info("📋 Configuration Summary:");
    logger.info(`   Currency: ${currencyCode.toUpperCase()} (Vietnamese Dong)`);
    logger.info(`   Region: Vietnam (${countryCode.toUpperCase()})`);
    logger.info(`   Region ID: ${region.id}`);
    logger.info("");
    logger.info("✅ Store is ready for Vietnam market!");

  } catch (error) {
    logger.error("❌ Error setting up store:", error);
    throw error;
  }
}

