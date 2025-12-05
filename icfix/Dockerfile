# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install system dependencies including curl for health checks
# Install packages individually to avoid cross-platform build issues
# Skip trigger scripts that cause issues in cross-platform builds
RUN apk update && \
    apk add --no-cache netcat-openbsd curl wget || \
    (apk update && apk add --no-cache netcat-openbsd && \
     apk add --no-cache curl && \
     apk add --no-cache wget) && \
    rm -rf /var/cache/apk/* || true

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy plugins directory first (needed for local file dependency in package.json)
# This must be done before npm install since package.json references file:./plugins/...
COPY plugins/ ./plugins/

# Install ALL dependencies (including dev dependencies needed for build)
# Use npm install with --legacy-peer-deps to handle peer dependency conflicts
RUN npm install --legacy-peer-deps || (cat /root/.npm/_logs/* && exit 1)

# Copy the rest of your app's source code
# Note: plugins/ is already copied, but COPY . . will overwrite it (which is fine)
COPY . .

# Install plugin dependencies for all plugins with package.json
RUN echo "=== PLUGIN SETUP ===" && \
    echo "Installing dependencies for all plugins..." && \
    for plugin_dir in ./plugins/*/ ; do \
        if [ -f "${plugin_dir}package.json" ]; then \
            plugin_name=$(basename "$plugin_dir") && \
            echo "" && \
            echo "Installing dependencies for: $plugin_name" && \
            cd "$plugin_dir" && \
            npm install --legacy-peer-deps && \
            echo "✓ $plugin_name dependencies installed" && \
            cd /app; \
        fi; \
    done && \
    echo "" && \
    echo "=== PLUGIN SETUP COMPLETE ===" && \
    echo "Installed plugins:" && \
    ls -la ./plugins/

# Make scripts executable
RUN chmod +x /app/scripts/wait-for-db.sh

# Build the project (requires dev dependencies)
# Verify build output exists after build
RUN npm run build && \
    echo "=== Verifying build output ===" && \
    ls -la .medusa/ 2>/dev/null || (echo "ERROR: .medusa directory not found after build!" && exit 1) && \
    ls -la .medusa/server/ 2>/dev/null || (echo "ERROR: .medusa/server directory not found after build!" && exit 1) && \
    echo "✓ Build output verified"

# Remove dev dependencies after build to reduce image size
# Use --legacy-peer-deps to handle peer dependency conflicts
# Note: We keep all production dependencies including workflows SDK
RUN npm prune --production --legacy-peer-deps || true

# Create symlink from .medusa/server/plugins to main plugins directory
# This allows Medusa to find plugins from the build directory
RUN mkdir -p ./.medusa/server && \
    ln -s /app/plugins ./.medusa/server/plugins && \
    echo "✓ Created symlink: .medusa/server/plugins -> /app/plugins" && \
    ls -la ./.medusa/server/plugins/

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medusa -u 1001

# Change ownership of the app directory to the medusa user
RUN chown -R medusa:nodejs /app
USER medusa

# Expose the port the app runs on
EXPOSE 9000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# After build, we need to work with .medusa/server directory
# According to Medusa docs: https://docs.medusajs.com/learn/build#start-built-medusa-application
# 1. Copy medusa-config.ts to .medusa/server (or use env vars)
# 2. Install dependencies in .medusa/server
# 3. Run from .medusa/server

# Copy medusa-config.ts to .medusa/server so it can be found
RUN cp medusa-config.ts .medusa/server/medusa-config.ts && \
    echo "✓ Copied medusa-config.ts to .medusa/server"

# Change to .medusa/server and install dependencies
# Use --production=false to ensure all dependencies are available
# Also create symlink to parent node_modules to ensure dependencies are accessible
WORKDIR /app/.medusa/server
RUN npm install --legacy-peer-deps --production=false && \
    echo "✓ Installed dependencies in .medusa/server" && \
    echo "=== Creating symlink to parent node_modules for dependency resolution ===" && \
    ln -sf /app/node_modules /app/.medusa/server/parent_node_modules && \
    echo "✓ Created symlink to parent node_modules" && \
    echo "=== Verifying workflows-sdk ===" && \
    (ls -la node_modules/@medusajs/workflows-sdk 2>/dev/null || \
     ls -la node_modules/@medusajs/framework/node_modules/@medusajs/workflows-sdk 2>/dev/null || \
     ls -la ../node_modules/@medusajs/framework/workflows-sdk 2>/dev/null || \
     echo "WARNING: workflows-sdk not found in expected location")

# Start Medusa from .medusa/server directory
# Set NODE_ENV to production for production mode
ENV NODE_ENV=production
CMD ["npm", "start"]
