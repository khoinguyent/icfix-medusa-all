# Gmail OAuth2 Integration Setup Guide

Complete guide to integrate Gmail with OAuth 2.0 for sending transactional emails in your Medusa store.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Google Cloud Console Setup](#step-1-google-cloud-console-setup)
- [Step 2: Enable Gmail API](#step-2-enable-gmail-api)
- [Step 3: Configure OAuth Consent Screen](#step-3-configure-oauth-consent-screen)
- [Step 4: Create OAuth2 Credentials](#step-4-create-oauth2-credentials)
- [Step 5: Generate Refresh Token](#step-5-generate-refresh-token)
- [Step 6: Configure Medusa](#step-6-configure-medusa)
- [Step 7: Build and Deploy](#step-7-build-and-deploy)
- [Step 8: Testing](#step-8-testing)
- [Troubleshooting](#troubleshooting)
- [Email Templates](#email-templates)

---

## Overview

This integration uses **Gmail OAuth2** to send transactional emails through Gmail's API over HTTPS. This approach:

- ✅ Works on servers with blocked SMTP ports (port 25, 465, 587)
- ✅ More secure than app-specific passwords
- ✅ No "Less Secure Apps" required
- ✅ Full Gmail API access with proper authentication
- ✅ Automatic token refresh

**What emails are sent:**
- Order confirmation emails
- Order shipped notifications
- Order cancellation confirmations
- Password reset emails

---

## Prerequisites

- A Gmail account (personal or Google Workspace)
- Access to Google Cloud Console
- Medusa v2 project
- Admin access to your server

---

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top (next to "Google Cloud")
4. Click **"NEW PROJECT"**
5. Enter project details:
   - **Project name**: `Medusa Email Service` (or your preferred name)
   - **Organization**: Leave as default or select your organization
6. Click **"CREATE"**
7. Wait for the project to be created (usually takes a few seconds)
8. Select your new project from the project dropdown

> 💡 **Tip**: Note down your Project ID - you might need it later

---

## Step 2: Enable Gmail API

### 2.1 Enable the Gmail API

1. In Google Cloud Console, go to the **Navigation Menu** (☰) > **APIs & Services** > **Library**
2. In the search bar, type: `Gmail API`
3. Click on **Gmail API** from the results
4. Click the **"ENABLE"** button
5. Wait for the API to be enabled (usually instant)

### 2.2 Verify API is Enabled

1. Go to **Navigation Menu** (☰) > **APIs & Services** > **Dashboard**
2. You should see "Gmail API" in the list of enabled APIs
3. Click on it to see the API details and quotas

> 📊 **Gmail API Quotas**:
> - Free Gmail: 500 emails/day
> - Google Workspace: 2,000 emails/day
> - Rate limit: ~1 email per second

---

## Step 3: Configure OAuth Consent Screen

### 3.1 Configure Consent Screen

1. Go to **Navigation Menu** (☰) > **APIs & Services** > **OAuth consent screen**
2. Select **User Type**:
   - **External**: For personal Gmail accounts or testing (recommended)
   - **Internal**: For Google Workspace domains only
3. Click **"CREATE"**

### 3.2 Fill in App Information

**OAuth consent screen** page:

1. **App name**: `Medusa Store Emails` (or your store name)
2. **User support email**: Select your email from dropdown
3. **App logo**: (Optional) Upload your store logo
4. **Application home page**: Your store URL (e.g., `https://yourstore.com`)
5. **Application privacy policy link**: Your privacy policy URL (optional)
6. **Application terms of service link**: Your terms URL (optional)
7. **Authorized domains**: Add your domain (e.g., `yourstore.com`)
8. **Developer contact information**: Enter your email address
9. Click **"SAVE AND CONTINUE"**

### 3.3 Configure Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. In the filter box, search for: `gmail`
3. Select the following scope:
   - `https://mail.google.com/` - Full Gmail access (required for sending)
   
   > ⚠️ **Important**: Use the full `https://mail.google.com/` scope, not just `gmail.send`

4. Click **"UPDATE"**
5. Verify the scope appears in the list
6. Click **"SAVE AND CONTINUE"**

### 3.4 Test Users (for External apps)

If you selected "External" user type:

1. Click **"ADD USERS"**
2. Enter the Gmail address you'll use to send emails
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

> 💡 **Note**: For testing, you can add up to 100 test users. For production with many users, you'll need to publish your app (optional for email sending).

### 3.5 Review and Finish

1. Review your settings
2. Click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth2 Credentials

### 4.1 Create OAuth Client ID

1. Go to **Navigation Menu** (☰) > **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### 4.2 Configure OAuth Client

1. **Application type**: Select **"Web application"**
2. **Name**: `Medusa Gmail OAuth Client` (or any descriptive name)
3. **Authorized JavaScript origins**: (Leave empty - not needed for server-side)
4. **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
   ```
   https://developers.google.com/oauthplayground
   ```
   
   > ⚠️ **Important**: This exact URL is required for generating refresh tokens

5. Click **"CREATE"**

### 4.3 Save Your Credentials

A dialog will appear with your credentials:

1. **Copy** your **Client ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)
2. **Copy** your **Client Secret** (looks like: `GOCSPX-xxx...`)
3. Click **"DOWNLOAD JSON"** to save a backup (optional but recommended)
4. Click **"OK"**

> 🔐 **Security**: Keep these credentials secure! Never commit them to version control.

**Save these values - you'll need them:**
```
Client ID: [SAVE THIS]
Client Secret: [SAVE THIS]
```

---

## Step 5: Generate Refresh Token

Now we'll use Google's OAuth 2.0 Playground to generate a refresh token.

### 5.1 Open OAuth 2.0 Playground

1. Go to: [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click the **⚙️ Settings** (gear icon) in the top-right corner

### 5.2 Configure OAuth 2.0 Playground

In the settings panel:

1. Check the box: **"Use your own OAuth credentials"**
2. **OAuth Client ID**: Paste your Client ID from Step 4
3. **OAuth Client secret**: Paste your Client Secret from Step 4
4. Click **"Close"** (the X button)

### 5.3 Authorize APIs

1. On the left side, find **"Step 1 - Select & authorize APIs"**
2. In the input box, manually enter or search for:
   ```
   https://mail.google.com/
   ```
3. Click **"Authorize APIs"**
4. You'll be redirected to Google sign-in

### 5.4 Sign In and Grant Access

1. **Sign in** with the Gmail account you want to use for sending emails
2. You may see a warning: **"Google hasn't verified this app"**
   - This is normal for your own OAuth app
   - Click **"Advanced"**
   - Click **"Go to [Your App Name] (unsafe)"**
3. Review the permissions
4. Click **"Allow"** to grant access
5. You'll be redirected back to OAuth Playground

### 5.5 Exchange Authorization Code for Tokens

1. You should now be on **"Step 2 - Exchange authorization code for tokens"**
2. Click **"Exchange authorization code for tokens"**
3. You'll see a response with:
   - `access_token` (temporary - expires in 1 hour)
   - `refresh_token` (permanent - this is what we need!)
   
4. **Copy the `refresh_token`** value (looks like: `1//04xxxxx-your-refresh-token`)

> 🔐 **Important**: The refresh token is only shown once during first authorization. Save it securely!

**Save this value:**
```
Refresh Token: [SAVE THIS]
```

> 💡 **Tip**: If you don't see a refresh token, it might be because you already authorized this app. 
> To fix: Go to [Google Account Security](https://myaccount.google.com/permissions) > Remove your app > Repeat Step 5.3-5.5

---

## Step 6: Configure Medusa

### 6.1 Set Environment Variables

1. Open your `.env` file in the Medusa backend (`icfix/.env`)
2. Add or update these variables:

```bash
# ===========================================
# Gmail OAuth2 Email Notifications
# ===========================================
# Gmail address to send emails from
GMAIL_USER=your-email@gmail.com

# Google OAuth2 Client ID (from Step 4)
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com

# Google OAuth2 Client Secret (from Step 4)
GOOGLE_CLIENT_SECRET=GOCSPX-xxx...

# Google OAuth2 Refresh Token (from Step 5)
GOOGLE_REFRESH_TOKEN=1//04xxxxx-your-refresh-token

# Store Configuration
STORE_NAME=Your Store Name
STORE_URL=https://yourstore.com
```

3. Replace the placeholder values with your actual credentials
4. Save the file

> ⚠️ **Security Checklist**:
> - ✅ Never commit `.env` to version control
> - ✅ Add `.env` to `.gitignore`
> - ✅ Use different credentials for production and development
> - ✅ Rotate credentials periodically

### 6.2 Verify Configuration File

The plugin should already be configured in `medusa-config.ts`. Verify it looks like this:

```typescript
modules: [
  {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "./plugins/notification-gmail-oauth2",
          id: "notification-gmail-oauth2",
          options: {
            channels: ["email"],
            user: process.env.GMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            storeName: process.env.STORE_NAME || "Your Store",
            storeUrl: process.env.STORE_URL || "https://yourstore.com",
          },
        },
      ],
    },
  },
]
```

---

## Step 7: Build and Deploy

### 7.1 Install Plugin Dependencies

```bash
cd icfix/plugins/notification-gmail-oauth2
npm install
```

### 7.2 Build the Plugin

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `dist/` folder.

### 7.3 Restart Medusa Server

**Development:**
```bash
cd ../..  # Back to icfix directory
npm run dev
```

**Production (Docker):**
```bash
cd ../../..  # Back to project root
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d --build
```

### 7.4 Check Logs

Watch the logs to verify the plugin initialized successfully:

**Development:**
```bash
# Logs should show:
# ✅ Gmail OAuth2 notification service initialized successfully
# 📧 Sending emails from: your-email@gmail.com
```

**Docker:**
```bash
docker logs -f medusa-backend
```

Look for:
- ✅ `Gmail OAuth2 notification service initialized successfully`
- ✅ `Sending emails from: your-email@gmail.com`

**If you see errors:**
- ❌ `Gmail OAuth2: Missing required environment variables` → Check Step 6.1
- ❌ `Failed to initialize Gmail OAuth2` → Check your credentials in Step 4 & 5
- ❌ `Template not found` → Verify template files exist in `plugins/notification-gmail-oauth2/templates/`

---

## Step 8: Testing

### 8.1 Test Order Confirmation Email

1. **Place a test order** in your storefront
2. Complete the checkout process
3. Check the order confirmation email

### 8.2 Manual Test (Optional)

Create a test script `icfix/test-gmail.js`:

```javascript
require('dotenv').config()
const GmailProvider = require('./plugins/notification-gmail-oauth2/dist/services/gmail-provider').default

async function testGmail() {
  const container = {
    logger: {
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.log,
    }
  }

  const gmailService = new GmailProvider(container, {
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    storeName: process.env.STORE_NAME || 'Your Store',
    storeUrl: process.env.STORE_URL || 'https://yourstore.com',
  })

  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test order confirmation
  const result = await gmailService.sendNotification('order.placed', {
    email: 'test@example.com', // Replace with your test email
    customerName: 'Test Customer',
    orderId: 'TEST-12345',
    orderTotal: 4999, // $49.99 in cents
    currency: 'USD',
    storeUrl: process.env.STORE_URL || 'https://yourstore.com',
  })

  console.log('Test result:', result ? '✅ SUCCESS' : '❌ FAILED')
}

testGmail().catch(console.error)
```

Run the test:
```bash
cd icfix
node test-gmail.js
```

### 8.3 Check Email Delivery

1. Check the recipient's inbox
2. Check spam folder if not in inbox
3. Verify the email looks professional and all variables are replaced

### 8.4 Test All Email Types

Test each email type by triggering these events:

1. **Order Placed**: Place an order
2. **Order Shipped**: Mark an order as fulfilled with tracking
3. **Order Canceled**: Cancel an order
4. **Password Reset**: Request a password reset

---

## Troubleshooting

### Issue: Plugin Not Initializing

**Symptoms:**
- No logs about Gmail OAuth2
- Email service not found errors

**Solutions:**
1. Verify `.env` variables are set correctly
2. Check `medusa-config.ts` has the notification module configured
3. Rebuild the plugin: `cd plugins/notification-gmail-oauth2 && npm run build`
4. Restart Medusa server

---

### Issue: "Missing required environment variables"

**Symptoms:**
```
❌ Gmail OAuth2: Missing required environment variables
Required: GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
```

**Solutions:**
1. Check `.env` file has all four variables
2. Verify no typos in variable names
3. Ensure no extra spaces in values
4. Restart server after updating `.env`

---

### Issue: "Failed to initialize Gmail OAuth2"

**Symptoms:**
```
❌ Failed to initialize Gmail OAuth2 notification service
```

**Solutions:**
1. **Invalid Refresh Token**:
   - Regenerate refresh token (Step 5)
   - Ensure you copied the entire token including `1//`
   
2. **Expired OAuth Credentials**:
   - Check credentials are still active in Google Cloud Console
   - Verify OAuth consent screen is still configured
   
3. **API Not Enabled**:
   - Verify Gmail API is enabled (Step 2)
   - Wait 5-10 minutes for API to fully activate

4. **Wrong Gmail Account**:
   - Ensure the Gmail account matches `GMAIL_USER`
   - Refresh token must be from the same account

---

### Issue: "Invalid grant" or "Token has been expired or revoked"

**Symptoms:**
```
Error: invalid_grant
Token has been expired or revoked
```

**Solutions:**
1. Revoke access: [Google Account Permissions](https://myaccount.google.com/permissions)
2. Remove your app from the list
3. Regenerate refresh token (Step 5)
4. Update `.env` with new refresh token
5. Restart server

---

### Issue: Emails Going to Spam

**Solutions:**
1. **Set up SPF record** for your domain:
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Set up DKIM** (Google Workspace only)

3. **Warm up your sending**:
   - Start with low volume (10-20 emails/day)
   - Gradually increase over 2-3 weeks

4. **Improve email content**:
   - Use plain text along with HTML
   - Avoid spam trigger words
   - Include unsubscribe link

---

### Issue: "Template not found"

**Symptoms:**
```
❌ Template not found: /path/to/templates/orderPlaced.html
```

**Solutions:**
1. Verify template files exist:
   ```bash
   ls -la icfix/plugins/notification-gmail-oauth2/templates/
   ```
2. Should see:
   - `orderPlaced.html`
   - `orderShipped.html`
   - `orderCanceled.html`
   - `passwordReset.html`
3. Check file permissions (should be readable)
4. Rebuild plugin if templates were recently added

---

### Issue: Rate Limiting

**Symptoms:**
```
Error: 429 Too Many Requests
```

**Solutions:**
1. Check Gmail API quotas in Google Cloud Console
2. Upgrade to Google Workspace for higher limits
3. Implement email queuing if sending in bulk
4. Space out email sending (max 1 per second)

---

### Issue: Variables Not Replaced in Emails

**Symptoms:**
- Emails show `{{customerName}}` instead of actual name
- `{{orderId}}` not replaced

**Solutions:**
1. Check variable names match exactly (case-sensitive)
2. Verify data is passed to `sendNotification`:
   ```javascript
   {
     email: 'customer@example.com',
     customerName: 'John Doe',  // Must match {{customerName}}
     orderId: 'ORD-123',        // Must match {{orderId}}
     // ...
   }
   ```
3. Review template syntax uses double braces: `{{variableName}}`

---

## Email Templates

### Available Templates

1. **orderPlaced.html** - Order confirmation
   - Variables: `customerName`, `orderId`, `orderTotal`, `currency`, `orderUrl`, `storeUrl`

2. **orderShipped.html** - Shipment notification
   - Variables: `customerName`, `orderId`, `trackingNumber`, `carrier`, `orderUrl`, `storeUrl`

3. **orderCanceled.html** - Cancellation confirmation
   - Variables: `customerName`, `orderId`, `reason`, `refundAmount`, `currency`, `supportUrl`, `storeUrl`

4. **passwordReset.html** - Password reset
   - Variables: `customerName`, `resetLink`, `supportUrl`, `storeUrl`

### Customizing Templates

Templates are located in:
```
icfix/plugins/notification-gmail-oauth2/templates/
```

**To customize:**
1. Edit the HTML file directly
2. Use inline CSS for styling (for email client compatibility)
3. Add new variables using `{{variableName}}` syntax
4. Test thoroughly across email clients (Gmail, Outlook, etc.)
5. Rebuild plugin: `npm run build` (if needed)
6. Restart server

**Example - Adding a new variable:**

In template:
```html
<p>Hello {{customerName}}!</p>
<p>Your order {{orderId}} will arrive on {{deliveryDate}}.</p>
```

In code:
```javascript
await gmailService.sendNotification('order.placed', {
  email: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-123',
  deliveryDate: 'December 25, 2025',  // New variable
  // ...
})
```

---

## Advanced Configuration

### Custom Email Sender Name

Change the "From" name in emails:

```bash
# .env
STORE_NAME=Acme Corporation
```

Emails will show: **"Acme Corporation" <your-email@gmail.com>**

---

### Multiple Email Templates

To add more email types:

1. Create new template in `templates/` directory
2. Add handler method in `gmail-provider.ts`:
   ```typescript
   async sendCustomNotification(data: any): Promise<boolean> {
     const html = this.loadTemplate('customTemplate', data)
     const result = await this.sendEmail({
       to: data.email,
       subject: 'Custom Subject',
       html
     })
     return result.success
   }
   ```

3. Add case to `sendNotification` switch statement
4. Create subscriber to listen for new events

---

## Production Checklist

Before going live:

- [ ] All OAuth2 credentials configured
- [ ] Environment variables set in production `.env`
- [ ] Plugin built: `npm run build`
- [ ] Gmail API enabled in Google Cloud Console
- [ ] Test user added to OAuth consent screen (or app published)
- [ ] All email templates tested
- [ ] SPF/DKIM records configured (optional but recommended)
- [ ] Email templates customized with your branding
- [ ] Store name and URL configured
- [ ] Logs monitored for errors
- [ ] Test orders placed to verify delivery
- [ ] Spam folder checked
- [ ] All supported events tested (order placed, shipped, canceled, password reset)
- [ ] Gmail API quota monitored

---

## Support and Resources

### Official Documentation

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Medusa Documentation](https://docs.medusajs.com)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)

### Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Check API Quotas](https://console.cloud.google.com/apis/dashboard)
- [Manage OAuth Apps](https://myaccount.google.com/permissions)
- [Gmail API Limits](https://developers.google.com/gmail/api/reference/quota)

### Common Commands

```bash
# Build plugin
cd icfix/plugins/notification-gmail-oauth2
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# View logs (Docker)
docker logs -f medusa-backend

# Restart Medusa (Docker)
docker-compose -f docker-compose-prod.yml restart backend

# Test email sending
node test-gmail.js
```

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Rotate refresh tokens** every 6-12 months
3. **Use separate credentials** for dev/staging/production
4. **Monitor API usage** in Google Cloud Console
5. **Enable alerts** for suspicious activity
6. **Limit OAuth scopes** to only what's needed
7. **Review OAuth permissions** periodically
8. **Use environment-specific** `.env` files
9. **Backup your credentials** securely (encrypted)
10. **Revoke old tokens** when no longer needed

---

## Conclusion

You now have a fully functional Gmail OAuth2 integration for your Medusa store! 

**What you've accomplished:**
- ✅ Configured Google Cloud Console and Gmail API
- ✅ Set up OAuth2 authentication
- ✅ Generated refresh tokens for automatic access
- ✅ Integrated with Medusa v2 notification module
- ✅ Configured professional email templates
- ✅ Tested email delivery

**Next steps:**
1. Customize email templates with your branding
2. Test all email types thoroughly
3. Monitor email delivery and engagement
4. Consider setting up SPF/DKIM for better deliverability
5. Scale up email volume gradually

For issues or questions, check the **Troubleshooting** section above or review the logs for detailed error messages.

Happy emailing! 📧✨

