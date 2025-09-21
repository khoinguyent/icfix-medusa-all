import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  featureFlags: {
    "medusa-admin-webhooks-ui": true,
  },
  admin: {
    // Remove disable: true to enable admin API endpoints
    // Admin UI serving is controlled by build process, not runtime
    // @ts-ignore
    features: {
      "medusa-admin-workflows-ui": true,
      "medusa-admin-tax-ui": true,
      "medusa-admin-publishable-api-keys-ui": true,
      "medusa-admin-stock-inventory-ui": true,
      "medusa-admin-custom-fields-ui": true,
      "medusa-admin-sales-channels-ui": true,
      "medusa-admin-products-ui": true,
      "medusa-admin-users-ui": true,
      "medusa-admin-pricing-ui": true,
      "medusa-admin-customer-ui": true,
      "medusa-admin-orders-ui": true,
      "medusa-admin-draft-orders-ui": true,
      "medusa-admin-discounts-ui": true,
      "medusa-admin-gift-cards-ui": true,
      "medusa-admin-settings-ui": true
    },
  },
  plugins: [
    {
      resolve: "@lambdacurry/medusa-plugin-webhooks",
      options: {
        enableUI: true,
        customSubscriptions: [
          "product.created",
          "product.updated",
          "product.deleted",
          "product-variant.created",
          "product-variant.updated",
          "product-variant.deleted",
          "product-collection.created",
          "product-collection.updated",
          "product-collection.deleted",
          "product-category.created",
          "product-category.updated",
          "product-category.deleted",
        ],
      },
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions:{
      ssl: false,
      sslmode: "disable",
    },
  },
  modules: [
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            id: "s3",
            resolve: "@medusajs/file-s3",
            options: {
              endpoint: process.env.R2_ENDPOINT,
              region: process.env.R2_REGION || "auto",
              bucket: process.env.R2_BUCKET,
              access_key_id: process.env.R2_ACCESS_KEY_ID,
              secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
              file_url: process.env.R2_FILE_URL,
              prefix: process.env.R2_PREFIX || "",
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
  ]
})
