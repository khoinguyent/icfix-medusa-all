const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Gmail OAuth2 Notification Provider for Medusa v2
 */
class GmailNotificationService {
  static identifier = "gmail-oauth2"
  
  constructor(container, options = {}) {
    this.container_ = container;
    this.logger_ = container?.logger || console;
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

  async initialize() {
    try {
      if (!this.options_.user || !this.options_.clientId || !this.options_.clientSecret || !this.options_.refreshToken) {
        this.logger_.warn('Gmail OAuth2: Missing required environment variables');
        this.logger_.warn('Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
        return;
      }

      const oauth2Client = new google.auth.OAuth2(
        this.options_.clientId,
        this.options_.clientSecret,
        this.options_.redirectUri
      );

      oauth2Client.setCredentials({
        refresh_token: this.options_.refreshToken,
      });

      const accessToken = await oauth2Client.getAccessToken();

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

      await this.transporter_.verify();
      this.initialized_ = true;
      
      this.logger_.info('✅ Gmail OAuth2 notification service initialized successfully');
      this.logger_.info(`📧 Sending emails from: ${this.options_.user}`);
      
    } catch (error) {
      this.logger_.error('❌ Failed to initialize Gmail OAuth2:', error.message);
    }
  }

  loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir_, `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        this.logger_.error(`Template not found: ${templatePath}`);
        return null;
      }

      let html = fs.readFileSync(templatePath, 'utf8');
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || '');

      return html;
    } catch (error) {
      this.logger_.error(`Error loading template ${templateName}:`, error.message);
      return null;
    }
  }

  async sendEmail(options) {
    if (!this.initialized_ || !this.transporter_) {
      this.logger_.error('Gmail service not initialized');
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
      this.logger_.info(`✅ Email sent to ${options.to}:`, result.messageId);
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger_.error(`Failed to send email:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Medusa v2 notification provider interface
  async send(notification) {
    if (!this.initialized_ || !this.transporter_) {
      throw new Error('Gmail notification service not initialized');
    }

    try {
      const { to, data } = notification;
      let html = data?.html;
      let subject = data?.subject || 'Notification';

      if (data?.template) {
        html = this.loadTemplate(data.template, data);
      }

      if (!html) {
        throw new Error('No email content provided');
      }

      return await this.sendEmail({ to, subject, html });
    } catch (error) {
      this.logger_.error('Failed to send notification:', error.message);
      throw error;
    }
  }

  // Backward compatibility method
  async sendNotification(event, data) {
    if (!this.initialized_) {
      return false;
    }

    this.logger_.info(`Processing notification event: ${event}`);

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
          return false;
      }
    } catch (error) {
      this.logger_.error(`Error processing notification ${event}:`, error.message);
      return false;
    }
  }

  async sendOrderPlacedNotification(data) {
    const { email, customerName, orderId, orderTotal, currency = 'USD', storeUrl } = data;
    if (!email) return false;

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Order Confirmation #${orderId}`, 
      html 
    });
    return result.success;
  }

  async sendOrderShippedNotification(data) {
    const { email, customerName, orderId, trackingNumber, carrier, storeUrl } = data;
    if (!email) return false;

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Your Order #${orderId} Has Shipped!`, 
      html 
    });
    return result.success;
  }

  async sendOrderCanceledNotification(data) {
    const { email, customerName, orderId, reason, refundAmount, currency = 'USD', storeUrl } = data;
    if (!email) return false;

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

    const result = await this.sendEmail({ 
      to: email, 
      subject: `Order #${orderId} Cancellation Confirmation`, 
      html 
    });
    return result.success;
  }

  async sendPasswordResetNotification(data) {
    const { email, customerName, resetLink, storeUrl } = data;
    if (!email || !resetLink) return false;

    const templateData = {
      customerName: customerName || 'User',
      resetLink,
      storeUrl: storeUrl || this.options_.storeUrl,
      supportUrl: `${storeUrl || this.options_.storeUrl}/contact`,
    };

    const html = this.loadTemplate('passwordReset', templateData);
    if (!html) return false;

    const result = await this.sendEmail({ 
      to: email, 
      subject: 'Password Reset Request', 
      html 
    });
    return result.success;
  }
}

// Export the service class
module.exports = GmailNotificationService;

// Export default for ES module compatibility
module.exports.default = GmailNotificationService;

// Simple export - no complex loaders that cause circular dependencies
// The simple-email-notifications.ts subscriber will handle email sending directly
