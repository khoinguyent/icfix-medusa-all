# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm (uses package-lock.json)
RUN apk add --no-cache netcat-openbsd \
  && npm ci

# Copy the rest of your app's source code
COPY . .
RUN chmod +x /app/scripts/wait-for-db.sh

# Build the project (excluding admin bundle to save memory)
# Set environment to prevent admin bundle build
ENV MEDUSA_ADMIN_ONBOARDING_TYPE=disabled
ENV MEDUSA_ADMIN_SERVE=false
RUN npm run build

# Explicitly remove any admin build artifacts that might have been created
RUN rm -rf build/admin 2>/dev/null || true
RUN rm -rf .medusa/admin 2>/dev/null || true
RUN rm -rf dist/admin 2>/dev/null || true

# Set runtime environment to disable admin UI serving
ENV MEDUSA_ADMIN_SERVE=false

# Expose the port the app runs on
EXPOSE 9000

# The CMD is now handled by the command in your docker-compose.yml
# This ensures it runs with the correct flags.
CMD ["npx", "medusa", "start"]
