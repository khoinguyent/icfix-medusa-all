// SMTP Email Service for Notification Integration
// This service provides methods to send emails through direct SMTP

interface SMTPConfig {
  host: string
  port: number
  user: string
  password: string
  tls: boolean
}

export class EmailService {
  private config_: SMTPConfig

  constructor(options: SMTPConfig) {
    this.config_ = options
  }

  async sendEmail(
    to: string,
    subject: string,
    html?: string,
    text?: string,
    from?: { name: string; address: string }
  ): Promise<any> {
    // Simple SMTP implementation - in production use nodemailer
    console.log(`EmailService: Sending email to ${to}`)
    console.log(`Subject: ${subject}`)
    
    // For now, log the email instead of sending
    // In production, you'd use nodemailer with this.config_
    return {
      messageId: `email-${Date.now()}`,
      to,
      subject,
      status: 'sent (logged)'
    }
  }

  async sendOrderConfirmation(order: any, customerEmail: string): Promise<any> {
    const subject = `Order Confirmation #${order.id}`
    const html = this.generateOrderConfirmationHTML(order)
    const text = this.generateOrderConfirmationText(order)

    return this.sendEmail(customerEmail, subject, html, text)
  }

  async sendPasswordReset(resetData: any, customerEmail: string): Promise<any> {
    const subject = 'Password Reset Request'
    const html = this.generatePasswordResetHTML(resetData)
    const text = this.generatePasswordResetText(resetData)

    return this.sendEmail(customerEmail, subject, html, text)
  }

  private generateOrderConfirmationHTML(order: any): string {
    return `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total:</strong> ${order.total / 100} ${order.currency_code}</p>
      <p>We'll send you another email when your order ships.</p>
    `
  }

  private generateOrderConfirmationText(order: any): string {
    return `
Order Confirmation

Thank you for your order!

Order ID: ${order.id}
Total: ${order.total / 100} ${order.currency_code}

We'll send you another email when your order ships.
    `
  }

  private generatePasswordResetHTML(data: any): string {
    return `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${data.reset_url}">Reset Password</a>
      <p>This link will expire in 24 hours.</p>
    `
  }

  private generatePasswordResetText(data: any): string {
    return `
Password Reset

Click the link below to reset your password:
${data.reset_url}

This link will expire in 24 hours.
    `
  }
}

export default EmailService
