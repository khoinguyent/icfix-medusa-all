import { AbstractNotificationProviderService } from "@medusajs/utils"
import type { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/types"
import nodemailer from "nodemailer"
import { google } from "googleapis"
import fs from "fs"
import path from "path"

type InjectedDependencies = {
  logger: Logger
}

type GmailOptions = {
  user?: string
  clientId?: string
  clientSecret?: string
  refreshToken?: string
  redirectUri?: string
  storeName?: string
  storeUrl?: string
  channels: string[]
}

/**
 * Gmail OAuth2 Notification Provider for Medusa v2
 */
class GmailNotificationService extends AbstractNotificationProviderService {
  static identifier = "gmail-oauth2"
  
  protected logger_: Logger
  protected options_: GmailOptions
  protected transporter_: any
  protected templatesDir_: string
  protected initialized_: boolean

  constructor(
    { logger }: InjectedDependencies,
    options: GmailOptions
  ) {
    super()
    
    this.logger_ = logger
    this.options_ = {
      ...options,
      user: options.user || process.env.GMAIL_USER,
      clientId: options.clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret: options.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: options.refreshToken || process.env.GOOGLE_REFRESH_TOKEN,
      redirectUri: options.redirectUri || 'https://developers.google.com/oauthplayground',
      storeName: options.storeName || process.env.STORE_NAME || 'Your Store',
      storeUrl: options.storeUrl || process.env.STORE_URL || 'https://yourstore.com',
      channels: options.channels || ['email']
    }

    this.transporter_ = null
    this.templatesDir_ = path.join(__dirname, 'templates')
    this.initialized_ = false

    // Initialize OAuth2 client and transporter
    this.initialize()
  }

  static validateOptions(options: Record<string, any>): void {
    if (!options.channels || !Array.isArray(options.channels)) {
      throw new Error('channels option is required and must be an array')
    }
  }

  async initialize() {
    try {
      if (!this.options_.user || !this.options_.clientId || !this.options_.clientSecret || !this.options_.refreshToken) {
        this.logger_.warn('Gmail OAuth2: Missing required environment variables')
        this.logger_.warn('Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN')
        return
      }

      const oauth2Client = new google.auth.OAuth2(
        this.options_.clientId,
        this.options_.clientSecret,
        this.options_.redirectUri
      )

      oauth2Client.setCredentials({
        refresh_token: this.options_.refreshToken,
      })

      const accessToken = await oauth2Client.getAccessToken()

      this.transporter_ = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: this.options_.user,
          clientId: this.options_.clientId,
          clientSecret: this.options_.clientSecret,
          refreshToken: this.options_.refreshToken,
          accessToken: accessToken.token,
        },
      } as any)

      await this.transporter_.verify()
      this.initialized_ = true
      
      this.logger_.info('✅ Gmail OAuth2 notification service initialized successfully')
      this.logger_.info(`📧 Sending emails from: ${this.options_.user}`)
      
    } catch (error: any) {
      this.logger_.error('❌ Failed to initialize Gmail OAuth2:', error.message)
    }
  }

  loadTemplate(templateName: string, variables: Record<string, any> = {}): string | null {
    try {
      const templatePath = path.join(this.templatesDir_, `${templateName}.html`)
      
      if (!fs.existsSync(templatePath)) {
        this.logger_.error(`Template not found: ${templatePath}`)
        return null
      }

      let html = fs.readFileSync(templatePath, 'utf8')
      
      // Handle Handlebars loops for orderItems
      if (variables.orderItems && Array.isArray(variables.orderItems)) {
        html = this.processHandlebarsLoop(html, 'orderItems', variables.orderItems, variables)
      }
      
      // Replace simple variables
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (key === 'orderItems') return '' // Already processed above
        return variables[key] || ''
      })

      return html
    } catch (error: any) {
      this.logger_.error(`Error loading template ${templateName}:`, error.message)
      return null
    }
  }

  private processHandlebarsLoop(html: string, loopVar: string, items: any[], context: Record<string, any>): string {
    const loopRegex = new RegExp(`\\{\\{#each ${loopVar}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`, 'g')
    
    return html.replace(loopRegex, (match, template) => {
      return items.map(item => {
        let itemHtml = template
        
        // Replace item properties
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
          itemHtml = itemHtml.replace(regex, item[key] || '')
        })
        
        // Replace context variables (like currency)
        Object.keys(context).forEach(key => {
          if (key !== loopVar) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            itemHtml = itemHtml.replace(regex, context[key] || '')
          }
        })
        
        // Handle conditional blocks like {{#if variant}}
        itemHtml = this.processHandlebarsConditionals(itemHtml, item)
        
        return itemHtml
      }).join('')
    })
  }

  private processHandlebarsConditionals(html: string, context: Record<string, any>): string {
    // Handle {{#if variable}}...{{/if}} blocks
    const conditionalRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g
    
    return html.replace(conditionalRegex, (match, variable, content) => {
      if (context[variable] && context[variable] !== '') {
        return content
      }
      return ''
    })
  }

  async sendEmail(options: {
    from?: string
    to: string
    subject: string
    html?: string
    text?: string
  }) {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('Gmail service not initialized')
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
      this.logger_.info(`✅ Email sent to ${options.to}: ${result.messageId}`)
      
      return { success: true, messageId: result.messageId }
    } catch (error: any) {
      this.logger_.error(`Failed to send email:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // Medusa v2 notification provider interface - REQUIRED METHOD
  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    if (!this.initialized_ || !this.transporter_) {
      throw new Error('Gmail notification service not initialized')
    }

    try {
      const { to, data } = notification
      let html = data?.html as string | undefined
      let subject = (data?.subject as string) || 'Notification'
      const template = (data?.template as string) || notification.template

      // Support template-based emails
      if (template) {
        const templateData = data ? { ...data } : {}
        html = this.loadTemplate(template, templateData) || undefined
      }

      if (!html) {
        throw new Error('No email content provided')
      }

      const result = await this.sendEmail({ to, subject, html })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
      }

      return { id: result.messageId || `gmail-${Date.now()}` }
    } catch (error: any) {
      this.logger_.error('Failed to send notification:', error.message)
      throw error
    }
  }

  // Backward compatibility method
  async sendNotification(event: string, data: any): Promise<boolean> {
    if (!this.initialized_) {
      return false
    }

    this.logger_.info(`Processing notification event: ${event}`)

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
          return false
      }
    } catch (error: any) {
      this.logger_.error(`Error processing notification ${event}:`, error.message)
      return false
    }
  }

  async sendOrderPlacedNotification(data: {
    email?: string
    customerName?: string
    orderId?: string
    orderTotal?: number
    currency?: string
    storeUrl?: string
  }): Promise<boolean> {
    const { email, customerName, orderId, orderTotal, currency = 'USD', storeUrl } = data
    if (!email) return false

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Order Confirmation #${orderId}`, 
      html 
    })
    return result.success
  }

  async sendOrderShippedNotification(data: {
    email?: string
    customerName?: string
    orderId?: string
    trackingNumber?: string
    carrier?: string
    storeUrl?: string
  }): Promise<boolean> {
    const { email, customerName, orderId, trackingNumber, carrier, storeUrl } = data
    if (!email) return false

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Your Order #${orderId} Has Shipped!`, 
      html 
    })
    return result.success
  }

  async sendOrderCanceledNotification(data: {
    email?: string
    customerName?: string
    orderId?: string
    reason?: string
    refundAmount?: number
    currency?: string
    storeUrl?: string
  }): Promise<boolean> {
    const { email, customerName, orderId, reason, refundAmount, currency = 'USD', storeUrl } = data
    if (!email) return false

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Order #${orderId} Cancellation Confirmation`, 
      html 
    })
    return result.success
  }

  async sendPasswordResetNotification(data: {
    email?: string
    customerName?: string
    resetLink?: string
    storeUrl?: string
  }): Promise<boolean> {
    const { email, customerName, resetLink, storeUrl } = data
    if (!email || !resetLink) return false

    const templateData = {
      customerName: customerName || 'User',
      resetLink,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    }

    const html = this.loadTemplate('passwordReset', templateData)
    if (!html) return false

    const result = await this.sendEmail({ 
      to: email, 
      subject: 'Password Reset Request', 
      html 
    })
    return result.success
  }
}

export default GmailNotificationService

