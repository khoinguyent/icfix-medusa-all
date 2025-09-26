# Docker Setup for Medusa with MeiliSearch

This guide explains how to deploy your Medusa application with MeiliSearch using Docker and GitHub Container Registry (GHCR).

## 🐳 Docker Services

The Docker setup includes:

- **PostgreSQL** - Database
- **Redis** - Caching and sessions
- **MeiliSearch** - Search engine
- **Medusa** - E-commerce backend

## 🚀 Quick Start

### 1. Development Setup

```bash
# Start all services
docker-compose up -d

# Initialize MeiliSearch index
docker-compose exec medusa npm run init-search

# Seed the database
docker-compose exec medusa npm run seed
```

### 2. Production Setup

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

## 📁 Files Overview

- `docker-compose.yml` - Development configuration
- `docker-compose-prod.yml` - Production configuration
- `icfix/Dockerfile` - Medusa application container
- `.github/workflows/docker-build.yml` - CI/CD pipeline
- `deploy.sh` - Deployment script

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
POSTGRES_DB=medusa
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# MeiliSearch
MEILISEARCH_API_KEY=masterKey
MEILISEARCH_ENV=production
MEILISEARCH_PORT=7700

# Medusa
MEDUSA_PORT=9000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key
COOKIE_SECRET=your-super-secret-cookie-key

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:9000
```

### Service URLs

- **Medusa API**: http://localhost:9000
- **MeiliSearch**: http://localhost:7700
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ GitHub Container Registry (GHCR)

### Automatic Builds

The GitHub Actions workflow automatically builds and pushes Docker images to GHCR when you push to:
- `main` branch
- `medusa-meilisearch` branch
- Any pull request

### Manual Build

```bash
# Build and push to GHCR
docker build -t ghcr.io/your-username/your-repo:latest ./icfix
docker push ghcr.io/your-username/your-repo:latest
```

### Using GHCR Images

Update `docker-compose-prod.yml`:

```yaml
medusa:
  image: ghcr.io/your-username/your-repo:latest
  # ... rest of configuration
```

## 🔍 Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`
- **MeiliSearch**: HTTP health endpoint
- **Medusa**: HTTP health endpoint

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f medusa
docker-compose logs -f meilisearch
```

### Check Service Status

```bash
# Service status
docker-compose ps

# Health check details
docker inspect $(docker-compose ps -q medusa) | grep -A 10 Health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs
   docker-compose logs
   
   # Restart services
   docker-compose restart
   ```

2. **MeiliSearch not accessible**
   ```bash
   # Check if MeiliSearch is running
   curl http://localhost:7700/health
   
   # Restart MeiliSearch
   docker-compose restart meilisearch
   ```

3. **Database connection issues**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres pg_isready -U postgres
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## 🔒 Security Considerations

### Production Deployment

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets**
3. **Enable HTTPS** with reverse proxy
4. **Restrict network access** to databases
5. **Regular security updates** for base images

### Environment Variables

Never commit sensitive data to version control. Use:
- GitHub Secrets for CI/CD
- Environment-specific `.env` files
- External secret management services

## 📈 Scaling

### Horizontal Scaling

```yaml
# Scale Medusa instances
docker-compose up -d --scale medusa=3
```

### Load Balancing

Use a reverse proxy (nginx/traefik) to distribute load across multiple Medusa instances.

## 🎯 Next Steps

1. **Set up monitoring** (Prometheus/Grafana)
2. **Configure backups** for PostgreSQL and MeiliSearch
3. **Set up SSL/TLS** certificates
4. **Implement CI/CD** for automated deployments
5. **Add logging aggregation** (ELK stack)

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MeiliSearch Documentation](https://docs.meilisearch.com/)
- [Medusa Documentation](https://docs.medusajs.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
