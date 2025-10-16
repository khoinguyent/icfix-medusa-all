const { NotificationService } = require("@medusajs/medusa")
const nodemailer = require("nodemailer")
const { google } = require("googleapis")
const fs = require("fs")
const path = require("path")

class NodemailerNotificationService extends NotificationService {
  static identifier = "nodemailer"

  constructor(container, options) {
    super(container, options)
    this.container_ = container
    this.options_ = options
    this.logger_ = container.logger || console
    this.transporter_ = null
    this.templatesDir_ = path.join(__dirname, "../templates")
    
    // Initialize transporter
    this.initialize()
  }

  async initialize() {
    try {
      const { authType, smtpHost, smtpPort, user, pass, clientId, clientSecret, refreshToken } = this.options_

      if (!user) {
        this.logger_.warn("Nodemailer: Missing email user")
        return
      }

      if (authType === "oauth2") {
        // Gmail OAuth2
        if (!clientId || !clientSecret || !refreshToken) {
          this.logger_.warn("Nodemailer: Missing OAuth2 credentials")
          return
        }

        const oauth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          'https://developers.google.com/oauthplayground'
        )

        oauth2Client.setCredentials({
          refresh_token: refreshToken,
        })

        const accessToken = await oauth2Client.getAccessToken()

        this.transporter_ = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user,
            clientId,
            clientSecret,
            refreshToken,
            accessToken: accessToken.token,
          },
        })

        this.logger_.info("✅ Nodemailer initialized with Gmail OAuth2")
      } else {
        // Standard SMTP
        if (!pass) {
          this.logger_.warn("Nodemailer: Missing SMTP password")
          return
        }

        this.transporter_ = nodemailer.createTransport({
          host: smtpHost || "smtp.gmail.com",
          port: smtpPort || 465,
          secure: true,
          auth: {
            user,
            pass,
          },
        })

        this.logger_.info("✅ Nodemailer initialized with SMTP")
      }

      // Verify connection
      await this.transporter_.verify()
      this.logger_.info(`📧 Sending emails from: ${user}`)
      
    } catch (error) {
      this.logger_.error("❌ Failed to initialize Nodemailer:", error.message)
    }
  }

  loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir_, `${templateName}.html`)
      
      if (!fs.existsSync(templatePath)) {
        return null
      }

      let html = fs.readFileSync(templatePath, 'utf8')
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || '')

      return html
    } catch (error) {
      this.logger_.error(`Error loading template ${templateName}:`, error.message)
      return null
    }
  }

  async sendNotification(event, data, attachmentGenerator) {
    if (!this.transporter_) {
      this.logger_.error("Nodemailer: Transporter not initialized")
      throw new Error("Nodemailer transporter not initialized")
    }

    try {
      const { to, subject, text, html, template, ...templateVars } = data
      const { storeName = "Your Store" } = this.options_

      let emailHtml = html
      let emailSubject = subject || `Notification: ${event}`

      // Try to load template if specified
      if (template) {
        emailHtml = this.loadTemplate(template, { ...templateVars, storeName })
      }

      const mailOptions = {
        from: `"${storeName}" <${this.options_.user}>`,
        to,
        subject: emailSubject,
        text: text || "No content",
        html: emailHtml || text || "No content",
      }

      const result = await this.transporter_.sendMail(mailOptions)
      
      this.logger_.info(`✅ Email sent to ${to} for event: ${event}`)
      
      return { 
        to, 
        status: "sent", 
        data,
        messageId: result.messageId 
      }
    } catch (error) {
      this.logger_.error(`Failed to send email for event ${event}:`, error.message)
      throw error
    }
  }

  async resendNotification(notification, config, attachmentGenerator) {
    return this.sendNotification(
      notification.event_name, 
      notification.data,
      attachmentGenerator
    )
  }
}

module.exports = NodemailerNotificationService

