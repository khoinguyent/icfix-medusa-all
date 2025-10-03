# EmailEngine Setup Guide

This guide explains how to set up EmailEngine with Gmail integration on your Medusa deployment.

## 🚀 Quick Setup

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your specific values
nano .env
```

### 2. Database Setup

EmailEngine will automatically create its own database (`emailengine`) on your PostgreSQL instance. No manual database setup required.

### 3. Start Services

```bash
# Start with EmailEngine
docker-compose -f docker-compose-prod.yml up -d

# Check EmailEngine status
docker-compose -f docker-compose-prod.yml logs -f emailengine
```

## 📧 Gmail Integration Setup

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Enable it

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://your-domain.com:3333/auth/oauth/callback`

5. Copy the Client ID and Client Secret

### Step 2: Configure EmailEngine

1. Access EmailEngine web interface: `https://your-domain.com/email`
2. Login with admin credentials from your `.env` file
3. Navigate to "Settings" > "IMAP Settings"
4. Enable OAuth for Gmail

### Step 3: Add Gmail Account

1. In EmailEngine, go to "Mailboxes"
2. Click "Add Mailbox"
3. Select "Gmail" as email provider
4. Choose OAuth authentication method
5. Enter your Gmail address
6. Follow OAuth flow to authorize access

## 🔧 Configuration Details

### Environment Variables

```bash
# EmailEngine Database
EMAILENGINE_DB=emailengine                    # Separate database name
EMAILENGINE_DB_USER=postgres                  # Database user
EMAILENGINE_DB_PASSWORD=your-postgres-password

# EmailEngine Application
EMAILENGINE_PORT=3333                         # Web interface port
EMAILENGINE_ADMIN_USER=admin                  # Admin username
EMAILENGINE_ADMIN_PASS=your-secure-password   # Admin password
EMAILENGINE_SECRET=random-secret-key          # Application secret

# Gmail OAuth
GMAIL_CLIENT_ID=your-oauth-client-id          # From Google Console
GMAIL_CLIENT_SECRET=your-oauth-client-secret  # From Google Console
GMAIL_REDIRECT_URI=https://your-domain.com/email/auth/oauth/callback
```

### Service URLs

After deployment:
- **EmailEngine Web UI**: `https://your-domain.com/email` (secure HTTPS)
- **EmailEngine API**: `https://your-domain.com/email/api/v1`
- **Medusa API**: `https://your-domain.com` (via Nginx)
- **Direct EmailEngine**: `http://your-domain.com:3333` (not recommended for production)

## 🔒 Security Considerations

1. **Change Default Credentials**: Update `EMAILENGINE_ADMIN_PASS` in `.env`
2. **Secure Secret Keys**: Use strong random values for `EMAILENGINE_SECRET`
3. **Network Security**: EmailEngine only listens on configured port
4. **HTTPS**: Configure SSL for production use

## 🐛 Troubleshooting

### EmailEngine Not Starting

```bash
# Check logs
docker-compose -f docker-compose-prod.yml logs emailengine

# Check database connection
docker-compose -f docker-compose-prod.yml exec emailengine curl -f http://localhost:3333/api/v1/account
```

### Gmail OAuth Issues

1. Verify redirect URI matches exactly in Google Console
2. Ensure Gmail API is enabled
3. Check OAuth consent screen configuration

### Database Connection Issues

```bash
# Test PostgreSQL connection from EmailEngine container
docker-compose -f docker-compose-prod.yml exec emailengine pg_isready -h postgres -p 5432
```

## 🔄 Integration with Medusa

EmailEngine can be integrated with Medusa for:
- Order confirmation emails
- Invoice notifications
- Shipping updates
- Marketing campaigns

Example Medusa integration:

```typescript
// Example service for sending emails via EmailEngine
import axios from 'axios';

const EMAILENGINE_API = 'https://your-domain.com/email/api/v1';

export class EmailService {
  async sendOrderConfirmation(orderId: string, customerEmail: string) {
    return axios.post(`${EMAILENGINE_API}/message`, {
      mailbox: 'your-gmail-mailbox',
      to: customerEmail,
      subject: `Order Confirmation #${orderId}`,
      html: `<h1>Thank you for your order!</h1>`,
    });
  }
}
```

## 📚 Additional Resources

- [EmailEngine Documentation](https://github.com/emailengine/emailengine)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Medusa Notification Service](https://docs.medusajs.com/resources/workflows#workflow-notifications)

