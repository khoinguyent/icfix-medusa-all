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

# Make scripts executable
RUN chmod +x /app/scripts/wait-for-db.sh

# Build the project
RUN npm run build

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
