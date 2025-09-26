# 🚀 Deployment Guide - GHCR Workflow

This guide explains how to deploy the Medusa application with Meilisearch real-time indexing using GitHub Container Registry (GHCR).

## 📋 Prerequisites

- GitHub repository with Actions enabled
- Server with Docker and Docker Compose installed
- Access to GHCR images

## 🔄 CI/CD Workflow

### 1. Automatic Build Process

When you push to `main` or `medusa-meilisearch` branches, GitHub Actions will:

1. **Build** the Docker image with all dependencies
2. **Push** to GHCR: `ghcr.io/khoinguyent/icfix-medusa-all:latest`
3. **Tag** with branch name and commit SHA

### 2. GitHub Actions Configuration

The workflow (`.github/workflows/docker-build.yml`) automatically:
- Builds for `linux/amd64` and `linux/arm64`
- Uses build cache for faster builds
- Pushes to GHCR with proper tags

## 🖥️ Server Deployment

### Step 1: Wait for Build Completion

After pushing to `main`, wait for the GitHub Action to complete:
- Check Actions tab in your GitHub repository
- Wait for "Build and Push to GHCR" to finish

### Step 2: Deploy on Server

```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to your medusa directory
cd /opt/medusa

# Pull latest changes (if using git)
git pull origin main

# Run the automated setup script
./scripts/setup-search.sh
```

### Step 3: Manual Deployment (Alternative)

If you prefer manual control:

```bash
# Pull the latest image
docker pull ghcr.io/khoinguyent/icfix-medusa-all:latest

# Stop current services
docker-compose -f docker-compose-prod.yml down

# Start with new image
docker-compose -f docker-compose-prod.yml up -d

# Wait for services to start
sleep 30

# Initialize Meilisearch
docker exec icfix-backend npm run ts-node src/scripts/initialize-meilisearch.ts

# Re-index all products
docker exec icfix-backend npm run ts-node src/scripts/reindex-products.ts
```

## 🔍 Verification

### Test Meilisearch Directly

```bash
# Test search API
curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
     "http://localhost:7700/indexes/products/search" \
     -H "Content-Type: application/json" \
     -d '{"q": "iPhone", "limit": 10}'
```

### Test Storefront Search

```bash
# Test your live storefront
curl "https://icfix-medusa-storefront.vercel.app/vn/store?q=iPhone"
```

### Monitor Real-time Indexing

```bash
# Watch indexing logs
docker logs -f icfix-backend | grep -E "(Indexing|Successfully indexed)"
```

## 🛠️ Troubleshooting

### If Search Still Doesn't Work

1. **Check Meilisearch Status**:
   ```bash
   curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
        "http://localhost:7700/health"
   ```

2. **Check Index Settings**:
   ```bash
   curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
        "http://localhost:7700/indexes/products/settings"
   ```

3. **Check Indexed Documents**:
   ```bash
   curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
        "http://localhost:7700/indexes/products/documents?limit=5"
   ```

4. **Re-run Indexing**:
   ```bash
   docker exec icfix-backend npm run ts-node src/scripts/reindex-products.ts
   ```

### If Services Won't Start

1. **Check Docker Logs**:
   ```bash
   docker-compose -f docker-compose-prod.yml logs
   ```

2. **Check Environment Variables**:
   ```bash
   docker exec icfix-backend env | grep MEILISEARCH
   ```

3. **Restart Services**:
   ```bash
   docker-compose -f docker-compose-prod.yml restart
   ```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:9002/health

# Meilisearch health
curl http://localhost:7700/health

# Database connection
docker exec icfix-backend npm run medusa migrations:run
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Log monitoring
docker logs -f icfix-backend
docker logs -f meilisearch
```

## 🔄 Update Process

1. **Make changes** to your code
2. **Commit and push** to `main` branch
3. **Wait** for GitHub Actions to build and push to GHCR
4. **Deploy** on server using the setup script
5. **Verify** search functionality

## 📝 Environment Variables

Make sure these are set in your server environment:

```bash
# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/medusa

# Redis
REDIS_URL=redis://redis:6379

# Other required vars...
```

## 🎯 Success Indicators

✅ **Search is working when:**
- `curl "https://icfix-medusa-storefront.vercel.app/vn/store?q=iPhone"` returns results
- Meilisearch API returns products for search queries
- New products are automatically indexed (check logs)
- Product updates trigger re-indexing

🚨 **Common Issues:**
- Empty search results → Products not indexed
- 500 errors → Meilisearch connection issues
- No real-time updates → Subscriber not working
- Build failures → Check GitHub Actions logs
