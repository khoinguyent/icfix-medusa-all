# Use an official Node.js v20 runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# Build the project
RUN yarn build

# Expose the port the app runs on
EXPOSE 9000

# The CMD is now handled by the command in your docker-compose.yml
# This ensures it runs with the correct flags.
CMD ["npx", "medusa", "start"]
