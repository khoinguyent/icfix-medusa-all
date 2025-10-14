# 🚀 Complete Medusa Deployment Guide

Complete step-by-step guide to deploy your Medusa e-commerce platform with Next.js storefront, configured for Vietnam market with VND currency.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Configuration (Nginx + SSL)](#pre-configuration-nginx--ssl)
3. [Docker Services Setup](#docker-services-setup)
4. [Database Migration](#database-migration)
5. [Seed Data](#seed-data)
6. [Create Admin User](#create-admin-user)
7. [Initialize MeiliSearch](#initialize-meilisearch)
8. [Setup Webhooks](#setup-webhooks)
9. [Storefront Setup](#storefront-setup)
10. [Verification](#verification)
11. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- **Server:** Ubuntu 20.04+ or similar
- **Docker:** Version 20.10+
- **Docker Compose:** Version 2.0+
- **Domain:** Pointed to your server IP
- **Ports:** 80, 443, 9000, 7700, 5432, 6379 available

---

## 🔧 Pre-Configuration (Nginx + SSL)

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Create Basic Nginx Configuration

Create nginx configuration for HTTP (port 80) - needed for Certbot:

```bash
sudo mkdir -p /etc/nginx/sites-available
sudo nano /etc/nginx/sites-available/medusa
```

**Add this configuration:**

```nginx
# HTTP Configuration (Port 80)
# This is needed for Certbot SSL certificate validation

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com admin.yourdomain.com;

    # Certbot validation path
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # Temporary redirect to HTTPS (will be updated after SSL)
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

**Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 3: Install Certbot & Get SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Create webroot directory
sudo mkdir -p /var/www/certbot

# Request SSL certificate
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com \
  -d admin.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email

# Note: Replace yourdomain.com with your actual domain
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

### Step 4: Update Nginx with SSL Configuration

```bash
sudo nano /etc/nginx/sites-available/medusa
```

**Replace with full SSL configuration:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com admin.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Backend API (api.yourdomain.com)
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin UI (admin.yourdomain.com)
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Storefront (yourdomain.com)
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 5: Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e
```

**Add this line:**
```
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## 🐳 Docker Services Setup

### Step 1: Clone Repository

```bash
cd /opt
git clone <your-repo-url> medusa
cd medusa
```

### Step 2: Configure Environment Variables

```bash
# Create .env file
cp env.template .env
nano .env
```

**Update these critical values:**

```bash
# Node Environment
NODE_ENV=production

# PostgreSQL
POSTGRES_DB=icfix_db
POSTGRES_USER=icfix_user
POSTGRES_PASSWORD=$(openssl rand -base64 24)
DATABASE_URL=postgresql://icfix_user:${POSTGRES_PASSWORD}@postgres:5432/icfix_db

# Redis
REDIS_URL=redis://redis:6379

# MeiliSearch
MEILISEARCH_API_KEY=$(openssl rand -base64 24)
MEILISEARCH_ENV=production

# Medusa Security
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# CORS
STORE_CORS=https://yourdomain.com,https://www.yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
AUTH_CORS=https://admin.yourdomain.com

# Cloudflare R2 (Optional)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_REGION=auto
R2_BUCKET=your-bucket-name
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_FILE_URL=https://cdn.yourdomain.com

# Webhooks
WEBHOOK_TARGET_BASE=https://yourdomain.com/api/revalidate
REVALIDATE_SECRET=$(openssl rand -base64 32)
```

---

### Step 3: Start All Docker Services

```bash
# Start all services in detached mode
docker-compose -f docker-compose-prod.yml up -d

# Check services status
docker-compose -f docker-compose-prod.yml ps
```

**Expected output:**
```
NAME                STATUS              PORTS
icfix-backend       Up (healthy)        9000/tcp
icfix-postgres      Up (healthy)        5432/tcp
icfix-redis         Up (healthy)        6379/tcp
icfix-meilisearch   Up (healthy)        7700/tcp
icfix-nginx         Up                  80/tcp, 443/tcp
icfix-certbot       Up
```

---

### Step 4: View Logs

```bash
# View all logs
docker-compose -f docker-compose-prod.yml logs -f

# View specific service
docker logs -f icfix-backend
docker logs -f icfix-postgres
```

**Wait for:** `Database connection established` in backend logs

---

## 🗄️ Database Migration

### Run Database Migrations

```bash
# Execute migration inside backend container
docker exec -it icfix-backend npm run db:migrate
```

**Expected output:**
```
✔ Migrations executed successfully
```

**Verify migrations:**

```bash
# Connect to database
docker exec -it icfix-postgres psql -U icfix_user icfix_db

# List tables
\dt

# Should see: product, region, customer, order, etc.
# Exit
\q
```

---

## 🌱 Seed Data

### Run Seed Script

Populate database with Vietnam market data (VND currency, tech products):

```bash
docker exec -it icfix-backend npm run seed
```

**Expected output:**
```
info: Seeding store data...
info: Seeding region data...
info: Finished seeding regions.
info: Seeding tax regions...
info: Finished seeding tax regions.
info: Seeding stock location data...
info: Seeding fulfillment data...
info: Finished seeding fulfillment data.
info: Seeding product data...
info: Finished seeding product data.
info: Seeding inventory levels.
info: Finished seeding inventory levels data.
```

---

### What Gets Seeded

✅ **Region:** Vietnam (VND currency)  
✅ **Shipping:** Standard (35,000 VND), Express (75,000 VND)  
✅ **Products:** 4 tech products with 22 variants  
✅ **Categories:** Smartphones, Accessories, Components, Laptops  
✅ **Stock:** 1,000,000 units per variant  
✅ **Payment:** Cash on Delivery (COD)  

**Products:**
- iPhone 15 Pro: 28.9M - 44.9M VND
- USB-C Charger 67W: 890K - 1.59M VND
- iPhone Battery Kit: 890K - 1.29M VND
- MacBook Air M3: 27.9M - 47.9M VND

---

## 👤 Create Admin User

### Create First Admin User

```bash
docker exec -it icfix-backend npx medusa user \
  -e admin@yourdomain.com \
  -p SecurePassword123
```

**Expected output:**
```
User created successfully!
Email: admin@yourdomain.com
```

### Access Admin Panel

**Enable Admin UI** (if disabled):

```bash
# Edit .env
nano .env

# Set:
MEDUSA_ADMIN_DISABLE=false

# Restart backend
docker restart icfix-backend
```

**Access Admin:**
- URL: https://admin.yourdomain.com/app
- Login with credentials created above

---

## 🔍 Initialize MeiliSearch

### Setup Product Search

```bash
docker exec -it icfix-backend npm run init-search
```

**Expected output:**
```
Initializing MeiliSearch...
✔ Created index: products
✔ Configured searchable attributes
✔ Configured filterable attributes
✔ Products indexed successfully
Done!
```

### Verify MeiliSearch

```bash
# Check health
curl http://localhost:7700/health

# Should return:
# {"status":"available"}
```

---

## 🔔 Setup Webhooks

Webhooks enable automatic cache invalidation on storefront when products change.

### Step 1: Get Admin API Key

```bash
# After logging into admin, go to:
# Settings → Secret API Keys → Create Key

# Or get from database:
docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
  "SELECT token FROM api_key WHERE type='secret' LIMIT 1;"
```

### Step 2: Update .env with API Key

```bash
nano .env

# Add:
ADMIN_API_KEY=sk_xxxxxxxxxxxxx
```

### Step 3: Create Webhooks

```bash
docker exec -it icfix-backend npm run create-webhooks
```

**Expected output:**
```
=== Medusa Admin Webhook Setup ===
Backend : http://localhost:9000
Target  : https://yourdomain.com/api/revalidate?secret=***&event=<event>
Auth    : Secret API Key (Basic)
Method  : POST
Events  : product.created, product.updated, product.deleted, ...
==================================
✔ Created webhook for "product.created" (id=wh_xxx)
✔ Created webhook for "product.updated" (id=wh_xxx)
...
Done.
```

### Verify Webhooks

In Admin UI: **Settings → Webhooks** - should see 12 webhooks created

---

## 🛍️ Storefront Setup

### Step 1: Get Publishable API Key

```bash
# Get from database
docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
  "SELECT token FROM api_key WHERE type='publishable' ORDER BY created_at DESC LIMIT 1;"
```

Copy the token (starts with `pk_`)

---

### Step 2: Configure Storefront Environment

```bash
cd icfix-storefront

# Copy template
cp env.example .env.local

# Edit
nano .env.local
```

**Add these values:**

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx
NEXT_PUBLIC_DEFAULT_REGION=vn
REVALIDATE_SECRET=<same-as-backend>
```

---

### Step 3: Build & Run Storefront

**Development:**
```bash
yarn install
yarn dev
```

**Production:**
```bash
yarn build
yarn start
```

**Or use PM2:**
```bash
npm install -g pm2
pm2 start yarn --name "storefront" -- start
pm2 save
pm2 startup
```

---

## ✅ Verification

### Backend Verification

```bash
# Health check
curl https://api.yourdomain.com/health
# Response: {"status":"ok"}

# Check regions
curl https://api.yourdomain.com/store/regions
# Response: {"regions":[{"name":"Vietnam",...}]}

# Check products
curl https://api.yourdomain.com/store/products
# Response: {"products":[...], "count":4}
```

---

### Storefront Verification

```bash
# Homepage
curl https://yourdomain.com
# Should redirect to /vn

# Check Vietnam page
curl https://yourdomain.com/vn
# Should return 200 OK
```

**Browser Tests:**
1. ✅ Open https://yourdomain.com
2. ✅ Auto-redirects to /vn
3. ✅ Products display with VND prices
4. ✅ Search works
5. ✅ Cart & checkout work
6. ✅ COD payment available

---

### Admin Verification

1. ✅ Access https://admin.yourdomain.com/app
2. ✅ Login with admin credentials
3. ✅ Products visible (4 tech products)
4. ✅ Regions show Vietnam
5. ✅ Webhooks configured (12 webhooks)

---

## 🐛 Troubleshooting

### Issue: Services Won't Start

```bash
# Check service status
docker-compose -f docker-compose-prod.yml ps

# View logs
docker-compose -f docker-compose-prod.yml logs

# Restart all
docker-compose -f docker-compose-prod.yml restart
```

---

### Issue: Database Connection Failed

```bash
# Check PostgreSQL
docker exec icfix-postgres pg_isready -U icfix_user

# Check DATABASE_URL
docker exec icfix-backend printenv DATABASE_URL

# Restart database
docker restart icfix-postgres
docker restart icfix-backend
```

---

### Issue: 500 Error on Storefront

```bash
# 1. Verify publishable key exists
docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
  "SELECT id, token FROM api_key WHERE type='publishable';"

# 2. Check .env.local has correct key
cat icfix-storefront/.env.local

# 3. Clear Next.js cache
cd icfix-storefront
rm -rf .next
yarn dev
```

---

### Issue: Products Not Showing

```bash
# 1. Verify products in backend
curl https://api.yourdomain.com/store/products

# 2. If empty, reseed
docker exec -it icfix-backend npm run reseed

# 3. Reinitialize search
docker exec -it icfix-backend npm run init-search
```

---

### Issue: SSL Certificate Error

```bash
# Renew certificate
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx

# Check certificate expiry
sudo certbot certificates
```

---

## 🔄 Maintenance Commands

### Backup Database

```bash
# Create backup
docker exec icfix-postgres pg_dump -U icfix_user icfix_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i icfix-postgres psql -U icfix_user icfix_db < backup_20251013.sql
```

---

### Update Application

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose -f docker-compose-prod.yml build

# Restart services
docker-compose -f docker-compose-prod.yml up -d

# Run new migrations
docker exec -it icfix-backend npm run db:migrate
```

---

### Clear & Reseed Data

```bash
# Clear existing seed data
docker exec -it icfix-backend npm run clear-seed

# Reseed with fresh data
docker exec -it icfix-backend npm run seed

# Reinitialize search
docker exec -it icfix-backend npm run init-search
```

---

### Monitor Services

```bash
# View all logs
docker-compose -f docker-compose-prod.yml logs -f

# Check resource usage
docker stats

# Check disk space
df -h
```

---

## 📊 Quick Reference Commands

### Docker Services
```bash
# Start all services
docker-compose -f docker-compose-prod.yml up -d

# Stop all services
docker-compose -f docker-compose-prod.yml down

# Restart all services
docker-compose -f docker-compose-prod.yml restart

# View logs
docker-compose -f docker-compose-prod.yml logs -f
```

### Database Operations
```bash
# Run migrations
docker exec -it icfix-backend npm run db:migrate

# Seed data
docker exec -it icfix-backend npm run seed

# Clear seed data
docker exec -it icfix-backend npm run clear-seed

# Reseed (clear + seed)
docker exec -it icfix-backend npm run reseed
```

### User & API Management
```bash
# Create admin user
docker exec -it icfix-backend npx medusa user -e admin@example.com -p Pass123

# Get publishable key
docker exec -it icfix-postgres psql -U icfix_user icfix_db -c \
  "SELECT token FROM api_key WHERE type='publishable' LIMIT 1;"

# Create webhooks
docker exec -it icfix-backend npm run create-webhooks
```

### Search
```bash
# Initialize MeiliSearch
docker exec -it icfix-backend npm run init-search

# Check MeiliSearch health
curl http://localhost:7700/health
```

---

## 🎯 Complete Deployment Checklist

### Pre-Deployment
- [ ] Domain DNS points to server IP
- [ ] Ports 80, 443 open on firewall
- [ ] Docker & Docker Compose installed
- [ ] Nginx installed and configured
- [ ] SSL certificates obtained

### Deployment
- [ ] Git repository cloned
- [ ] `.env` file configured
- [ ] Docker services started
- [ ] Database migrated
- [ ] Data seeded
- [ ] Admin user created
- [ ] MeiliSearch initialized
- [ ] Webhooks created
- [ ] Storefront configured

### Verification
- [ ] Backend health check passes
- [ ] Admin UI accessible
- [ ] Storefront loads
- [ ] Products display correctly
- [ ] Search works
- [ ] Cart & checkout functional
- [ ] Webhooks triggering
- [ ] SSL certificates valid

### Post-Deployment
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Setup auto-renewal for SSL
- [ ] Document admin credentials
- [ ] Test all features

---

## 🔐 Security Checklist

- [ ] ✅ Strong passwords for all services
- [ ] ✅ JWT_SECRET and COOKIE_SECRET are random
- [ ] ✅ HTTPS enabled everywhere
- [ ] ✅ CORS properly configured
- [ ] ✅ Database not publicly accessible
- [ ] ✅ Redis not publicly accessible
- [ ] ✅ MeiliSearch has API key
- [ ] ✅ Admin UI password protected
- [ ] ✅ Regular backups configured
- [ ] ✅ SSL auto-renewal working

---

## 📚 Service URLs

| Service | URL | Access |
|---------|-----|--------|
| **Storefront** | https://yourdomain.com | Public |
| **Admin UI** | https://admin.yourdomain.com/app | Password protected |
| **Backend API** | https://api.yourdomain.com | API key required |
| **MeiliSearch** | http://localhost:7700 | Internal only |
| **PostgreSQL** | localhost:5432 | Internal only |
| **Redis** | localhost:6379 | Internal only |

---

## 🎉 Success!

Your Medusa e-commerce platform is now deployed with:

- ✅ **Vietnam Market Ready** - VND currency, COD payment
- ✅ **4 Tech Products** - iPhone, Charger, Battery, MacBook
- ✅ **Secure HTTPS** - SSL certificates configured
- ✅ **Search Enabled** - MeiliSearch powered
- ✅ **Auto Cache Invalidation** - Webhooks configured
- ✅ **Production Ready** - Docker orchestrated

**Access your store:** https://yourdomain.com 🚀

---

**Last Updated:** 2025-10-13  
**Medusa Version:** 2.10.1  
**Next.js Version:** 15.3.1

