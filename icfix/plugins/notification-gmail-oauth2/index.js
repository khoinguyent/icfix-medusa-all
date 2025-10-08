import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gmail OAuth2 Notification Plugin for Medusa
 * Sends transactional emails using Gmail API over HTTPS (no SMTP ports required)
 */
class GmailNotificationService {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      user: options.user || process.env.GMAIL_USER,
      clientId: options.clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret: options.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: options.refreshToken || process.env.GOOGLE_REFRESH_TOKEN,
      redirectUri: 'https://developers.google.com/oauthplayground',
      ...options
    };

    this.transporter = null;
    this.templatesDir = path.join(__dirname, 'templates');
    this.initialized = false;

    // Initialize OAuth2 client and transporter
    this.initialize();
  }

  /**
   * Initialize OAuth2 client and Nodemailer transporter
   */
  async initialize() {
    try {
      if (!this.options.user || !this.options.clientId || !this.options.clientSecret || !this.options.refreshToken) {
        console.error('❌ Gmail OAuth2: Missing required environment variables');
        console.error('Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
        return;
      }

      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        this.options.clientId,
        this.options.clientSecret,
        this.options.redirectUri
      );

      oauth2Client.setCredentials({
        refresh_token: this.options.refreshToken,
      });

      // Get access token
      const accessToken = await oauth2Client.getAccessToken();

      // Create Nodemailer transporter with OAuth2
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.options.user,
          clientId: this.options.clientId,
          clientSecret: this.options.clientSecret,
          refreshToken: this.options.refreshToken,
          accessToken: accessToken.token,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      
      console.log('✅ Gmail OAuth2 notification service initialized successfully');
      console.log(`📧 Sending emails from: ${this.options.user}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Gmail OAuth2 notification service:', error.message);
      console.error('Please check your OAuth2 credentials and refresh token');
    }
  }

  /**
   * Load HTML template and replace variables
   */
  loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template not found: ${templatePath}`);
        return null;
      }

      let html = fs.readFileSync(templatePath, 'utf8');
      
      // Replace variables in template
      html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || '';
      });

      return html;
    } catch (error) {
      console.error(`❌ Error loading template ${templateName}:`, error.message);
      return null;
    }
  }

  /**
   * Send email using Nodemailer
   */
  async sendMail(to, subject, html) {
    if (!this.initialized || !this.transporter) {
      console.error('❌ Gmail service not initialized. Cannot send email.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.options.storeName || 'Your Store'}" <${this.options.user}>`,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  /**
   * Send notification based on event type
   */
  async sendNotification(event, data) {
    if (!this.initialized) {
      console.error('❌ Gmail service not initialized. Cannot send notification.');
      return false;
    }

    console.log(`📧 Processing notification event: ${event}`);

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
          console.log(`⚠️ Unknown notification event: ${event}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Error processing notification ${event}:`, error.message);
      return false;
    }
  }

  /**
   * Send order placed notification
   */
  async sendOrderPlacedNotification(data) {
    const { email, customerName, orderId, orderTotal, currency = 'USD', storeUrl } = data;
    
    if (!email) {
      console.error('❌ Order placed notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      orderTotal: orderTotal ? (orderTotal / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || 'https://yourstore.com',
      orderUrl: `${storeUrl}/account/orders/${orderId}`,
    };

    const html = this.loadTemplate('orderPlaced', templateData);
    if (!html) return false;

    const subject = `Order Confirmation #${orderId}`;
    return await this.sendMail(email, subject, html);
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(data) {
    const { email, customerName, orderId, trackingNumber, carrier, storeUrl } = data;
    
    if (!email) {
      console.error('❌ Order shipped notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      trackingNumber: trackingNumber || 'TBA',
      carrier: carrier || 'Shipping Carrier',
      storeUrl: storeUrl || 'https://yourstore.com',
      orderUrl: `${storeUrl}/account/orders/${orderId}`,
    };

    const html = this.loadTemplate('orderShipped', templateData);
    if (!html) return false;

    const subject = `Your Order #${orderId} Has Shipped!`;
    return await this.sendMail(email, subject, html);
  }

  /**
   * Send order canceled notification
   */
  async sendOrderCanceledNotification(data) {
    const { email, customerName, orderId, reason, refundAmount, currency = 'USD', storeUrl } = data;
    
    if (!email) {
      console.error('❌ Order canceled notification: Missing email address');
      return false;
    }

    const templateData = {
      customerName: customerName || 'Customer',
      orderId: orderId || 'N/A',
      reason: reason || 'Order cancellation requested',
      refundAmount: refundAmount ? (refundAmount / 100).toFixed(2) : '0.00',
      currency,
      storeUrl: storeUrl || 'https://yourstore.com',
      supportUrl: `${storeUrl}/contact`,
    };

    const html = this.loadTemplate('orderCanceled', templateData);
    if (!html) return false;

    const subject = `Order #${orderId} Cancellation Confirmation`;
    return await this.sendMail(email, subject, html);
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(data) {
    const { email, customerName, resetLink, storeUrl } = data;
    
    if (!email || !resetLink) {
      console.error('❌ Password reset notification: Missing email or reset link');
      return false;
    }

    const templateData = {
      customerName: customerName || 'User',
      resetLink,
      storeUrl: storeUrl || 'https://yourstore.com',
      supportUrl: `${storeUrl}/contact`,
    };

    const html = this.loadTemplate('passwordReset', templateData);
    if (!html) return false;

    const subject = 'Password Reset Request';
    return await this.sendMail(email, subject, html);
  }
}

export default GmailNotificationService;
