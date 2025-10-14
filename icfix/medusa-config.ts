import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  featureFlags: {
    "medusa-admin-webhooks-ui": true,
  },
  admin: {
    disable: true,
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
    // TODO: Re-enable after fixing ES module to CommonJS conversion
    // Gmail OAuth2 Email Notification Plugin - Temporarily Disabled
    // {
    //   resolve: "./plugins/notification-gmail-oauth2",
    //   options: {
    //     user: process.env.GMAIL_USER,
    //     clientId: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    //     storeName: process.env.STORE_NAME || "Your Store",
    //   },
    // },
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
  modules: []
})
