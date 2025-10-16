# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install system dependencies including curl for health checks
RUN apk add --no-cache \
    netcat-openbsd \
    curl \
    wget

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm (uses package-lock.json)
RUN npm ci --only=production

# Copy the rest of your app's source code
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
            npm install --only=production && \
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

# Build the project
RUN npm run build

# Copy plugins to .medusa/server after build so they can be resolved
RUN echo "Copying plugins to .medusa/server..." && \
    mkdir -p ./.medusa/server/plugins && \
    cp -r ./plugins/* ./.medusa/server/plugins/ && \
    echo "✓ Plugins copied to .medusa/server/plugins" && \
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
