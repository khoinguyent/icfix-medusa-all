import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import EmailEngineService from "../services/email-engine-notification"
import { Modules } from "@medusajs/framework/utils"

// Initialize EmailEngine service
const emailEngine = new EmailEngineService({
  apiUrl: process.env.EMAILENGINE_API_URL || "https://icfix.duckdns.org/email",
  apiKey: process.env.EMAILENGINE_API_KEY || "",
  accountId: process.env.EMAILENGINE_ACCOUNT_ID || "",
})

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.shipment_created", 
    "user.password_reset",
    "customer.password_reset"
  ],
}

export default async function emailNotificationHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  try {
    switch (event.name) {
      case "order.placed":
        await handleOrderPlaced(event.data, container)
        break
      case "order.shipment_created":
        await handleShippingNotification(event.data, container)
        break
      case "user.password_reset":
      case "customer.password_reset":
        await handlePasswordReset(event.data, container)
        break
      default:
        console.log(`Unhandled email event: ${event.name}`)
    }
  } catch (error) {
    console.error("Email notification error:", error)
  }
}

async function handleOrderPlaced(orderData: any, container: any) {
  try {
    const orderService = container.resolve("order")
    const customerService = container.resolve("customer")
    
    const order = await orderService.retrieveOrder(orderData.id)
    
    if (order.customer?.email) {
      await emailEngine.sendOrderConfirmation(order, order.customer.email)
      console.log(`Order confirmation email sent to ${order.customer.email}`)
    }
  } catch (error) {
    console.error("Error sending order confirmation:", error)
  }
}

async function handleShippingNotification(shipmentData: any, container: any) {
  try {
    const orderService = container.resolve("order")
    
    const shipment = await orderService.retrieveShipment(shipmentData.id, {
      relations: ["order", "order.customer"]
    })
    
    if (shipment.order?.customer?.email) {
      const customerEmail = shipment.order.customer.email
      const trackingNumber = shipment.tracking_number || "N/A"
      
      await emailService.sendEmail(
        customerEmail,
        "Your order has shipped!",
        `
          <h2>Shipping Update</h2>
          <p>Great news! Your order #${shipment.order.id} has been shipped.</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p>You can track your package using the tracking number above.</p>
        `,
        `
Shipping Update

Great news! Your order #${shipment.order.id} has been shipped.

Tracking Number: ${trackingNumber}

You can track your package using the tracking number above.
        `
      )
      
      console.log(`Shipping notification sent to ${customerEmail}`)
    }
  } catch (error) {
    console.error("Error sending shipping notification:", error)
  }
}

async function handlePasswordReset(resetData: any, container: any) {
  try {
    let customerEmail = ""
    
    if (resetData.customer?.email) {
      customerEmail = resetData.customer.email
    } else if (resetData.email) {
      customerEmail = resetData.email
    }
    
    if (customerEmail) {
      await emailService.sendPasswordReset(resetData, customerEmail)
      console.log(`Password reset email sent to ${customerEmail}`)
    }
  } catch (error) {
    console.error("Error sending password reset email:", error)
  }
}
