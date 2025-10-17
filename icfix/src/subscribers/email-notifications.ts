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
    // Get the Notification Module service (Medusa's built-in notification system)
    const notificationModuleService = container.resolve("notification")
    
    if (!notificationModuleService) {
      logger.warn("Notification Module service not found.")
      return
    }

    logger.info(`📧 Processing email notification for event: ${name}`)

    switch (name) {
      case "order.placed":
        await handleOrderPlaced(data, notificationModuleService, logger)
        break
      
      case "order.shipment_created":
        await handleOrderShipped(data, notificationModuleService, logger)
        break
      
      case "order.canceled":
        await handleOrderCanceled(data, notificationModuleService, logger)
        break
      
      case "customer.password_token_generated":
        await handlePasswordReset(data, notificationModuleService, logger)
        break
      
      default:
        logger.info(`No email notification configured for event: ${name}`)
    }
  } catch (error) {
    logger.error(`Error processing email notification for event ${name}:`, error)
  }
}

async function handleOrderPlaced(data: any, notificationService: any, logger: any) {
  try {
    const { id, email, customer, total, currency_code, display_id } = data

    const recipientEmail = email || customer?.email
    if (!recipientEmail) {
      logger.warn("Order placed notification: No email address found")
      return
    }

    await notificationService.createNotifications({
      to: recipientEmail,
      channel: "email",
      template: "order-placed",
      data: {
        customerName: customer?.first_name || customer?.email || "Customer",
        orderId: display_id || id,
        orderTotal: total || 0,
        currency: currency_code?.toUpperCase() || "USD",
        storeUrl: process.env.STORE_URL || "https://yourstore.com",
      },
    })
    
    logger.info(`✅ Order confirmation email sent for order: ${display_id || id}`)
  } catch (error) {
    logger.error(`Failed to send order placed notification:`, error)
  }
}

async function handleOrderShipped(data: any, notificationService: any, logger: any) {
  try {
    const { order_id, fulfillment, order } = data

    // Get order details if available
    const orderDetails = order || {}
    const customer = orderDetails.customer || {}
    
    const recipientEmail = customer.email || orderDetails.email
    if (!recipientEmail) {
      logger.warn("Order shipped notification: No email address found")
      return
    }

    await notificationService.createNotifications({
      to: recipientEmail,
      channel: "email",
      template: "order-shipped",
      data: {
        customerName: customer.first_name || customer.email || "Customer",
        orderId: orderDetails.display_id || order_id,
        trackingNumber: fulfillment?.tracking_numbers?.[0] || "TBA",
        carrier: fulfillment?.provider_id || "Shipping Carrier",
        storeUrl: process.env.STORE_URL || "https://yourstore.com",
      },
    })
    
    logger.info(`✅ Shipment notification sent for order: ${orderDetails.display_id || order_id}`)
  } catch (error) {
    logger.error(`Failed to send order shipped notification:`, error)
  }
}

async function handleOrderCanceled(data: any, notificationService: any, logger: any) {
  try {
    const { id, email, customer, total, currency_code, display_id, cancel_reason } = data

    const recipientEmail = email || customer?.email
    if (!recipientEmail) {
      logger.warn("Order canceled notification: No email address found")
      return
    }

    await notificationService.createNotifications({
      to: recipientEmail,
      channel: "email",
      template: "order-canceled",
      data: {
        customerName: customer?.first_name || customer?.email || "Customer",
        orderId: display_id || id,
        reason: cancel_reason || "Order cancellation requested",
        refundAmount: total || 0,
        currency: currency_code?.toUpperCase() || "USD",
        storeUrl: process.env.STORE_URL || "https://yourstore.com",
      },
    })
    
    logger.info(`✅ Order cancellation email sent for order: ${display_id || id}`)
  } catch (error) {
    logger.error(`Failed to send order canceled notification:`, error)
  }
}

async function handlePasswordReset(data: any, notificationService: any, logger: any) {
  try {
    const { customer_id, token, customer } = data

    const recipientEmail = customer?.email || data.email
    if (!recipientEmail) {
      logger.warn("Password reset notification: No email address found")
      return
    }

    await notificationService.createNotifications({
      to: recipientEmail,
      channel: "email",
      template: "password-reset",
      data: {
        customerName: customer?.first_name || customer?.email || "User",
        resetLink: `${process.env.STORE_URL || "https://yourstore.com"}/account/reset-password?token=${token}`,
        storeUrl: process.env.STORE_URL || "https://yourstore.com",
      },
    })
    
    logger.info(`✅ Password reset email sent to: ${recipientEmail}`)
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
