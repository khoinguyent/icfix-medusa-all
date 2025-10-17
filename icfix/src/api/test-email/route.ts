import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Test Email API Endpoint
 * 
 * Usage: POST http://localhost:9000/test-email
 * Body: { "email": "recipient@example.com" }
 */

const GmailNotificationService = require("../../../plugins/notification-gmail-oauth2/index.js")

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger")
  
  try {
    const { email } = req.body as { email?: string }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required in request body"
      })
    }
    
    logger.info(`📧 Testing email send to: ${email}`)
    
    // Get environment variables
    const options = {
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      storeName: process.env.STORE_NAME || 'Your Store',
      storeUrl: process.env.STORE_URL || 'https://yourstore.com',
    }
    
    // Check if credentials are configured
    if (!options.user || !options.clientId || !options.clientSecret || !options.refreshToken) {
      return res.status(500).json({
        success: false,
        message: "Gmail OAuth2 credentials not configured. Please set GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env file."
      })
    }
    
    logger.info("🔧 Creating Gmail service instance...")
    
    // Create mock container with logger
    const mockContainer = {
      logger,
      resolve: (key: string) => {
        if (key === "logger") return logger
        throw new Error(`Cannot resolve ${key}`)
      }
    }
    
    // Create Gmail service
    const gmailService = new GmailNotificationService(mockContainer, options)
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    logger.info("📤 Sending test email...")
    
    // Send test order confirmation
    const result = await gmailService.sendNotification('order.placed', {
      email,
      customerName: 'Test Customer',
      orderId: 'TEST-' + Date.now(),
      orderTotal: 9999, // $99.99 in cents
      currency: 'USD',
      storeUrl: options.storeUrl,
    })
    
    if (result) {
      logger.info(`✅ Test email sent successfully to ${email}`)
      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: {
          type: 'Order Confirmation',
          recipient: email,
          from: options.user
        }
      })
    } else {
      logger.warn(`⚠️  Email sending returned false`)
      return res.status(500).json({
        success: false,
        message: "Email sending failed. Check server logs for details."
      })
    }
    
  } catch (error: any) {
    logger.error("❌ Error sending test email:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send test email",
      error: error.toString()
    })
  }
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  return res.json({
    message: "Gmail Test Email Endpoint",
    usage: {
      method: "POST",
      endpoint: "/test-email",
      body: {
        email: "recipient@example.com"
      }
    },
    example: `curl -X POST http://localhost:9000/test-email -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`
  })
}

