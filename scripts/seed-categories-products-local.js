/**
 * Seed Categories and Products for Local Development
 * This script uses the Medusa container to create categories and products
 */

const { createProductCategoriesWorkflow, createProductsWorkflow, createInventoryLevelsWorkflow } = require('@medusajs/medusa/core-flows');
const { ContainerRegistrationKeys, Modules, ProductStatus } = require('@medusajs/framework/utils');

// This script should be run from within the backend container
// It uses the Medusa container that's already initialized

async function seedCategoriesAndProducts(container) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  try {
    logger.info('🌱 Starting to seed categories and products...');

    // Get default sales channel
    const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

    if (!defaultSalesChannel.length) {
      throw new Error('Default Sales Channel not found');
    }

    // Get shipping profile
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles();
    const shippingProfile = shippingProfiles.find(p => p.name === 'Default') || shippingProfiles[0];

    if (!shippingProfile) {
      throw new Error('Shipping profile not found');
    }

    // Get stock location
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    });

    if (!stockLocations || stockLocations.length === 0) {
      throw new Error('Stock location not found');
    }

    const stockLocation = stockLocations[0];

    // Create Categories
    logger.info('Creating product categories...');
    const { result: categoryResult } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [
          {
            name: "Smartphones",
            is_active: true,
            description: "Latest smartphones and mobile devices",
          },
          {
            name: "Accessories",
            is_active: true,
            description: "Phone cases, chargers, and more",
          },
          {
            name: "Components",
            is_active: true,
            description: "Phone batteries, screens, and replacement parts",
          },
          {
            name: "Laptops",
            is_active: true,
            description: "Laptops and computing devices",
          },
        ],
      },
    });

    logger.info(`✓ Created ${categoryResult.length} categories`);

    // Create Products
    logger.info('Creating products...');
    const { result: products } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "iPhone 15 Pro",
            category_ids: [
              categoryResult.find((cat) => cat.name === "Smartphones").id,
            ],
            description: "iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system.",
            handle: "iphone-15-pro",
            weight: 187,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
              },
            ],
            options: [
              {
                title: "Storage",
                values: ["128GB", "256GB", "512GB", "1TB"],
              },
              {
                title: "Color",
                values: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
              },
            ],
            variants: [
              {
                title: "128GB / Natural Titanium",
                sku: "IPHONE15PRO-128-NAT",
                options: {
                  Storage: "128GB",
                  Color: "Natural Titanium",
                },
                prices: [
                  {
                    amount: 28900000,
                    currency_code: "vnd",
                  },
                ],
              },
              {
                title: "256GB / Natural Titanium",
                sku: "IPHONE15PRO-256-NAT",
                options: {
                  Storage: "256GB",
                  Color: "Natural Titanium",
                },
                prices: [
                  {
                    amount: 32900000,
                    currency_code: "vnd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "USB-C Fast Charger 67W",
            category_ids: [
              categoryResult.find((cat) => cat.name === "Accessories").id,
            ],
            description: "High-speed 67W USB-C power adapter with GaN technology.",
            handle: "usbc-fast-charger-67w",
            weight: 150,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
              },
            ],
            options: [
              {
                title: "Type",
                values: ["Charger Only", "With USB-C Cable"],
              },
            ],
            variants: [
              {
                title: "Charger Only",
                sku: "CHARGER67W-ONLY",
                options: {
                  Type: "Charger Only",
                },
                prices: [
                  {
                    amount: 890000,
                    currency_code: "vnd",
                  },
                ],
              },
              {
                title: "With USB-C Cable",
                sku: "CHARGER67W-USBC",
                options: {
                  Type: "With USB-C Cable",
                },
                prices: [
                  {
                    amount: 1290000,
                    currency_code: "vnd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "MacBook Air M3",
            category_ids: [
              categoryResult.find((cat) => cat.name === "Laptops").id,
            ],
            description: "MacBook Air with M3 chip delivers exceptional performance and battery life.",
            handle: "macbook-air-m3",
            weight: 1240,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
              },
            ],
            options: [
              {
                title: "Configuration",
                values: ["8GB RAM / 256GB SSD", "8GB RAM / 512GB SSD"],
              },
              {
                title: "Color",
                values: ["Midnight", "Starlight"],
              },
            ],
            variants: [
              {
                title: "8GB RAM / 256GB SSD / Midnight",
                sku: "MBA-M3-8-256-MID",
                options: {
                  Configuration: "8GB RAM / 256GB SSD",
                  Color: "Midnight",
                },
                prices: [
                  {
                    amount: 27900000,
                    currency_code: "vnd",
                  },
                ],
              },
              {
                title: "8GB RAM / 512GB SSD / Starlight",
                sku: "MBA-M3-8-512-STAR",
                options: {
                  Configuration: "8GB RAM / 512GB SSD",
                  Color: "Starlight",
                },
                prices: [
                  {
                    amount: 32900000,
                    currency_code: "vnd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
        ],
      },
    });

    logger.info(`✓ Created ${products.length} products`);

    // Create inventory levels
    logger.info('Creating inventory levels...');
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    });

    const inventoryLevels = [];
    for (const inventoryItem of inventoryItems) {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: inventoryItem.id,
      });
    }

    if (inventoryLevels.length > 0) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryLevels,
        },
      });
      logger.info(`✓ Created ${inventoryLevels.length} inventory levels`);
    }

    logger.info('✅ Categories and products seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error seeding categories and products:', error);
    throw error;
  }
}

module.exports = { seedCategoriesAndProducts };
