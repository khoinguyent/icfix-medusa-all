# This file tells Docker how to build an image for your backend application.
# It must be placed inside your 'icfix' directory.

# Use an official Node.js 18 runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and lock file first to leverage Docker's layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your app's source code into the container
COPY . .

# Build the Medusa application (compiles TypeScript, etc.)
RUN npm run build

# Expose the port the app runs on
EXPOSE 9000

# Define the command to run your app
# This will run migrations and then start the server
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
