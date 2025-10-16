# Gmail OAuth2 Plugin - Installation Guide

Quick installation guide for the Gmail OAuth2 notification plugin for Medusa v2.

## Prerequisites

- Medusa v2 project
- Node.js 18+
- Gmail account
- Google Cloud Console access

## Installation Steps

### 1. Install Dependencies

From the plugin directory:

```bash
cd plugins/notification-gmail-oauth2
npm install
```

This installs:
- `nodemailer` - Email sending library
- `googleapis` - Google API client for OAuth2
- `@types/node` - TypeScript types
- `@types/nodemailer` - TypeScript types
- `typescript` - TypeScript compiler

### 2. Build the Plugin

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

For development with auto-rebuild:
```bash
npm run watch
```

### 3. Configure Medusa

The plugin is already configured in `../../medusa-config.ts`:

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

### 4. Set Environment Variables

In your Medusa backend `.env` file (not this directory):

```bash
# Gmail OAuth2 Configuration
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=1//04xxxxx-your-refresh-token

# Store Configuration
STORE_NAME=Your Store Name
STORE_URL=https://yourstore.com
```

**How to get these values:**
See [GMAIL_OAUTH2_SETUP_GUIDE.md](../../../GMAIL_OAUTH2_SETUP_GUIDE.md) in the project root.

### 5. Verify Installation

Check that the plugin is properly structured:

```
notification-gmail-oauth2/
├── dist/                    # Compiled JavaScript (after build)
│   ├── index.js
│   ├── index.d.ts
│   └── services/
│       ├── gmail-provider.js
│       └── gmail-provider.d.ts
├── src/                     # TypeScript source
│   ├── index.ts
│   └── services/
│       └── gmail-provider.ts
├── templates/               # Email templates
│   ├── orderPlaced.html
│   ├── orderShipped.html
│   ├── orderCanceled.html
│   └── passwordReset.html
├── package.json
├── tsconfig.json
└── README.md
```

### 6. Restart Medusa

Restart your Medusa server to load the plugin:

```bash
# Development
npm run dev

# Production (Docker)
docker-compose -f docker-compose-prod.yml restart backend
```

### 7. Check Logs

Look for initialization messages:

```
✅ Gmail OAuth2 notification service initialized successfully
📧 Sending emails from: your-email@gmail.com
```

## Testing

### Quick Test

From the Medusa backend directory (`icfix/`):

```bash
node test-gmail.js
```

Or with a specific recipient:

```bash
node test-gmail.js test@example.com
```

### Manual Test

Place a test order in your storefront and verify the order confirmation email is sent.

## Troubleshooting

### Build Errors

**Error: `Cannot find module '@medusajs/framework'`**
- Install in parent project: `cd ../.. && npm install`

**Error: TypeScript compilation failed**
- Check `tsconfig.json` is present
- Verify TypeScript is installed: `npm install typescript --save-dev`

### Runtime Errors

**Error: `Gmail service not initialized`**
- Check environment variables are set in `.env`
- Verify OAuth2 credentials are correct
- Check Gmail API is enabled in Google Cloud Console

**Error: `Template not found`**
- Verify `templates/` directory exists
- Check file permissions
- Rebuild plugin: `npm run build`

**Error: `Invalid grant`**
- Refresh token expired or revoked
- Regenerate refresh token following setup guide

## Development

### Making Changes

1. Edit files in `src/` directory
2. Rebuild: `npm run build`
3. Restart Medusa server
4. Test changes

### Watch Mode

For automatic rebuilds during development:

```bash
npm run watch
```

Keep this running in a separate terminal while developing.

### Template Changes

Templates are in `templates/` directory. Changes take effect immediately (no rebuild required), but you need to restart the server.

## Updating

### Update Dependencies

```bash
npm update
```

### Update to Latest Version

Pull latest changes from git, then:

```bash
npm install
npm run build
```

## Uninstalling

1. Remove module configuration from `medusa-config.ts`
2. Remove environment variables from `.env`
3. Restart Medusa server
4. Optionally, delete plugin directory:
   ```bash
   cd ..
   rm -rf notification-gmail-oauth2
   ```

## Support

- **Full Setup Guide**: See `GMAIL_OAUTH2_SETUP_GUIDE.md` in project root
- **Quick Start**: See `GMAIL_OAUTH2_QUICK_START.md` in project root
- **Plugin README**: See `README.md` in this directory

## License

MIT License - see parent project for details

