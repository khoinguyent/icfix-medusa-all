# Gmail OAuth2 Notification Plugin

A production-ready Medusa plugin that sends transactional emails using Gmail API OAuth2 over HTTPS. No SMTP ports required!

## 🚀 Features

- ✅ **Gmail OAuth2 Integration** - Secure authentication without passwords
- ✅ **HTTPS Only** - Works on DigitalOcean and other VPS with blocked SMTP ports
- ✅ **Beautiful Email Templates** - Professional HTML templates with inline CSS
- ✅ **Event-Driven** - Automatically sends emails on order/customer events
- ✅ **Production Ready** - Error handling, logging, and graceful failures
- ✅ **Template Variables** - Dynamic content replacement

## 📧 Supported Email Events

- **Order Placed** - Order confirmation with details
- **Order Shipped** - Shipment notification with tracking
- **Order Canceled** - Cancellation confirmation with refund info
- **Password Reset** - Secure password reset link

## 🔧 Setup

### Step 1: Install Dependencies

```bash
cd plugins/notification-gmail-oauth2
npm install
```

### Step 2: Configure Gmail OAuth2

#### Get Google OAuth2 Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**
3. **Enable Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search "Gmail API" and enable it
4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Set user type to "External"
   - Fill in required fields
5. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Set redirect URI: `https://developers.google.com/oauthplayground`
   - Copy **Client ID** and **Client Secret**

#### Generate Refresh Token

1. **Go to OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/
2. **Click Settings** (gear icon) and check "Use your own OAuth credentials"
3. **Enter your Client ID and Client Secret**
4. **In left panel, enter scope**: `https://mail.google.com/`
5. **Click "Authorize APIs"**
6. **Sign in and allow access**
7. **Click "Exchange authorization code for tokens"**
8. **Copy the Refresh Token**

### Step 3: Environment Variables

Add these to your `.env` file:

```bash
# Gmail OAuth2 Configuration
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=1//04xxxxx-your-refresh-token

# Store Configuration (optional)
STORE_NAME="Your Store Name"
STORE_URL=https://yourstore.com
```

### Step 4: Plugin Configuration

The plugin is already configured in `medusa-config.ts`:

```typescript
plugins: [
  {
    resolve: "./plugins/notification-gmail-oauth2",
    options: {
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      storeName: process.env.STORE_NAME || "Your Store",
    },
  },
]
```

### Step 5: Install Plugin Dependencies

```bash
cd /path/to/your/medusa/project
npm install nodemailer googleapis
```

## 🧪 Testing

### Test Email Sending

Create a test script `test-email.js`:

```javascript
import GmailNotificationService from './plugins/notification-gmail-oauth2/index.js';

const gmailService = new GmailNotificationService({}, {
  user: process.env.GMAIL_USER,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
});

// Test order placed notification
await gmailService.sendNotification('order.placed', {
  email: 'test@example.com',
  customerName: 'Test Customer',
  orderId: 'TEST-123',
  orderTotal: 2999,
  currency: 'USD',
  storeUrl: 'https://yourstore.com'
});
```

### Test via Medusa Events

1. **Create a customer** - triggers welcome email
2. **Place an order** - triggers order confirmation
3. **Mark order as shipped** - triggers shipment notification
4. **Cancel an order** - triggers cancellation email

## 📋 Email Templates

### Template Variables

All templates support these variables:

- `{{customerName}}` - Customer's first name
- `{{orderId}}` - Order number/ID
- `{{orderTotal}}` - Order total (formatted)
- `{{currency}}` - Currency code
- `{{storeUrl}}` - Store URL
- `{{resetLink}}` - Password reset link (password reset only)
- `{{trackingNumber}}` - Tracking number (shipped only)
- `{{carrier}}` - Shipping carrier (shipped only)

### Customizing Templates

Edit the HTML files in `templates/` directory:

- `orderPlaced.html` - Order confirmation
- `orderShipped.html` - Shipment notification  
- `orderCanceled.html` - Cancellation confirmation
- `passwordReset.html` - Password reset

All templates use inline CSS for maximum compatibility.

## 🔍 Troubleshooting

### Common Issues

#### "Gmail service not initialized"
- Check that all environment variables are set
- Verify OAuth2 credentials are correct
- Ensure refresh token is valid (regenerate if needed)

#### "Template not found"
- Verify template files exist in `templates/` directory
- Check file permissions

#### "Failed to send email"
- Check Gmail API quota limits
- Verify sender email is authorized
- Check recipient email is valid

### Debug Logging

The plugin logs all activities to console:

```
✅ Gmail OAuth2 notification service initialized successfully
📧 Sending emails from: your-email@gmail.com
📧 Processing notification event: order.placed
✅ Email sent successfully to customer@example.com: <message-id>
```

### Gmail API Limits

- **Free Gmail accounts**: 500 emails/day
- **Google Workspace**: 2,000 emails/day
- **Rate limit**: 1 email per second

## 🚀 Production Considerations

### Security
- Never commit OAuth2 credentials to version control
- Use environment variables for all sensitive data
- Rotate refresh tokens periodically
- Monitor Gmail API usage

### Performance
- Templates are loaded once at startup
- OAuth2 tokens are cached and refreshed automatically
- Failed emails don't crash the application

### Monitoring
- Monitor Gmail API quota usage
- Set up alerts for email failures
- Track delivery rates in Gmail dashboard

## 📚 API Reference

### GmailNotificationService

#### Constructor
```javascript
new GmailNotificationService(container, options)
```

#### Methods

**`sendMail(to, subject, html)`**
- Sends a raw email
- Returns: `Promise<boolean>`

**`sendNotification(event, data)`**
- Sends event-based notification
- Events: `order.placed`, `order.shipped`, `order.canceled`, `password_reset`
- Returns: `Promise<boolean>`

**`loadTemplate(templateName, variables)`**
- Loads and processes HTML template
- Returns: `string` (HTML) or `null`

## 🔄 Migration from SMTP

If you're migrating from SMTP-based email:

1. **Keep existing subscribers** - they'll work with the new plugin
2. **Update environment variables** - replace SMTP vars with OAuth2 vars
3. **Test thoroughly** - verify all email events work
4. **Monitor delivery** - check Gmail dashboard for delivery stats

## 📞 Support

For issues:
1. Check console logs for error messages
2. Verify OAuth2 credentials in Google Cloud Console
3. Test with Gmail API directly
4. Check Gmail API quota and limits

## 📄 License

MIT License - feel free to modify and use in your projects.

---

**Built for Medusa v2** - Works seamlessly with DigitalOcean and other VPS providers that block SMTP ports.
