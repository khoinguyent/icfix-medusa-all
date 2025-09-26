##########
# Builder stage
##########
FROM node:20-alpine AS builder
WORKDIR /app

# Dependencies for build
RUN apk add --no-cache \
    netcat-openbsd \
    curl \
    wget

COPY package*.json ./
RUN npm ci

COPY . .
RUN chmod +x /app/scripts/wait-for-db.sh || true

# Compile TypeScript -> .medusa/server (as configured in tsconfig)
RUN npm run build

##########
# Runtime stage
##########
FROM node:20-alpine
WORKDIR /app

# Runtime packages
RUN apk add --no-cache \
    curl \
    wget

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Bring over compiled server output
COPY --from=builder /app/.medusa /app/.medusa
# Keep sources for reference (not required, but harmless)
COPY --from=builder /app/src /app/src

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S medusa -u 1001
RUN chown -R medusa:nodejs /app
USER medusa

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

CMD ["npx", "medusa", "start"]
