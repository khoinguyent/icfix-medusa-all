# Gmail OAuth2 - Quick Reference Card

## 🚀 Quick Commands

```bash
# Build plugin
cd icfix/plugins/notification-gmail-oauth2 && npm run build

# Test email
cd icfix && node test-gmail.js

# Watch mode (auto-rebuild)
cd icfix/plugins/notification-gmail-oauth2 && npm run watch

# View logs (Docker)
docker logs -f medusa-backend

# Restart backend
docker-compose -f docker-compose-prod.yml restart backend

# Run setup script
./scripts/setup-gmail-oauth2.sh
```

## 📁 Important Files

```
# Configuration
icfix/.env                                    # OAuth2 credentials
icfix/medusa-config.ts                        # Plugin configuration
icfix/src/subscribers/email-notifications.ts  # Event handlers

# Plugin
icfix/plugins/notification-gmail-oauth2/
├── src/services/gmail-provider.ts            # Main service
├── templates/*.html                          # Email templates
└── dist/                                     # Built files

# Testing & Scripts
icfix/test-gmail.js                           # Test script
scripts/setup-gmail-oauth2.sh                 # Setup automation
```

## 🔑 Environment Variables

```bash
# Required
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=123...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx...
GOOGLE_REFRESH_TOKEN=1//04xxx...

# Optional
STORE_NAME=Your Store Name
STORE_URL=https://yourstore.com
```

## 📧 Email Templates

| File | Event | Variables |
|------|-------|-----------|
| `orderPlaced.html` | Order confirmation | customerName, orderId, orderTotal, currency, orderUrl |
| `orderShipped.html` | Shipping notice | customerName, orderId, trackingNumber, carrier, orderUrl |
| `orderCanceled.html` | Cancellation | customerName, orderId, reason, refundAmount, currency |
| `passwordReset.html` | Password reset | customerName, resetLink, supportUrl |

**Location**: `icfix/plugins/notification-gmail-oauth2/templates/`

## 🔍 Logs to Watch For

✅ **Success**:
```
✅ Gmail OAuth2 notification service initialized successfully
📧 Sending emails from: your-email@gmail.com
📧 Processing notification event: order.placed
✅ Email sent successfully to customer@example.com
```

❌ **Errors**:
```
❌ Gmail OAuth2: Missing required environment variables
❌ Failed to initialize Gmail OAuth2 notification service
❌ Template not found
❌ Gmail service not initialized
```

## 🔧 Common Fixes

| Problem | Solution |
|---------|----------|
| Plugin not loading | `cd icfix/plugins/notification-gmail-oauth2 && npm run build` |
| Missing credentials | Check `.env` has all 4 OAuth variables |
| Invalid grant | Regenerate refresh token at [OAuth Playground](https://developers.google.com/oauthplayground) |
| Template errors | Check files exist in `templates/` directory |
| Not sending | Check logs: `docker logs -f medusa-backend` |

## 🌐 Important Links

| Resource | URL |
|----------|-----|
| Google Cloud Console | https://console.cloud.google.com/ |
| OAuth Playground | https://developers.google.com/oauthplayground |
| API Dashboard | https://console.cloud.google.com/apis/dashboard |
| Manage Permissions | https://myaccount.google.com/permissions |
| Gmail API Docs | https://developers.google.com/gmail/api |

## 📊 Limits

- **Free Gmail**: 500 emails/day
- **Google Workspace**: 2,000 emails/day  
- **Rate limit**: ~1 email/second

## 🎯 Quick Setup (First Time)

1. **Get credentials** (15 min): Follow [GMAIL_OAUTH2_SETUP_GUIDE.md](GMAIL_OAUTH2_SETUP_GUIDE.md) Steps 1-5
2. **Configure**: Add to `icfix/.env`
3. **Build**: `cd icfix/plugins/notification-gmail-oauth2 && npm install && npm run build`
4. **Test**: `cd icfix && node test-gmail.js`
5. **Deploy**: `docker-compose -f docker-compose-prod.yml restart backend`

## 🧪 Test Checklist

- [ ] `node test-gmail.js` sends email successfully
- [ ] Check inbox for test email
- [ ] Place test order → receive confirmation
- [ ] Mark order shipped → receive shipping notice
- [ ] Cancel order → receive cancellation email
- [ ] Request password reset → receive reset link
- [ ] All variables replaced (no `{{}}` in emails)
- [ ] Emails look professional and branded

## 🎨 Customization

**Change store name**:
```bash
# .env
STORE_NAME=Acme Corporation
```

**Edit templates**:
```bash
# Edit HTML files
vi icfix/plugins/notification-gmail-oauth2/templates/orderPlaced.html

# No rebuild needed, just restart
docker-compose -f docker-compose-prod.yml restart backend
```

**Add variables**:
```html
<!-- In template -->
<p>Delivery: {{deliveryDate}}</p>
```
```javascript
// In subscriber
await gmailService.sendNotification('order.placed', {
  // ... existing data
  deliveryDate: 'December 25, 2025',
})
```

## 📚 Documentation

| Doc | Purpose | Time |
|-----|---------|------|
| [Quick Start](GMAIL_OAUTH2_QUICK_START.md) | Fast setup | 5 min |
| [Setup Guide](GMAIL_OAUTH2_SETUP_GUIDE.md) | Comprehensive | 15 min |
| [Summary](GMAIL_INTEGRATION_SUMMARY.md) | Overview | 5 min |
| [Plugin README](icfix/plugins/notification-gmail-oauth2/README.md) | Plugin details | 5 min |

## 🐛 Troubleshooting Decision Tree

```
Email not sending?
├─ Check logs for errors
│  ├─ "Missing environment variables" → Add to .env
│  ├─ "Invalid grant" → Regenerate refresh token
│  ├─ "Template not found" → Check templates/ exists
│  └─ "Service not initialized" → Rebuild plugin
│
├─ No errors in logs?
│  ├─ Plugin loaded? → Check "✅ Gmail OAuth2 initialized"
│  ├─ Event triggered? → Check "📧 Processing notification"
│  └─ Template rendered? → Check variables are set
│
└─ Email sent but not received?
   ├─ Check spam folder
   ├─ Verify recipient email correct
   ├─ Check Gmail quota not exceeded
   └─ Review Gmail API dashboard
```

## 🔐 Security Checklist

- [ ] `.env` in `.gitignore`
- [ ] OAuth credentials never committed
- [ ] Different credentials for dev/prod
- [ ] Refresh token rotated every 6-12 months
- [ ] API usage monitored
- [ ] Only required scopes enabled (`https://mail.google.com/`)
- [ ] Test users configured in OAuth consent screen

## 🚨 Emergency Commands

**Plugin broken? Reset:**
```bash
cd icfix/plugins/notification-gmail-oauth2
rm -rf node_modules dist
npm install
npm run build
cd ../../..
docker-compose -f docker-compose-prod.yml restart backend
```

**Token expired? Regenerate:**
1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Settings → ✅ Use your own OAuth credentials
3. Enter Client ID and Secret
4. Scope: `https://mail.google.com/`
5. Authorize → Exchange code → Copy refresh token
6. Update `.env` → Restart server

**Can't access Google Cloud Console?**
- Check you're logged into correct Google account
- Verify project still exists
- Check billing is enabled (if required)

## 📞 Quick Support

**For issues:**
1. Check logs: `docker logs -f medusa-backend`
2. Review [Troubleshooting](GMAIL_OAUTH2_SETUP_GUIDE.md#troubleshooting)
3. Verify credentials in [Google Cloud Console](https://console.cloud.google.com/)
4. Test manually: `node test-gmail.js`

**Common error codes:**
- `401 Unauthorized` → Check Client ID/Secret
- `403 Forbidden` → Gmail API not enabled
- `429 Too Many Requests` → Hit quota limit
- `500 Internal Error` → Temporary Google issue, retry

---

**Keep this handy!** Bookmark or print for quick reference during development and troubleshooting.

