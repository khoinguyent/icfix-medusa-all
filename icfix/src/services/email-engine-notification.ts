import { AbstractNotificationService, NotificationServiceContext } from "@medusajs/medusa"

interface EmailEngineConfig {
  apiUrl: string
  apiKey: string
  accountId: string
}

class EmailEngineNotificationService extends AbstractNotificationService {
  protected apiUrl_: string
  protected apiKey_: string
  protected accountId_: string

  constructor(container: any, options: EmailEngineConfig) {
    super(container)
    this.apiUrl_ = options.apiUrl
    this.apiKey_ = options.apiKey
    this.accountId_ = options.accountId
  }

  async sendNotification(
    event: string,
    data: any,
    recipient: string,
    options: NotificationServiceContext = {}
  ): Promise<{ to: string; status: string; data: Record<string, unknown> }> {
    const emailData = this.prepareEmailData(event, data, recipient)

    try {
      const response = await fetch(`${this.apiUrl_}/api/account/${this.accountId_}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey_}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: {
            name: "Your Store",
            address: "noreply@yourstore.com"
          },
          to: [{ address: recipient }],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      })

      if (!response.ok) {
        throw new Error(`EmailEngine API error: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        to: recipient,
        status: 'sent',
        data: result,
      }
    } catch (error) {
      console.error('EmailEngine notification error:', error)
      throw error
    }
  }

  private prepareEmailData(event: string, data: any, recipient: string) {
    // Customize email templates based on the event type
    switch (event) {
      case 'order.placed':
        return {
          subject: `Order Confirmation #${data.id}`,
          html: this.generateOrderConfirmationHTML(data),
          text: this.generateOrderConfirmationText(data),
        }
      case 'user.password_reset':
        return {
          subject: 'Password Reset Request',
          html: this.generatePasswordResetHTML(data),
          text: this.generatePasswordResetText(data),
        }
      default:
        return {
          subject: 'Notification from Your Store',
          html: `<p>You have a new notification from your store.</p>`,
          text: 'You have a new notification from your store.',
        }
    }
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

export default EmailEngineNotificationService

