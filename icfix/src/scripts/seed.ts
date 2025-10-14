import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["vn"]; // Vietnam only

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
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
          payment_providers: ["pp_system_default"], // COD - Cash on Delivery
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
          name: "Vietnam Warehouse",
          address: {
            city: "Ho Chi Minh City",
            country_code: "VN",
            address_1: "District 1",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Vietnam Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Vietnam",
        geo_zones: [
          {
            country_code: "vn",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Giao hàng trong 2-3 ngày (Standard delivery in 2-3 days)",
          code: "standard",
        },
        prices: [
          {
            currency_code: "vnd",
            amount: 35000, // 35,000 VND
          },
          {
            region_id: region.id,
            amount: 35000, // 35,000 VND
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Giao hàng trong 24 giờ (Express delivery in 24 hours)",
          code: "express",
        },
        prices: [
          {
            currency_code: "vnd",
            amount: 75000, // 75,000 VND
          },
          {
            region_id: region.id,
            amount: 75000, // 75,000 VND
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

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
            categoryResult.find((cat) => cat.name === "Smartphones")!.id,
          ],
          description:
            "iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system. Experience the most powerful iPhone ever with pro-level performance.",
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
                  amount: 28900000, // 28,900,000 VND (~$1,199)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "128GB / Blue Titanium",
              sku: "IPHONE15PRO-128-BLUE",
              options: {
                Storage: "128GB",
                Color: "Blue Titanium",
              },
              prices: [
                {
                  amount: 28900000, // 28,900,000 VND
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
                  amount: 32900000, // 32,900,000 VND (~$1,349)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "256GB / Black Titanium",
              sku: "IPHONE15PRO-256-BLACK",
              options: {
                Storage: "256GB",
                Color: "Black Titanium",
              },
              prices: [
                {
                  amount: 32900000, // 32,900,000 VND
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "512GB / Natural Titanium",
              sku: "IPHONE15PRO-512-NAT",
              options: {
                Storage: "512GB",
                Color: "Natural Titanium",
              },
              prices: [
                {
                  amount: 38900000, // 38,900,000 VND (~$1,599)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "512GB / White Titanium",
              sku: "IPHONE15PRO-512-WHITE",
              options: {
                Storage: "512GB",
                Color: "White Titanium",
              },
              prices: [
                {
                  amount: 38900000, // 38,900,000 VND
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "1TB / Natural Titanium",
              sku: "IPHONE15PRO-1TB-NAT",
              options: {
                Storage: "1TB",
                Color: "Natural Titanium",
              },
              prices: [
                {
                  amount: 44900000, // 44,900,000 VND (~$1,849)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "1TB / Blue Titanium",
              sku: "IPHONE15PRO-1TB-BLUE",
              options: {
                Storage: "1TB",
                Color: "Blue Titanium",
              },
              prices: [
                {
                  amount: 44900000, // 44,900,000 VND
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
            categoryResult.find((cat) => cat.name === "Accessories")!.id,
          ],
          description:
            "High-speed 67W USB-C power adapter with GaN technology. Charges your iPhone, iPad, MacBook, and other USB-C devices at optimal speed. Compact and travel-friendly design.",
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
              values: ["Charger Only", "With USB-C Cable", "With Lightning Cable", "With Both Cables"],
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
                  amount: 890000, // 890,000 VND (~$37)
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
                  amount: 1290000, // 1,290,000 VND (~$53)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "With Lightning Cable",
              sku: "CHARGER67W-LIGHT",
              options: {
                Type: "With Lightning Cable",
              },
              prices: [
                {
                  amount: 1290000, // 1,290,000 VND
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "With Both Cables",
              sku: "CHARGER67W-BOTH",
              options: {
                Type: "With Both Cables",
              },
              prices: [
                {
                  amount: 1590000, // 1,590,000 VND (~$66)
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
          title: "iPhone Battery Replacement Kit",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Components")!.id,
          ],
          description:
            "High-capacity replacement battery for iPhone with professional installation kit. Includes battery, adhesive strips, and tools. Restore your iPhone's battery life to like-new performance.",
          handle: "iphone-battery-replacement",
          weight: 50,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
          ],
          options: [
            {
              title: "Model",
              values: ["iPhone 13", "iPhone 13 Pro", "iPhone 14", "iPhone 14 Pro"],
            },
          ],
          variants: [
            {
              title: "iPhone 13",
              sku: "BATTERY-IP13",
              options: {
                Model: "iPhone 13",
              },
              prices: [
                {
                  amount: 890000, // 890,000 VND (~$37)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "iPhone 13 Pro",
              sku: "BATTERY-IP13PRO",
              options: {
                Model: "iPhone 13 Pro",
              },
              prices: [
                {
                  amount: 990000, // 990,000 VND (~$41)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "iPhone 14",
              sku: "BATTERY-IP14",
              options: {
                Model: "iPhone 14",
              },
              prices: [
                {
                  amount: 1190000, // 1,190,000 VND (~$49)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "iPhone 14 Pro",
              sku: "BATTERY-IP14PRO",
              options: {
                Model: "iPhone 14 Pro",
              },
              prices: [
                {
                  amount: 1290000, // 1,290,000 VND (~$53)
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
            categoryResult.find((cat) => cat.name === "Laptops")!.id,
          ],
          description:
            "MacBook Air with M3 chip delivers exceptional performance and battery life in an incredibly thin and light design. Perfect for students, creators, and professionals. Features stunning Retina display and up to 18 hours of battery life.",
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
              values: ["8GB RAM / 256GB SSD", "8GB RAM / 512GB SSD", "16GB RAM / 512GB SSD", "24GB RAM / 1TB SSD"],
            },
            {
              title: "Color",
              values: ["Midnight", "Starlight", "Space Gray", "Silver"],
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
                  amount: 27900000, // 27,900,000 VND (~$1,149)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "8GB RAM / 256GB SSD / Starlight",
              sku: "MBA-M3-8-256-STAR",
              options: {
                Configuration: "8GB RAM / 256GB SSD",
                Color: "Starlight",
              },
              prices: [
                {
                  amount: 27900000, // 27,900,000 VND
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "8GB RAM / 512GB SSD / Space Gray",
              sku: "MBA-M3-8-512-GRAY",
              options: {
                Configuration: "8GB RAM / 512GB SSD",
                Color: "Space Gray",
              },
              prices: [
                {
                  amount: 32900000, // 32,900,000 VND (~$1,349)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "16GB RAM / 512GB SSD / Silver",
              sku: "MBA-M3-16-512-SIL",
              options: {
                Configuration: "16GB RAM / 512GB SSD",
                Color: "Silver",
              },
              prices: [
                {
                  amount: 37900000, // 37,900,000 VND (~$1,549)
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "16GB RAM / 512GB SSD / Midnight",
              sku: "MBA-M3-16-512-MID",
              options: {
                Configuration: "16GB RAM / 512GB SSD",
                Color: "Midnight",
              },
              prices: [
                {
                  amount: 37900000, // 37,900,000 VND
                  currency_code: "vnd",
                },
              ],
            },
            {
              title: "24GB RAM / 1TB SSD / Space Gray",
              sku: "MBA-M3-24-1TB-GRAY",
              options: {
                Configuration: "24GB RAM / 1TB SSD",
                Color: "Space Gray",
              },
              prices: [
                {
                  amount: 47900000, // 47,900,000 VND (~$1,969)
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

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
