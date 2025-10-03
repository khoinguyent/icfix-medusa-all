// EmailEngine Service for Notification Integration
// This service provides methods to send emails through EmailEngine API

interface EmailEngineConfig {
  apiUrl: string
  apiKey: string
  accountId: string
}

export class EmailEngineService {
  private apiUrl_: string
  private apiKey_: string
  private accountId_: string

  constructor(options: EmailEngineConfig) {
    this.apiUrl_ = options.apiUrl
    this.apiKey_ = options.apiKey
    this.accountId_ = options.accountId
  }

  async sendEmail(
    to: string,
    subject: string,
    html?: string,
    text?: string,
    from?: { name: string; address: string }
  ): Promise<any> {
    const response = await fetch(`${this.apiUrl_}/api/account/${this.accountId_}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey_}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || {
          name: "Your Store",
          address: "noreply@yourstore.com"
        },
        to: [{ address: to }],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      throw new Error(`EmailEngine API error: ${response.statusText}`)
    }

    return await response.json()
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

export default EmailEngineService
