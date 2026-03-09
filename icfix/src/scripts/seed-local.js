/**
 * Seed script for local development (JavaScript version)
 * This can run in production containers without ts-node
 */

const { ContainerRegistrationKeys, Modules, ProductStatus } = require("@medusajs/framework/utils");
const {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} = require("@medusajs/medusa/core-flows");

module.exports = async function seedDemoData({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["vn"];

  try {
    logger.info("Seeding store data...");
    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

    if (!defaultSalesChannel.length) {
      const { result: salesChannelResult } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: {
          salesChannelsData: [
            {
              name: "Default Sales Channel",
            },
          ],
        },
      });
      defaultSalesChannel = salesChannelResult;
    }

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            {
              currency_code: "vnd",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel[0].id,
        },
      },
    });

    logger.info("Seeding region data...");
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Vietnam",
            currency_code: "vnd",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    const region = regionResult[0];
    logger.info("Finished seeding regions.");

    logger.info("Seeding tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system"
      })),
    });
    logger.info("Finished seeding tax regions.");

    logger.info("Seeding stock location data...");
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Main Warehouse",
            address: {
              address_1: "123 Main St",
              city: "Ho Chi Minh City",
              country_code: "vn",
              postal_code: "700000",
            },
          },
        ],
      },
    });
    const stockLocation = stockLocationResult[0];

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
    logger.info("Finished seeding stock location data.");

    logger.info("Seeding shipping profile...");
    const { result: shippingProfileResult } = await createShippingProfilesWorkflow(
      container
    ).run({
      input: {
        shipping_profiles: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
    const shippingProfile = shippingProfileResult[0];

    logger.info("Seeding shipping options...");
    await createShippingOptionsWorkflow(container).run({
      input: {
        name: "Standard Shipping",
        price_type: "flat",
        service_zone_id: region.id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual",
        data: {
          amount: 35000, // 35,000 VND
        },
        type: {
          label: "Standard",
          description: "2-3 business days",
        },
      },
    });

    await createShippingOptionsWorkflow(container).run({
      input: {
        name: "Express Shipping",
        price_type: "flat",
        service_zone_id: region.id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual",
        data: {
          amount: 75000, // 75,000 VND
        },
        type: {
          label: "Express",
          description: "24 hours",
        },
      },
    });
    logger.info("Finished seeding shipping options.");

    logger.info("Seeding product data...");

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

    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "iPhone 15 Pro",
            category_ids: [
              categoryResult.find((cat) => cat.name === "Smartphones").id,
            ],
            description:
              "iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system.",
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
            description: "MacBook Air with M3 chip delivers exceptional performance.",
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

    logger.info("Finished seeding product data.");

    logger.info("Seeding inventory levels.");
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

    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });

    logger.info("Finished seeding inventory levels data.");
    logger.info("✅ Seeding completed successfully!");
  } catch (error) {
    logger.error("Error seeding data:", error);
    throw error;
  }
};
