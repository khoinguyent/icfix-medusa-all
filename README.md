# 🚀 Medusa E-Commerce Platform

Complete e-commerce platform built with Medusa v2 and Next.js, configured for Vietnam market with VND currency.

---

## 🤖 NEW: Automated Build Failure Detection & Fixing

**Get build errors fixed by AI automatically!**

```bash
# One-time setup (2 minutes)
./scripts/setup-automation.sh

# Then either:
./scripts/watch-builds.sh        # Auto-monitor builds
# OR
./scripts/auto-fix-build.sh      # Quick one-time fix
```

**How it works:**
1. Build fails in GitHub Actions
2. Script auto-fetches logs
3. Opens in Cursor with formatted report
4. Tell Cursor: "Fix these errors"
5. Cursor analyzes and fixes automatically
6. Push → Rebuild → Fixed! ✅

**⚡ Time to fix: ~5 minutes** | **📖 [Read the Quickstart →](./AUTOMATION_SETUP_QUICKSTART.md)**

---

## 📚 Documentation

### **Main Deployment Guide**
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** ⭐ - **Start here!** Complete step-by-step deployment guide
  - Pre-configuration (Nginx + SSL)
  - Docker services setup
  - Database migration
  - Seed data (Vietnam market)
  - Admin user creation
  - MeiliSearch setup
  - Webhook configuration
  - Storefront setup
  - Troubleshooting

---

## 🏗️ Project Structure

```
medusa/
├── DEPLOYMENT.md                    # 📖 Complete deployment guide
├── env.template                     # Backend environment template
├── docker-compose-prod.yml          # Production Docker setup
│
├── icfix/                           # Medusa Backend
│   ├── README.md                    # Backend-specific docs
│   ├── package.json                 # Backend dependencies
│   ├── medusa-config.ts            # Medusa configuration
│   ├── src/
│   │   ├── api/                    # Custom API routes
│   │   ├── admin/                  # Admin UI customizations
│   │   ├── modules/                # Custom modules
│   │   ├── scripts/                # Utility scripts
│   │   │   ├── seed.ts            # Vietnam seed data
│   │   │   ├── clear-seed-data.ts # Clear seed script
│   │   │   ├── initialize-meilisearch.ts
│   │   │   └── create-webhook-via-api.ts
│   │   ├── subscribers/            # Event subscribers
│   │   └── workflows/              # Custom workflows
│   └── plugins/
│       └── notification-gmail-oauth2/
│
└── icfix-storefront/               # Next.js Storefront
    ├── README.md                    # Storefront-specific docs
    ├── env.example                  # Storefront environment template
    ├── package.json                 # Storefront dependencies
    └── src/
        ├── app/                    # Next.js app routes
        ├── modules/                # UI components
        └── lib/                    # Utilities & data fetching
```

---

## 🚀 Quick Start

### 1. **Pre-requisites**
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Nginx & Certbot
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. **Setup SSL** (See DEPLOYMENT.md Step 1)
```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.com \
  -d api.yourdomain.com \
  -d admin.yourdomain.com
```

### 3. **Configure Environment**
```bash
cp env.template .env
nano .env  # Update with your values
```

### 4. **Start Services**
```bash
docker-compose -f docker-compose-prod.yml up -d
```

### 5. **Initialize Database**
```bash
# Run migrations
docker exec -it icfix-backend npm run db:migrate

# Seed demo data (Vietnam market)
docker exec -it icfix-backend npm run seed
```

### 6. **Create Admin User**
```bash
docker exec -it icfix-backend npx medusa user \
  -e admin@yourdomain.com \
  -p SecurePassword123
```

### 7. **Access Services**
- **Storefront:** https://yourdomain.com
- **Admin:** https://admin.yourdomain.com/app
- **API:** https://api.yourdomain.com

---

## 🛠️ NPM Scripts

### Backend Scripts (icfix/)
```bash
npm run build              # Build project
npm run dev                # Development mode
npm run start              # Production mode
npm run db:migrate         # Run database migrations
npm run seed               # Seed demo data
npm run clear-seed         # Clear seeded data
npm run reseed             # Clear + Seed (fresh start)
npm run init-search        # Initialize MeiliSearch
npm run create-webhooks    # Create webhooks
npm run user:create        # Create admin user
```

### Storefront Scripts (icfix-storefront/)
```bash
yarn dev                   # Development mode
yarn build                 # Build for production
yarn start                 # Production mode
```

---

## 🌏 Vietnam Market Configuration

### Default Setup:
- ✅ **Currency:** Vietnamese Dong (VND)
- ✅ **Region:** Vietnam (vn)
- ✅ **Payment:** Cash on Delivery (COD)
- ✅ **Shipping:** 
  - Standard: 35,000 VND (2-3 days)
  - Express: 75,000 VND (24 hours)

### Products Seeded:
1. **iPhone 15 Pro** - 28.9M to 44.9M VND
2. **USB-C Charger 67W** - 890K to 1.59M VND
3. **iPhone Battery Kit** - 890K to 1.29M VND
4. **MacBook Air M3** - 27.9M to 47.9M VND

---

## 🐳 Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **Backend** | icfix-backend | 9000 | Medusa API |
| **Database** | icfix-postgres | 5432 | PostgreSQL 15 |
| **Cache** | icfix-redis | 6379 | Redis 7 |
| **Search** | icfix-meilisearch | 7700 | MeiliSearch v1.5 |
| **Nginx** | icfix-nginx | 80, 443 | Reverse Proxy |
| **Certbot** | icfix-certbot | - | SSL Management |

---

## 🔧 Essential Commands

### Service Management
```bash
# Start all services
docker-compose -f docker-compose-prod.yml up -d

# Stop all services
docker-compose -f docker-compose-prod.yml down

# View logs
docker-compose -f docker-compose-prod.yml logs -f

# Restart service
docker restart icfix-backend
```

### Database Operations
```bash
# Backup database
docker exec icfix-postgres pg_dump -U icfix_user icfix_db > backup.sql

# Restore database
docker exec -i icfix-postgres psql -U icfix_user icfix_db < backup.sql

# Connect to database
docker exec -it icfix-postgres psql -U icfix_user icfix_db
```

### Troubleshooting
```bash
# Check backend health
curl http://localhost:9000/health

# Check products
curl http://localhost:9000/store/products

# View backend logs
docker logs -f icfix-backend

# Check service status
docker-compose -f docker-compose-prod.yml ps
```

---

## 🔐 Security

- ✅ HTTPS/SSL configured via Certbot
- ✅ Strong JWT & Cookie secrets
- ✅ Database credentials secured
- ✅ CORS properly configured
- ✅ API key authentication
- ✅ Admin UI password protected

---

## 📖 Detailed Documentation

### Core Documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide ⭐
- **[AUTOMATION_SETUP_QUICKSTART.md](./AUTOMATION_SETUP_QUICKSTART.md)** - Get automation running in 5 minutes ⚡
- **[AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)** - Complete automation setup & options 🤖
- **[QUICK_DEBUG_GUIDE.md](./QUICK_DEBUG_GUIDE.md)** - One-page quick reference 📋
- **[GITHUB_ACTIONS_DEBUG.md](./GITHUB_ACTIONS_DEBUG.md)** - Detailed debugging guide 🐛

### Component Documentation
- [Backend README](./icfix/README.md) - Backend-specific docs
- [Storefront README](./icfix-storefront/README.md) - Storefront docs
- [Gmail Plugin README](./icfix/plugins/notification-gmail-oauth2/README.md) - Email notifications

### Feature Documentation
- [API Routes](./icfix/src/api/README.md)
- [Admin Customization](./icfix/src/admin/README.md)
- [Custom Modules](./icfix/src/modules/README.md)
- [Scripts](./icfix/src/scripts/README.md)
- [Subscribers](./icfix/src/subscribers/README.md)
- [Workflows](./icfix/src/workflows/README.md)

---

## 🐛 Common Issues

### Issue: 500 Error on Homepage
**Solution:** Check publishable API key in storefront `.env.local`

### Issue: Products Not Showing
**Solution:** Run `docker exec -it icfix-backend npm run reseed`

### Issue: Database Connection Failed
**Solution:** Verify `DATABASE_URL` in `.env` and restart services

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete troubleshooting guide.

---

## 🔄 Update & Maintenance

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose -f docker-compose-prod.yml build

# Restart services
docker-compose -f docker-compose-prod.yml up -d

# Run new migrations
docker exec -it icfix-backend npm run db:migrate

# Update SSL certificates
sudo certbot renew
```

---

## 📊 Tech Stack

- **Backend:** Medusa v2.10.1
- **Storefront:** Next.js 15.3.1
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Search:** MeiliSearch v1.5
- **Proxy:** Nginx
- **SSL:** Let's Encrypt (Certbot)
- **Container:** Docker & Docker Compose

---

## 🤝 Support

For detailed setup instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0  
**License:** MIT

# Trigger Vercel rebuild - Tue Oct 14 14:45:35 +07 2025
# Fix: Add missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY to Vercel - Tue Oct 14 15:02:19 +07 2025
# Fix: Use correct publishable key from admin dashboard - Tue Oct 14 15:16:34 +07 2025
