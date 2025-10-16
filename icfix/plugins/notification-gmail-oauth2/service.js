const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Gmail OAuth2 Notification Provider for Medusa v2
 * Implements notification service pattern
 */
class GmailNotificationService {
  static identifier = "notification-gmail-oauth2"
  
  constructor(container, options = {}) {
    this.container = container;
    this.logger_ = container.logger || console;
    this.options_ = {
      user: options.user || process.env.GMAIL_USER,
      clientId: options.clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret: options.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: options.refreshToken || process.env.GOOGLE_REFRESH_TOKEN,
      redirectUri: 'https://developers.google.com/oauthplayground',
      storeName: options.storeName || 'Your Store',
      storeUrl: options.storeUrl || 'https://yourstore.com',
      ...options
    };

    this.transporter_ = null;
    this.templatesDir_ = path.join(__dirname, 'templates');
    this.initialized_ = false;

    // Initialize OAuth2 client and transporter
    this.initialize();
  }

  /**
   * Initialize OAuth2 client and Nodemailer transporter
   */
  async initialize() {
    try {
      if (!this.options_.user || !this.options_.clientId || !this.options_.clientSecret || !this.options_.refreshToken) {
        this.logger_.error('❌ Gmail OAuth2: Missing required environment variables');
        this.logger_.error('Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
        return;
      }

      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        this.options_.clientId,
        this.options_.clientSecret,
        this.options_.redirectUri
      );

      oauth2Client.setCredentials({
        refresh_token: this.options_.refreshToken,
      });

      // Get access token
      const accessToken = await oauth2Client.getAccessToken();

      // Create Nodemailer transporter with OAuth2
      this.transporter_ = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.options_.user,
          clientId: this.options_.clientId,
          clientSecret: this.options_.clientSecret,
          refreshToken: this.options_.refreshToken,
          accessToken: accessToken.token,
        },
      });

      // Verify connection
      await this.transporter_.verify();
      this.initialized_ = true;
      
      this.logger_.info('✅ Gmail OAuth2 notification service initialized successfully');
      this.logger_.info(`📧 Sending emails from: ${this.options_.user}`);
      
    } catch (error) {
      this.logger_.error('❌ Failed to initialize Gmail OAuth2 notification service:', error.message);
      this.logger_.error('Please check your OAuth2 credentials and refresh token');
    }
  }

  /**
   * Load HTML template and replace variables
   */
  loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir_, `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        this.logger_.error(`❌ Template not found: ${templatePath}`);
        return null;
      }

      let html = fs.readFileSync(templatePath, 'utf8');
      
      // Replace variables in template
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || '';
      });

      return html;
    } catch (error) {
      this.logger_.error(`❌ Error loading template ${templateName}:`, error.message);
      return null;
    }
  }

  /**
   * Send email using Nodemailer
   */
  async sendEmail(options) {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send email.');
      return { success: false };
    }

    try {
      const mailOptions = {
        from: options.from || `"${this.options_.storeName}" <${this.options_.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter_.sendMail(mailOptions);
      this.logger_.info(`✅ Email sent successfully to ${options.to}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
      };
      
    } catch (error) {
      this.logger_.error(`❌ Failed to send email to ${options.to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification - Medusa v2 pattern
   */
  async send(notification) {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send notification.');
      throw new Error('Gmail notification service not initialized');
    }

    try {
      const { to, data } = notification;
      let html = null;
      let subject = data?.subject || 'Notification from Your Store';

      // Handle different notification types
      if (data?.template) {
        html = this.loadTemplate(data.template, data);
      } else if (data?.html) {
        html = data.html;
      }

      if (!html) {
        throw new Error('No email content provided');
      }

      const result = await this.sendEmail({
        to,
        subject,
        html,
      });
      
      return result;
      
    } catch (error) {
      this.logger_.error(`❌ Failed to send notification:`, error.message);
      throw error;
    }
  }

  /**
   * Send notification based on event type (backward compatibility)
   */
  async sendNotification(event, data) {
    if (!this.initialized_) {
      this.logger_.error('❌ Gmail service not initialized. Cannot send notification.');
      return false;
    }

    this.logger_.info(`📧 Processing notification event: ${event}`);

    try {
      switch (event) {
        case 'order.placed':
          return await this.sendOrderPlacedNotification(data);
        
        case 'order.shipped':
          return await this.sendOrderShippedNotification(data);
        
        case 'order.canceled':
          return await this.sendOrderCanceledNotification(data);
        
        case 'password_reset':
          return await this.sendPasswordResetNotification(data);
        
        default:
          this.logger_.info(`⚠️ Unknown notification event: ${event}`);
          return false;
      }
    } catch (error) {
      this.logger_.error(`❌ Error processing notification ${event}:`, error.message);
      return false;
    }
  }

  /**
   * Send order placed notification
   */
  async sendOrderPlacedNotification(data) {
    const { email, customerName, orderId, orderTotal, currency = 'USD', storeUrl } = data;
    
    if (!email) {
      this.logger_.error('❌ Order placed notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      orderTotal: orderTotal ? (orderTotal / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || this.options_.storeUrl,
      orderUrl: `${storeUrl || this.options_.storeUrl}/account/orders/${orderId}`,
    };

    const html = this.loadTemplate('orderPlaced', templateData);
    if (!html) return false;

    const subject = `Order Confirmation #${orderId}`;
    const result = await this.sendEmail({ to: email, subject, html });
    return result.success;
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(data) {
    const { email, customerName, orderId, trackingNumber, carrier, storeUrl } = data;
    
    if (!email) {
      this.logger_.error('❌ Order shipped notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      trackingNumber: trackingNumber || 'TBA',
      carrier: carrier || 'Shipping Carrier',
      storeUrl: storeUrl || this.options_.storeUrl,
      orderUrl: `${storeUrl || this.options_.storeUrl}/account/orders/${orderId}`,
    };

    const html = this.loadTemplate('orderShipped', templateData);
    if (!html) return false;

    const subject = `Your Order #${orderId} Has Shipped!`;
    const result = await this.sendEmail({ to: email, subject, html });
    return result.success;
  }

  /**
   * Send order canceled notification
   */
  async sendOrderCanceledNotification(data) {
    const { email, customerName, orderId, reason, refundAmount, currency = 'USD', storeUrl } = data;
    
    if (!email) {
      this.logger_.error('❌ Order canceled notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      reason: reason || 'Order cancellation requested',
      refundAmount: refundAmount ? (refundAmount / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    };

    const html = this.loadTemplate('orderCanceled', templateData);
    if (!html) return false;

    const subject = `Order #${orderId} Cancellation Confirmation`;
    const result = await this.sendEmail({ to: email, subject, html });
    return result.success;
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(data) {
    const { email, customerName, resetLink, storeUrl } = data;
    
    if (!email || !resetLink) {
      this.logger_.error('❌ Password reset notification: Missing email or reset link');
      return false;
    }

    const templateData = {
      customerName: customerName || 'User',
      resetLink,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    };

    const html = this.loadTemplate('passwordReset', templateData);
    if (!html) return false;

    const subject = 'Password Reset Request';
    const result = await this.sendEmail({ to: email, subject, html });
    return result.success;
  }
}

module.exports = GmailNotificationService;

