# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install system dependencies including curl for health checks
# Install packages individually to avoid cross-platform build issues
RUN apk update && \
    apk add --no-cache netcat-openbsd && \
    apk add --no-cache curl && \
    apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy plugins directory first (needed for local file dependency in package.json)
# This must be done before npm install since package.json references file:./plugins/...
COPY plugins/ ./plugins/

# Install ALL dependencies (including dev dependencies needed for build)
# Use npm install instead of npm ci to handle local file dependencies better
RUN npm install

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
            npm install && \
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
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

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

# The CMD is now handled by the command in your docker-compose.yml
# This ensures it runs with the correct flags.
CMD ["npx", "medusa", "start"]
