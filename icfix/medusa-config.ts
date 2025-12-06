// @ts-ignore - @medusajs/framework/utils is available at runtime but types may not be exported
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  featureFlags: {
    "medusa-admin-webhooks-ui": true,
  },
  admin: {
    disable: true, // Disabled for backend server (admin built separately on Vercel)
    backendUrl: process.env.VITE_ADMIN_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    // @ts-ignore
    vite: (config) => {
      // Vite config for admin build (used when --admin-only flag is used)
      return {
        ...config,
        base: "/",
        build: {
          ...config.build,
          outDir: ".medusa/admin",
        },
      }
    },
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
    // Note: Webhook functionality is now handled by src/subscribers/vercel-revalidate.ts
    // The @lambdacurry/medusa-plugin-webhooks has been removed due to v1/v2 compatibility issues
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.R2_FILE_URL,
              access_key_id: process.env.R2_ACCESS_KEY_ID,
              secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
              region: process.env.R2_REGION || "auto",
              bucket: process.env.R2_BUCKET,
              endpoint: process.env.R2_ENDPOINT,
              prefix: process.env.R2_PREFIX || "",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "medusa-plugin-notification-gmail-oauth2",
            id: "gmail",
            options: {
              channels: ["email"],
              user: process.env.GMAIL_USER,
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              storeName: process.env.STORE_NAME || "ICFix Store",
              storeUrl: process.env.STORE_URL || "https://yourstore.com",
            },
          },
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
})
