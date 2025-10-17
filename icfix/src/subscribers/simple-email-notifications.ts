import type {
  SubscriberConfig,
  SubscriberArgs,
} from "@medusajs/framework"

// Import Gmail service directly (no container resolution)
const GmailNotificationService = require("medusa-plugin-notification-gmail-oauth2")

export default async function simpleEmailNotificationsHandler({
  event: { name, data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve("logger")
  
  try {
    logger.info(`📧 Processing email notification for event: ${name}`)

    // Create Gmail service directly with environment variables
    const options = {
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      storeName: process.env.STORE_NAME || "Your Store",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    const gmailService = new GmailNotificationService(container, options)

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000))

    switch (name) {
      case "order.placed":
        await handleOrderPlaced(data, gmailService, logger)
        break
      
      case "order.shipment_created":
        await handleOrderShipped(data, gmailService, logger)
        break
      
      case "order.canceled":
        await handleOrderCanceled(data, gmailService, logger)
        break
      
      case "customer.password_token_generated":
        await handlePasswordReset(data, gmailService, logger)
        break
      
      default:
        logger.info(`No email notification configured for event: ${name}`)
    }
  } catch (error) {
    logger.error(`Error processing email notification for event ${name}:`, error)
  }
}

async function handleOrderPlaced(data: any, gmailService: any, logger: any) {
  try {
    const { id, email, customer, total, currency_code, display_id } = data

    const recipientEmail = email || customer?.email
    if (!recipientEmail) {
      logger.warn("Order placed notification: No email address found")
      return
    }

    const orderData = {
      email: recipientEmail,
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId: display_id || id,
      orderTotal: total || 0,
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    const result = await gmailService.sendNotification("order.placed", orderData)
    if (result) {
      logger.info(`✅ Order confirmation email sent for order: ${display_id || id}`)
    } else {
      logger.warn(`⚠️ Order confirmation email failed for order: ${display_id || id}`)
    }
  } catch (error) {
    logger.error(`Failed to send order placed notification:`, error)
  }
}

async function handleOrderShipped(data: any, gmailService: any, logger: any) {
  try {
    const { order_id, fulfillment, order } = data

    const orderDetails = order || {}
    const customer = orderDetails.customer || {}
    
    const recipientEmail = customer.email || orderDetails.email
    if (!recipientEmail) {
      logger.warn("Order shipped notification: No email address found")
      return
    }

    const shipmentData = {
      email: recipientEmail,
      customerName: customer.first_name || customer.email || "Customer",
      orderId: orderDetails.display_id || order_id,
      trackingNumber: fulfillment?.tracking_numbers?.[0] || "TBA",
      carrier: fulfillment?.provider_id || "Shipping Carrier",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    const result = await gmailService.sendNotification("order.shipped", shipmentData)
    if (result) {
      logger.info(`✅ Shipment notification sent for order: ${shipmentData.orderId}`)
    } else {
      logger.warn(`⚠️ Shipment notification failed for order: ${shipmentData.orderId}`)
    }
  } catch (error) {
    logger.error(`Failed to send order shipped notification:`, error)
  }
}

async function handleOrderCanceled(data: any, gmailService: any, logger: any) {
  try {
    const { id, email, customer, total, currency_code, display_id, cancel_reason } = data

    const recipientEmail = email || customer?.email
    if (!recipientEmail) {
      logger.warn("Order canceled notification: No email address found")
      return
    }

    const cancelData = {
      email: recipientEmail,
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId: display_id || id,
      reason: cancel_reason || "Order cancellation requested",
      refundAmount: total || 0,
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    const result = await gmailService.sendNotification("order.canceled", cancelData)
    if (result) {
      logger.info(`✅ Order cancellation email sent for order: ${cancelData.orderId}`)
    } else {
      logger.warn(`⚠️ Order cancellation email failed for order: ${cancelData.orderId}`)
    }
  } catch (error) {
    logger.error(`Failed to send order canceled notification:`, error)
  }
}

async function handlePasswordReset(data: any, gmailService: any, logger: any) {
  try {
    const { customer_id, token, customer } = data

    const recipientEmail = customer?.email || data.email
    if (!recipientEmail) {
      logger.warn("Password reset notification: No email address found")
      return
    }

    const resetData = {
      email: recipientEmail,
      customerName: customer?.first_name || customer?.email || "User",
      resetLink: `${process.env.STORE_URL || "https://yourstore.com"}/account/reset-password?token=${token}`,
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    const result = await gmailService.sendNotification("password_reset", resetData)
    if (result) {
      logger.info(`✅ Password reset email sent to: ${recipientEmail}`)
    } else {
      logger.warn(`⚠️ Password reset email failed to: ${recipientEmail}`)
    }
  } catch (error) {
    logger.error(`Failed to send password reset notification:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.shipment_created",
    "order.canceled",
    "customer.password_token_generated",
  ],
}
