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
    {
      resolve: "@perseidesjs/notification-nodemailer",
      options: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
        SMTP_SECURE: process.env.SMTP_SECURE === "true",
        SMTP_USER: process.env.GMAIL_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        SMTP_FROM: process.env.SMTP_FROM,
        // Google OAuth Configuration
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
        TEMPLATES: {
          ORDER_PLACED: {
            subject: "Order Confirmation - #{order.display_id}",
            html: `
              <h2>Order Confirmation</h2>
              <p>Thank you for your order!</p>
              <p><strong>Order ID:</strong> #{order.display_id}</p>
              <p><strong>Total:</strong> #{order.total_with_tax} #{order.currency_code}</p>
              <p>We'll send you another email when your order ships.</p>
            `,
          },
          ORDER_SHIPPED: {
            subject: "Order Shipped - #{order.display_id}",
            html: `
              <h2>Order Shipped</h2>
              <p>Great news! Your order #{order.display_id} has been shipped.</p>
              <p><strong>Tracking Number:</strong> #{shipment.tracking_number || "N/A"}</p>
              <p>You can track your package using the tracking number above.</p>
            `,
          },
          ORDER_CANCELED: {
            subject: "Order Canceled - #{order.display_id}",
            html: `
              <h2>Order Canceled</h2>
              <p>Your order #{order.display_id} has been canceled.</p>
              <p>If you have any questions, please contact our support team.</p>
            `,
          },
          ORDER_COMPLETED: {
            subject: "Order Completed - #{order.display_id}",
            html: `
              <h2>Order Completed</h2>
              <p>Your order #{order.display_id} has been completed.</p>
              <p>Thank you for your business!</p>
            `,
          },
        },
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
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa-payment-manual",
            id: "system",
            options: {},
          },
        ],
      },
    },
  ]
})
