import { 
  AbstractNotificationProviderService,
  Logger,
} from "@medusajs/framework/utils"
import { MedusaError } from "@medusajs/framework/utils"
import nodemailer from "nodemailer"
import { google } from "googleapis"
import fs from "fs"
import path from "path"

type GmailProviderOptions = {
  user: string
  clientId: string
  clientSecret: string
  refreshToken: string
  storeName?: string
  storeUrl?: string
  redirectUri?: string
}

type SendOptions = {
  to: string
  subject: string
  html: string
  from?: string
  text?: string
}

class GmailNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-gmail-oauth2"
  
  protected logger_: Logger
  protected options_: GmailProviderOptions
  protected transporter_: any
  protected templatesDir_: string
  protected initialized_: boolean = false

  constructor(container: any, options: GmailProviderOptions) {
    super(container, options)
    
    this.logger_ = container.logger
    this.options_ = {
      redirectUri: 'https://developers.google.com/oauthplayground',
      storeName: 'Your Store',
      storeUrl: 'https://yourstore.com',
      ...options
    }
    
    this.templatesDir_ = path.join(__dirname, '../../templates')
    
    // Initialize OAuth2 and transporter
    this.initialize()
  }

  /**
   * Initialize OAuth2 client and Nodemailer transporter
   */
  async initialize(): Promise<void> {
    try {
      if (!this.options_.user || !this.options_.clientId || 
          !this.options_.clientSecret || !this.options_.refreshToken) {
        this.logger_.error('❌ Gmail OAuth2: Missing required environment variables')
        this.logger_.error('Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN')
        return
      }

      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        this.options_.clientId,
        this.options_.clientSecret,
        this.options_.redirectUri
      )

      oauth2Client.setCredentials({
        refresh_token: this.options_.refreshToken,
      })

      // Get access token
      const accessToken = await oauth2Client.getAccessToken()

      // Create Nodemailer transporter with OAuth2
      this.transporter_ = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.options_.user,
          clientId: this.options_.clientId,
          clientSecret: this.options_.clientSecret,
          refreshToken: this.options_.refreshToken,
          accessToken: accessToken.token,
        },
      })

      // Verify connection
      await this.transporter_.verify()
      this.initialized_ = true
      
      this.logger_.info('✅ Gmail OAuth2 notification service initialized successfully')
      this.logger_.info(`📧 Sending emails from: ${this.options_.user}`)
      
    } catch (error) {
      this.logger_.error('❌ Failed to initialize Gmail OAuth2 notification service:', error)
      this.logger_.error('Please check your OAuth2 credentials and refresh token')
    }
  }

  /**
   * Load HTML template and replace variables
   */
  protected loadTemplate(templateName: string, variables: Record<string, any> = {}): string | null {
    try {
      const templatePath = path.join(this.templatesDir_, `${templateName}.html`)
      
      if (!fs.existsSync(templatePath)) {
        this.logger_.error(`❌ Template not found: ${templatePath}`)
        return null
      }

      let html = fs.readFileSync(templatePath, 'utf8')
      
      // Replace variables in template
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || ''
      })

      return html
    } catch (error: any) {
      this.logger_.error(`❌ Error loading template ${templateName}:`, error.message)
      return null
    }
  }

  /**
   * Send a notification - required by AbstractNotificationProviderService
   */
  async send(
    notification: any
  ): Promise<any> {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send notification.')
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Gmail notification service not initialized'
      )
    }

    try {
      const { to, data, template, channel_type } = notification

      // Only handle email notifications
      if (channel_type && channel_type !== 'email') {
        return { success: false, message: 'Channel not supported' }
      }

      let html: string | null = null
      let subject = data?.subject || 'Notification from Your Store'

      // Handle different notification types
      if (template) {
        html = this.loadTemplate(template, data)
      } else if (data?.html) {
        html = data.html
      }

      if (!html) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'No email content provided'
        )
      }

      const mailOptions = {
        from: `"${this.options_.storeName}" <${this.options_.user}>`,
        to,
        subject,
        html,
      }

      const result = await this.transporter_.sendMail(mailOptions)
      this.logger_.info(`✅ Email sent successfully to ${to}:`, result.messageId)
      
      return {
        success: true,
        messageId: result.messageId,
      }
      
    } catch (error: any) {
      this.logger_.error(`❌ Failed to send email:`, error.message)
      throw error
    }
  }

  /**
   * Send email using custom data
   */
  async sendEmail(options: SendOptions): Promise<any> {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send email.')
      return { success: false }
    }

    try {
      const mailOptions = {
        from: options.from || `"${this.options_.storeName}" <${this.options_.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      const result = await this.transporter_.sendMail(mailOptions)
      this.logger_.info(`✅ Email sent successfully to ${options.to}:`, result.messageId)
      
      return {
        success: true,
        messageId: result.messageId,
      }
      
    } catch (error: any) {
      this.logger_.error(`❌ Failed to send email to ${options.to}:`, error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send notification based on event type (backward compatibility)
   */
  async sendNotification(event: string, data: any): Promise<boolean> {
    if (!this.initialized_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send notification.')
      return false
    }

    this.logger_.info(`📧 Processing notification event: ${event}`)

    try {
      switch (event) {
        case 'order.placed':
          return await this.sendOrderPlacedNotification(data)
        
        case 'order.shipped':
          return await this.sendOrderShippedNotification(data)
        
        case 'order.canceled':
          return await this.sendOrderCanceledNotification(data)
        
        case 'password_reset':
          return await this.sendPasswordResetNotification(data)
        
        default:
          this.logger_.info(`⚠️ Unknown notification event: ${event}`)
          return false
      }
    } catch (error: any) {
      this.logger_.error(`❌ Error processing notification ${event}:`, error.message)
      return false
    }
  }

  /**
   * Send order placed notification
   */
  async sendOrderPlacedNotification(data: any): Promise<boolean> {
    const { email, customerName, orderId, orderTotal, currency = 'USD', storeUrl } = data
    
    if (!email) {
      this.logger_.error('❌ Order placed notification: Missing email address')
      return false
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      orderTotal: orderTotal ? (orderTotal / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || this.options_.storeUrl,
      orderUrl: `${storeUrl || this.options_.storeUrl}/account/orders/${orderId}`,
    }

    const html = this.loadTemplate('orderPlaced', templateData)
    if (!html) return false

    const subject = `Order Confirmation #${orderId}`
    const result = await this.sendEmail({ to: email, subject, html })
    return result.success
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(data: any): Promise<boolean> {
    const { email, customerName, orderId, trackingNumber, carrier, storeUrl } = data
    
    if (!email) {
      this.logger_.error('❌ Order shipped notification: Missing email address')
      return false
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      trackingNumber: trackingNumber || 'TBA',
      carrier: carrier || 'Shipping Carrier',
      storeUrl: storeUrl || this.options_.storeUrl,
      orderUrl: `${storeUrl || this.options_.storeUrl}/account/orders/${orderId}`,
    }

    const html = this.loadTemplate('orderShipped', templateData)
    if (!html) return false

    const subject = `Your Order #${orderId} Has Shipped!`
    const result = await this.sendEmail({ to: email, subject, html })
    return result.success
  }

  /**
   * Send order canceled notification
   */
  async sendOrderCanceledNotification(data: any): Promise<boolean> {
    const { email, customerName, orderId, reason, refundAmount, currency = 'USD', storeUrl } = data
    
    if (!email) {
      this.logger_.error('❌ Order canceled notification: Missing email address')
      return false
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      reason: reason || 'Order cancellation requested',
      refundAmount: refundAmount ? (refundAmount / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    }

    const html = this.loadTemplate('orderCanceled', templateData)
    if (!html) return false

    const subject = `Order #${orderId} Cancellation Confirmation`
    const result = await this.sendEmail({ to: email, subject, html })
    return result.success
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(data: any): Promise<boolean> {
    const { email, customerName, resetLink, storeUrl } = data
    
    if (!email || !resetLink) {
      this.logger_.error('❌ Password reset notification: Missing email or reset link')
      return false
    }

    const templateData = {
      customerName: customerName || 'User',
      resetLink,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    }

    const html = this.loadTemplate('passwordReset', templateData)
    if (!html) return false

    const subject = 'Password Reset Request'
    const result = await this.sendEmail({ to: email, subject, html })
    return result.success
  }
}

export default GmailNotificationProviderService

