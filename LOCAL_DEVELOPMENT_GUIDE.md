# 🚀 Local Development Setup Guide

## Overview

This guide will help you run all three services locally:
- **Backend API**: Port 9000
- **Admin Dashboard**: Port 7000  
- **Storefront**: Port 3000

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** 20+ installed
- ✅ **PostgreSQL** installed and running
- ✅ **Redis** installed and running (optional but recommended)
- ✅ **Yarn** installed (`npm install -g yarn`)

---

## 🔧 Initial Setup (First Time Only)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd /Users/123khongbiet/Documents/medusa/icfix
npm install

# Install storefront dependencies
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
yarn install
```

### Step 2: Set Up Environment Variables

#### Backend Environment (.env)

Create `.env` file in the `icfix` folder:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
cp ../env.template .env
```

Edit `icfix/.env` with your local settings:

```bash
# Node Environment
NODE_ENV=development

# PostgreSQL Database (Local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa_db

# Redis (Local)
REDIS_URL=redis://localhost:6379

# Security (generate random strings)
JWT_SECRET=supersecretjwttoken
COOKIE_SECRET=supersecretcookietoken

# CORS Configuration for Local Development
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7000,http://localhost:9000
AUTH_CORS=http://localhost:7000,http://localhost:9000

# MeiliSearch (Optional - for search)
MEILISEARCH_API_KEY=masterKey
MEILISEARCH_ENV=development

# Gmail (Optional - for email notifications)
GMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
STORE_NAME=ICFix Store
STORE_URL=http://localhost:3000
```

#### Storefront Environment (.env.local)

Create `.env.local` file in the `icfix-storefront` folder:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
touch .env.local
```

Add these variables:

```bash
# Backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API Key (get from admin after setup)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx

# Default Region
NEXT_PUBLIC_DEFAULT_REGION=vn

# Base URL for Storefront
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Revalidation Secret (for webhooks)
REVALIDATE_SECRET=your_revalidate_secret
```

### Step 3: Set Up Database

```bash
cd /Users/123khongbiet/Documents/medusa/icfix

# Create database (if not exists)
createdb medusa_db

# Run migrations
npm run db:migrate

# Seed database with sample data (optional)
npm run seed
```

### Step 4: Create Admin User

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
npm run user:create
```

Follow the prompts to create your admin user.

---

## 🚀 Starting the Services

### Option A: All Services in Separate Terminals (Recommended)

#### Terminal 1: Backend API (Port 9000)

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
npm run dev
```

You should see:
```
✔ Server is ready on port: 9000
```

**Verify**: http://localhost:9000/health

#### Terminal 2: Admin Dashboard (Port 7000)

The admin is built into the backend, but needs to be served separately:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix
npx medusa develop --admin-port 7000
```

**Access Admin**: http://localhost:7000/app

**Login** with the admin user you created in Step 4.

#### Terminal 3: Storefront (Port 3000)

First, update the package.json to use port 3000:

```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
```

Then start the storefront:

```bash
yarn dev --port 3000
```

**Access Storefront**: http://localhost:3000/en

---

### Option B: Using Single Command (Advanced)

You can use a process manager like `concurrently` or `pm2`, but separate terminals are recommended for easier debugging.

---

## 📝 Quick Start Commands Summary

```bash
# Terminal 1 - Backend (Port 9000)
cd icfix && npm run dev

# Terminal 2 - Admin (Port 7000)
cd icfix && npx medusa develop --admin-port 7000

# Terminal 3 - Storefront (Port 3000)
cd icfix-storefront && yarn dev --port 3000
```

---

## 🔍 Verification Checklist

After starting all services, verify each one:

### Backend (Port 9000) ✅
- [ ] Health check: http://localhost:9000/health
- [ ] API docs: http://localhost:9000/docs
- [ ] Should return JSON response

### Admin (Port 7000) ✅
- [ ] Open: http://localhost:7000/app
- [ ] Login page appears
- [ ] Can login with admin credentials
- [ ] Dashboard loads

### Storefront (Port 3000) ✅
- [ ] Open: http://localhost:3000/en
- [ ] Homepage loads
- [ ] Products display
- [ ] Language switcher works
- [ ] Can add items to cart

---

## 🎯 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:9000 | REST API |
| **API Health** | http://localhost:9000/health | Health check |
| **API Docs** | http://localhost:9000/docs | Swagger docs |
| **Admin Dashboard** | http://localhost:7000/app | Admin UI |
| **Storefront (EN)** | http://localhost:3000/en | English store |
| **Storefront (VI)** | http://localhost:3000/vi | Vietnamese store |
| **Storefront (JA)** | http://localhost:3000/ja | Japanese store |
| **Storefront (ZH)** | http://localhost:3000/zh | Chinese store |

---

## 🔑 Getting Publishable API Key

After starting the backend and admin:

1. **Open Admin**: http://localhost:7000/app
2. **Login** with your admin credentials
3. Navigate to **Settings → Publishable API Keys**
4. **Create new key** or copy existing one
5. **Update** `icfix-storefront/.env.local`:
   ```bash
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx
   ```
6. **Restart storefront** for changes to take effect

---

## 🛠️ Troubleshooting

### Backend won't start

**Problem**: Port 9000 already in use
```bash
# Find and kill process using port 9000
lsof -ti:9000 | xargs kill -9
```

**Problem**: Database connection error
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS)
brew services restart postgresql
```

**Problem**: Redis connection error
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (macOS)
brew services start redis
```

### Admin won't load

**Problem**: 404 error
- Ensure backend is running first
- Check `ADMIN_CORS` in `.env` includes `http://localhost:7000`
- Clear browser cache

**Problem**: Login fails
```bash
# Create a new admin user
cd icfix
npm run user:create
```

### Storefront won't start

**Problem**: Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Problem**: Cannot connect to backend
- Verify backend is running: http://localhost:9000/health
- Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL` in `.env.local`
- Verify `STORE_CORS` in backend `.env` includes `http://localhost:3000`

**Problem**: Products not loading
- Ensure you have a publishable API key configured
- Check if database is seeded: `cd icfix && npm run seed`
- Verify regions are set up in admin

### CORS Errors

If you see CORS errors in the browser console:

1. **Check backend `.env`**:
   ```bash
   STORE_CORS=http://localhost:3000
   ADMIN_CORS=http://localhost:7000,http://localhost:9000
   AUTH_CORS=http://localhost:7000,http://localhost:9000
   ```

2. **Restart backend** after changing CORS settings

3. **Clear browser cache** (Cmd+Shift+R or Ctrl+Shift+R)

---

## 🔄 Database Management

### Reset Database
```bash
cd icfix

# Clear all data
npm run clear-seed

# Re-seed with sample data
npm run seed
```

### Run Migrations
```bash
cd icfix
npm run db:migrate
```

### Create New Migration
```bash
cd icfix
npx medusa migration:generate DescriptionOfChanges
```

---

## 📦 Useful Scripts

### Backend (icfix/)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run db:migrate       # Run database migrations
npm run seed             # Seed database with sample data
npm run clear-seed       # Clear seed data
npm run reseed           # Clear and re-seed
npm run user:create      # Create admin user
```

### Storefront (icfix-storefront/)
```bash
yarn dev                 # Start development server (port 8000 default)
yarn dev --port 3000     # Start on specific port
yarn build               # Build for production
yarn start               # Start production server
yarn lint                # Run ESLint
```

---

## 🌍 Multilingual Storefront

The storefront now supports multiple languages:

| Language | URL | Status |
|----------|-----|--------|
| English | http://localhost:3000/en | ✅ Complete |
| Vietnamese | http://localhost:3000/vi | ⏳ Needs translation |
| Japanese | http://localhost:3000/ja | ⏳ Needs translation |
| Chinese | http://localhost:3000/zh | ⏳ Needs translation |

**Language Switcher**: Available in the top navigation bar (globe icon)

---

## 📊 Development Workflow

### Typical Development Session

1. **Start Services** (3 terminals):
   ```bash
   # Terminal 1
   cd icfix && npm run dev
   
   # Terminal 2  
   cd icfix && npx medusa develop --admin-port 7000
   
   # Terminal 3
   cd icfix-storefront && yarn dev --port 3000
   ```

2. **Make Changes**:
   - Backend changes auto-reload
   - Storefront changes hot-reload
   - Admin may need manual refresh

3. **Test**: 
   - Test in browser: http://localhost:3000/en
   - Check admin: http://localhost:7000/app
   - Verify API: http://localhost:9000/health

4. **Stop Services**: Ctrl+C in each terminal

---

## 🎨 VS Code Setup (Optional)

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/icfix/node_modules/.bin/medusa",
      "args": ["develop"],
      "cwd": "${workspaceFolder}/icfix"
    }
  ]
}
```

---

## 📚 Next Steps

After successful local setup:

1. ✅ Explore the Admin Dashboard
2. ✅ Create products and collections
3. ✅ Set up payment providers
4. ✅ Configure shipping options
5. ✅ Test the checkout flow
6. ✅ Translate storefront UI (see MULTILINGUAL_TRANSLATION_REPORT.md)

---

## 🆘 Getting Help

- **Backend Issues**: Check logs in terminal
- **Admin Issues**: Check browser console (F12)
- **Storefront Issues**: Check Next.js error overlay
- **Database Issues**: Check PostgreSQL logs

**Logs Location**:
- Backend: Console output
- Next.js: `.next/` folder
- PostgreSQL: System logs

---

## ✅ Quick Checklist

Before you start development:
- [ ] PostgreSQL running
- [ ] Redis running (optional)
- [ ] `.env` file configured in `icfix/`
- [ ] `.env.local` file configured in `icfix-storefront/`
- [ ] Database migrated
- [ ] Database seeded
- [ ] Admin user created
- [ ] Publishable API key generated

---

**Happy Coding! 🚀**

For more information, see:
- MULTILINGUAL_IMPLEMENTATION_GUIDE.md
- MULTILINGUAL_TRANSLATION_REPORT.md

