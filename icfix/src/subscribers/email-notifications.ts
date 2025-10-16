import type {
  SubscriberConfig,
  SubscriberArgs,
} from "@medusajs/framework"

export default async function emailNotificationsHandler({
  event: { name, data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve("logger")
  
  try {
    // Try to get the notification module service first (Medusa v2 pattern)
    let notificationModuleService
    let gmailService
    
    try {
      notificationModuleService = container.resolve("notificationModuleService")
    } catch (error) {
      // Fall back to direct service resolution
      logger.debug("Notification module service not found, trying direct service resolution")
    }

    // If notification module is available, get the Gmail provider
    if (notificationModuleService) {
      // We'll use the notification module service to send notifications
      logger.info(`📧 Using notification module service for event: ${name}`)
      
      // For Medusa v2, we can use the notification module service
      // but we also need to maintain backward compatibility
      // so we'll resolve the provider service directly
      try {
        gmailService = container.resolve("notification-gmail-oauth2")
      } catch (error) {
        logger.warn("Gmail notification provider not found in container")
      }
    }
    
    // Fall back to legacy resolution if needed
    if (!gmailService) {
      try {
        gmailService = container.resolve("gmailNotificationService")
      } catch (error) {
        logger.warn("Gmail notification service not found. Make sure the plugin is properly loaded.")
        return
      }
    }
    
    if (!gmailService) {
      logger.warn("Gmail notification service not available")
      return
    }

    logger.info(`📧 Processing email notification for event: ${name}`)

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

    const orderData = {
      email: email || customer?.email,
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId: display_id || id,
      orderTotal: total || 0,
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    if (!orderData.email) {
      logger.warn("Order placed notification: No email address found")
      return
    }

    await gmailService.sendNotification("order.placed", orderData)
    logger.info(`✅ Order confirmation email sent for order: ${orderData.orderId}`)
  } catch (error) {
    logger.error(`Failed to send order placed notification:`, error)
  }
}

async function handleOrderShipped(data: any, gmailService: any, logger: any) {
  try {
    const { order_id, fulfillment, order } = data

    // Get order details if available
    const orderDetails = order || {}
    const customer = orderDetails.customer || {}

    const shipmentData = {
      email: customer.email || orderDetails.email,
      customerName: customer.first_name || customer.email || "Customer",
      orderId: orderDetails.display_id || order_id,
      trackingNumber: fulfillment?.tracking_numbers?.[0] || "TBA",
      carrier: fulfillment?.provider_id || "Shipping Carrier",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    if (!shipmentData.email) {
      logger.warn("Order shipped notification: No email address found")
      return
    }

    await gmailService.sendNotification("order.shipped", shipmentData)
    logger.info(`✅ Shipment notification sent for order: ${shipmentData.orderId}`)
  } catch (error) {
    logger.error(`Failed to send order shipped notification:`, error)
  }
}

async function handleOrderCanceled(data: any, gmailService: any, logger: any) {
  try {
    const { id, email, customer, total, currency_code, display_id, cancel_reason } = data

    const cancelData = {
      email: email || customer?.email,
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId: display_id || id,
      reason: cancel_reason || "Order cancellation requested",
      refundAmount: total || 0,
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    if (!cancelData.email) {
      logger.warn("Order canceled notification: No email address found")
      return
    }

    await gmailService.sendNotification("order.canceled", cancelData)
    logger.info(`✅ Order cancellation email sent for order: ${cancelData.orderId}`)
  } catch (error) {
    logger.error(`Failed to send order canceled notification:`, error)
  }
}

async function handlePasswordReset(data: any, gmailService: any, logger: any) {
  try {
    const { customer_id, token, customer } = data

    const resetData = {
      email: customer?.email || data.email,
      customerName: customer?.first_name || customer?.email || "User",
      resetLink: `${process.env.STORE_URL || "https://yourstore.com"}/account/reset-password?token=${token}`,
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
    }

    if (!resetData.email) {
      logger.warn("Password reset notification: No email address found")
      return
    }

    await gmailService.sendNotification("password_reset", resetData)
    logger.info(`✅ Password reset email sent to: ${resetData.email}`)
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
