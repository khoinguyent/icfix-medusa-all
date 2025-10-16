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
    // Get the notification service registered by the plugin
    const notificationService = container.resolve("notificationService")
    
    if (!notificationService) {
      logger.warn("Notification service not found. Make sure the plugin is properly loaded.")
      return
    }

    logger.info(`📧 Processing email notification for event: ${name}`)

    switch (name) {
      case "order.placed":
        await handleOrderPlaced(data, notificationService, logger)
        break
      
      case "order.shipment_created":
        await handleOrderShipped(data, notificationService, logger)
        break
      
      case "order.canceled":
        await handleOrderCanceled(data, notificationService, logger)
        break
      
      case "customer.password_token_generated":
        await handlePasswordReset(data, notificationService, logger)
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

    await notificationService.sendNotification("order.placed", {
      to: recipientEmail,
      template: "orderPlaced",
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId: display_id || id,
      orderTotal: total ? (total / 100).toFixed(2) : "0.00",
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
      orderUrl: `${process.env.STORE_URL || "https://yourstore.com"}/account/orders/${display_id || id}`,
      subject: `Order Confirmation #${display_id || id}`,
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

    const orderId = orderDetails.display_id || order_id
    
    await notificationService.sendNotification("order.shipped", {
      to: recipientEmail,
      template: "orderShipped",
      customerName: customer.first_name || customer.email || "Customer",
      orderId,
      trackingNumber: fulfillment?.tracking_numbers?.[0] || "TBA",
      carrier: fulfillment?.provider_id || "Shipping Carrier",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
      orderUrl: `${process.env.STORE_URL || "https://yourstore.com"}/account/orders/${orderId}`,
      subject: `Your Order #${orderId} Has Shipped!`,
    })
    
    logger.info(`✅ Shipment notification sent for order: ${orderId}`)
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

    const orderId = display_id || id
    
    await notificationService.sendNotification("order.canceled", {
      to: recipientEmail,
      template: "orderCanceled",
      customerName: customer?.first_name || customer?.email || "Customer",
      orderId,
      reason: cancel_reason || "Order cancellation requested",
      refundAmount: total ? (total / 100).toFixed(2) : "0.00",
      currency: currency_code?.toUpperCase() || "USD",
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
      supportUrl: `${process.env.STORE_URL || "https://yourstore.com"}/contact`,
      subject: `Order #${orderId} Cancellation Confirmation`,
    })
    
    logger.info(`✅ Order cancellation email sent for order: ${orderId}`)
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

    const resetLink = `${process.env.STORE_URL || "https://yourstore.com"}/account/reset-password?token=${token}`
    
    await notificationService.sendNotification("password_reset", {
      to: recipientEmail,
      template: "passwordReset",
      customerName: customer?.first_name || customer?.email || "User",
      resetLink,
      storeUrl: process.env.STORE_URL || "https://yourstore.com",
      supportUrl: `${process.env.STORE_URL || "https://yourstore.com"}/contact`,
      subject: "Password Reset Request",
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
