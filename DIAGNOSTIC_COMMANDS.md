# 🔍 Gmail Plugin Diagnostic Commands

Run these on your server to diagnose the plugin issue.

## Check Plugin Files in Image

```bash
# Check all files in plugin directory
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a ls -la /app/plugins/notification-gmail-oauth2/

# Check if index.js exists
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a ls -la /app/plugins/notification-gmail-oauth2/index.js

# Check templates directory
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a ls -la /app/plugins/notification-gmail-oauth2/templates/

# View package.json type field
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a cat /app/plugins/notification-gmail-oauth2/package.json | grep type
```

## Check Medusa Config

```bash
# Check how plugin is configured in running container
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a cat /app/medusa-config.ts | grep -A 10 "notification-gmail-oauth2"
```

## Check Build Medusa Files

```bash
# Check if plugin is in built .medusa directory
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a ls -la /app/.medusa/

# Check for any plugin references
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a find /app/.medusa -name "*gmail*" 2>/dev/null || echo "No gmail files in build"
```

## Start Container with Debug

```bash
# Start container with more verbose logging
docker-compose -f docker-compose-prod.yml up medusa-backend

# Or run container directly to see all output
docker run --rm \
  -e DATABASE_URL="postgresql://icfix_user:password@postgres:5432/icfix_db" \
  -e REDIS_URL="redis://redis:6379" \
  --network icfix-net \
  ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a \
  sh -c "ls -la /app/plugins/notification-gmail-oauth2/ && npx medusa start"
```

## Check Package.json Type Issue

```bash
# The plugin has "type": "module" which might cause issues
# Check the actual content
docker run --rm ghcr.io/khoinguyent/icfix-medusa-all:medusa-meilisearch-426fa4a cat /app/plugins/notification-gmail-oauth2/package.json
```

