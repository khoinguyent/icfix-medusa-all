# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm (uses package-lock.json)
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Build the project
RUN npm run build

# Expose the port the app runs on
EXPOSE 9000

# Run migrations automatically, then start the server
CMD ["sh", "-lc", "npx medusa migrations run && npx medusa start"]
