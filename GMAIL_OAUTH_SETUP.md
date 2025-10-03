# Gmail OAuth Setup Guide for Medusa Email Notifications

This guide will help you set up Google OAuth credentials for secure Gmail SMTP authentication in your Medusa store.

## 📋 Prerequisites

- Google account with Gmail
- Access to Google Cloud Console
- Basic understanding of OAuth 2.0

## 🔧 Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   ```bash
   - Click "Select a project" → "New Project"
   - Project name: "Medusa Email Service"
   - Click "Create"
   ```

3. **Enable Gmail API**
   ```bash
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"
   ```

## 🔑 Step 2: Create OAuth 2.0 Credentials

1. **Go to OAuth Consent Screen**
   ```bash
   - APIs & Services → OAuth consent screen
   - Select "External" → "Create"
   - Fill required fields:
     * App name: "Medusa Store Email Service"
     * User support email: your-email@gmail.com
     * Developer contact: your-email@gmail.com
   ```

2. **Configure Scopes**
   ```bash
   - Click "Edit App"
   - Add Scopes → Add these scopes:
     * ../auth/gmail.readonly
     * ../auth/gmail.send
   ```

3. **Create OAuth Client**
   ```bash
   - APIs & Services → Credentials
   - "Create Credentials" → "OAuth client ID"
   - Application type: "Desktop application"
   - Name: "Medusa Email Client"
   ```

4. **Download Credentials**
   ```bash
   - Download JSON file
   - Save securely (contains your Client ID & Secret)
   ```

## 🎯 Step 3: Generate Refresh Token

### Option A: Using Node.js Script (Recommended)

Create `generate-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// Load your OAuth credentials
const credentials = require('./path-to-your-credentials.json');

const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  'urn:ietf:wg:oauth:2.0:oob' // For desktop apps
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ],
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    
    console.log('Refresh Token:', token.refresh_token);
    console.log('Save this refresh token to your .env file');
    
    const tokens = {
      refresh_token: token.refresh_token,
      // Save for potential future use
      credentials_path: './credentials.json'
    };
    
    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    rl.close();
  });
});
```

Run the script:
```bash
npm install googleapis readline-sync
node generate-refresh-token.js
```

### Option B: Using Browser Console

1. **Open Developer Tools** in your browser
2. **Go to Console tab**
3. **Run this script**:

```javascript
// Paste your credentials here
const clientId = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const clientSecret = 'YOUR_CLIENT_SECRET';

// Step 1: Get authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=urn:ietf:wg:oauth:2.0:oob&` +
  `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly')}&` +
  `&response_type=code&access_type=offline&prompt=consent`;

console.log('Visit this URL:', authUrl);
console.log('After visiting, come back and run step 2 with your authorization code');
```

4. **Get Authorization Code**
   ```bash
   - Click the generated URL
   - Sign in to Google
   - Copy the authorization code
   ```

5. **Exchange for Refresh Token**
   ```javascript
   // Replace YOUR_AUTH_CODE with the code from step 4
   const authCode = 'YOUR_AUTH_CODE';
   
   fetch('https://oauth2.googleapis.com/token', {
     method: 'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams({
       client_id: clientId,
       client_secret: clientSecret,
       code: authCode,
       grant_type: 'authorization_code',
       redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
     })
   })
   .then(response => response.json())
   .then(data => console.log('Refresh Token:', data.refresh_token))
   .catch(error => console.error('Error:', error));
   ```

## ⚙️ Step 4: Configure Environment Variables

Update your `.env` file on the server:

```bash
# SMTP Configuration (for Email Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=noreply@yourstore.com

# Google OAuth Configuration (for Gmail SMTP)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GMAIL_USER=your-email@gmail.com
```

## 🚀 Step 5: Deploy and Test

1. **Commit and Deploy**
   ```bash
   git add .
   git commit -m "feat: Configure Google OAuth for email notifications"
   git push origin main
   ```

2. **Update Server Environment**
   ```bash
   ssh your-server
   cd /opt/medusa
   git pull origin main
   
   # Update .env with your actual values
   nano .env
   
   # Restart Medusa to load new configuration
   docker-compose -f docker-compose-prod.yml restart medusa-backend
   ```

3. **Test Email Notifications**
   ```bash
   # Place a test order
   # Check email delivery
   # Verify templates render correctly
   ```

## 🔒 Security Best Practices

### ✅ **DO:**
- Store credentials securely
- Use environment variables
- Regularly rotate refresh tokens
- Monitor API usage in Google Cloud Console
- Use least privilege scopes

### ❌ **DON'T:**
- Commit credentials to git
- Use personal Gmail passwords
- Share OAuth tokens
- Use deprecated authentication methods

## 📊 Monitoring & Troubleshooting

### Google Cloud Console Monitoring:
```bash
- Go to "APIs & Services" → "Dashboard"
- Monitor API usage and quotas
- Check for authentication errors
```

### Common Issues:

1. **"Invalid Refresh Token"**
   ```bash
   - Regenerate refresh token
   - Check scope permissions
   ```

2. **"Insufficient Permission"**
   ```bash
   - Verify Gmail API is enabled
   - Check OAuth scopes
   ```

3. **"Authorization Error"**
   ```bash
   - Verify Client ID/Secret
   - Check redirect URI configuration
   ```

## 📈 Advanced Configuration

### Custom OAuth Scopes:
```javascript
// For read-only access
scope: 'https://www.googleapis.com/auth/gmail.readonly'

// For send-only access  
scope: 'https://www.googleapis.com/auth/gmail.send'

// For full access (use carefully)
scope: 'https://mail.google.com/'
```

### Multiple Email Accounts:
```bash
# You can configure multiple Gmail accounts
# by setting up additional OAuth credentials
# and using them in different notification templates
```

## 🔄 Token Refresh Automation

The `@perseidesjs/notification-nodemailer` plugin automatically handles:
- Access token generation
- Token refresh when expired
- Secure credential storage

No additional automation needed! 🎉

---

**Need Help?**
- Check Medusa documentation
- Review Google OAuth documentation
- Test with small configurations first
