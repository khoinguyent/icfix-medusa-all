# Gmail OAuth2 Quick Start Guide

**5-minute setup for Gmail email notifications in Medusa**

## Quick Setup

### 1. Get Google OAuth2 Credentials (5 minutes)

**Create Project & Enable API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Medusa Email Service"
3. Enable **Gmail API**: APIs & Services → Library → Search "Gmail API" → Enable

**Create OAuth Credentials:**
1. APIs & Services → Credentials → Create Credentials → OAuth client ID
2. Configure OAuth consent screen (External)
   - App name: Your Store Name
   - Add test user: your-email@gmail.com
3. Create OAuth client ID:
   - Type: Web application
   - Redirect URI: `https://developers.google.com/oauthplayground`
4. Save **Client ID** and **Client Secret**

**Generate Refresh Token:**
1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click ⚙️ Settings → ✅ Use your own OAuth credentials
3. Enter Client ID and Client Secret
4. In Step 1, enter scope: `https://mail.google.com/`
5. Click "Authorize APIs" → Sign in → Allow
6. In Step 2, click "Exchange authorization code for tokens"
7. Copy the **Refresh Token** (starts with `1//`)

### 2. Configure Environment Variables

Edit `icfix/.env`:

```bash
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx...
GOOGLE_REFRESH_TOKEN=1//04xxxxx-your-refresh-token
STORE_NAME=Your Store Name
STORE_URL=https://yourstore.com
```

### 3. Build and Install

```bash
# Run setup script
./scripts/setup-gmail-oauth2.sh

# Or manually:
cd icfix/plugins/notification-gmail-oauth2
npm install
npm run build
cd ../../..
```

### 4. Restart Medusa

**Docker:**
```bash
docker-compose -f docker-compose-prod.yml restart backend
docker logs -f medusa-backend
```

**Development:**
```bash
cd icfix
npm run dev
```

### 5. Test

```bash
cd icfix
node test-gmail.js your-test-email@example.com
```

## Verify

Look for these logs:
```
✅ Gmail OAuth2 notification service initialized successfully
📧 Sending emails from: your-email@gmail.com
```

## What Gets Sent

- ✅ Order confirmation (when order is placed)
- ✅ Shipping notification (when order is fulfilled)
- ✅ Cancellation email (when order is canceled)
- ✅ Password reset (when user requests reset)

## Troubleshooting

### "Missing required environment variables"
- Check `.env` file has all 4 OAuth variables
- Restart server after updating `.env`

### "Failed to initialize Gmail OAuth2"
- Verify Gmail API is enabled
- Check Client ID and Secret are correct
- Regenerate refresh token if expired

### "Invalid grant" error
- Refresh token expired or revoked
- Go to [Account Permissions](https://myaccount.google.com/permissions)
- Remove your app and generate new refresh token

### Emails not sending
- Check logs for errors
- Verify Gmail account matches `GMAIL_USER`
- Check Gmail API quotas (500 emails/day for free)

## Customization

**Email Templates:**
```
icfix/plugins/notification-gmail-oauth2/templates/
├── orderPlaced.html       # Order confirmation
├── orderShipped.html      # Shipping notification
├── orderCanceled.html     # Cancellation
└── passwordReset.html     # Password reset
```

Edit HTML files to customize. Use `{{variableName}}` for dynamic content.

**Store Name in Emails:**
```bash
# In .env
STORE_NAME=Acme Store
```

Emails will show: **"Acme Store" <your-email@gmail.com>**

## Commands

```bash
# Test email sending
cd icfix && node test-gmail.js

# Rebuild plugin after changes
cd icfix/plugins/notification-gmail-oauth2
npm run build

# Watch mode (auto-rebuild)
npm run watch

# View logs
docker logs -f medusa-backend

# Restart backend
docker-compose -f docker-compose-prod.yml restart backend
```

## Resources

- 📘 [Full Setup Guide](GMAIL_OAUTH2_SETUP_GUIDE.md) - Detailed instructions with screenshots
- 🔧 [Google Cloud Console](https://console.cloud.google.com/)
- 🔑 [OAuth Playground](https://developers.google.com/oauthplayground)
- 📊 [Check Quotas](https://console.cloud.google.com/apis/dashboard)

## Limits

- **Free Gmail**: 500 emails/day
- **Google Workspace**: 2,000 emails/day
- **Rate limit**: ~1 email per second

For higher volumes, consider:
- Google Workspace account
- Multiple sending accounts
- External email service (SendGrid, Mailgun, etc.)

## Support

For detailed troubleshooting, see [GMAIL_OAUTH2_SETUP_GUIDE.md](GMAIL_OAUTH2_SETUP_GUIDE.md)

---

**That's it!** 🎉 Your store can now send beautiful transactional emails via Gmail.

