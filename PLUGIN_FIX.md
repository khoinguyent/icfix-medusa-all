# Gmail Plugin Fix

## Issue
The notification-gmail-oauth2 plugin fails to load with error:
```
Unable to resolve plugin "./plugins/notification-gmail-oauth2". 
Make sure the plugin directory has a package.json file
```

## Root Cause
The plugin directory wasn't being properly copied into the Docker image due to:
1. Missing `.dockerignore` configuration
2. Plugin dependencies not being installed correctly

## Solution Applied

### 1. Created `.dockerignore`
Added explicit rules to ensure plugin directory is copied:
```dockerignore
# Keep plugins directory
!plugins
!plugins/*/
!plugins/*/package.json
!plugins/*/package-lock.json
!plugins/*/*.js
```

### 2. Enhanced Dockerfile
Improved plugin installation with better error checking:
```dockerfile
RUN echo "Checking for plugins..." && \
    ls -la ./plugins/ || echo "No plugins directory" && \
    if [ -d "./plugins/notification-gmail-oauth2" ]; then \
        echo "Found notification-gmail-oauth2 plugin" && \
        ls -la ./plugins/notification-gmail-oauth2/ && \
        if [ -f "./plugins/notification-gmail-oauth2/package.json" ]; then \
            echo "Installing plugin dependencies..." && \
            cd ./plugins/notification-gmail-oauth2 && \
            npm ci --only=production && \
            cd ../..; \
        fi; \
    fi
```

## Alternative: Disable Plugin Temporarily

If email notifications aren't critical right now, you can comment out the plugin:

**Edit `icfix/medusa-config.ts`:**

```typescript
plugins: [
  {
    resolve: "@lambdacurry/medusa-plugin-webhooks",
    // ... config
  },
  // Temporarily disabled - email notifications
  // {
  //   resolve: "./plugins/notification-gmail-oauth2",
  //   options: {
  //     user: process.env.GMAIL_USER,
  //     clientId: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //     refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  //     storeName: process.env.STORE_NAME || "Your Store",
  //   },
  // },
],
```

## Rebuild Docker Image

After applying fixes:

```bash
# Rebuild the image
docker-compose -f docker-compose-prod.yml build medusa-backend

# Restart services
docker-compose -f docker-compose-prod.yml up -d

# Check logs
docker logs -f icfix-backend
```

## Verify Plugin Loaded

Look for in logs:
```
✓ Plugin notification-gmail-oauth2 loaded successfully
```

Or no error about plugin resolution.

## Gmail OAuth2 Setup (if using plugin)

If you want to use email notifications, ensure these env vars are set:

```bash
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
STORE_NAME=Your Store Name
```

### Getting Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Get refresh token using OAuth Playground

See plugin README: `icfix/plugins/notification-gmail-oauth2/README.md`

## Testing

After rebuild:

```bash
# Test order email (triggers notification)
# Place a test order in the storefront

# Check logs for email sending
docker logs icfix-backend | grep -i email
docker logs icfix-backend | grep -i gmail
```

---

**Quick Fix:** If you just want to get the system running, comment out the plugin in `medusa-config.ts` and rebuild.

**Proper Fix:** Use the `.dockerignore` and Dockerfile changes provided above.

