# ⚡ Quick Start - Local Development

## 🚀 Start All Services (3 Terminals)

### Terminal 1: Backend (Port 9000)
```bash
cd /Users/123khongbiet/Documents/medusa/icfix
npm run dev
```
**Verify**: http://localhost:9000/health

---

### Terminal 2: Admin (Port 7000)
```bash
cd /Users/123khongbiet/Documents/medusa/icfix
npx medusa develop --admin-port 7000
```
**Access**: http://localhost:7000/app

---

### Terminal 3: Storefront (Port 3000)
```bash
cd /Users/123khongbiet/Documents/medusa/icfix-storefront
yarn dev
```
**Access**: http://localhost:3000/en

---

## 📍 Quick Access URLs

| Service | URL |
|---------|-----|
| 🔧 Backend API | http://localhost:9000 |
| 🏥 Health Check | http://localhost:9000/health |
| 👨‍💼 Admin Dashboard | http://localhost:7000/app |
| 🛒 Storefront (EN) | http://localhost:3000/en |
| 🛒 Storefront (VI) | http://localhost:3000/vi |
| 🛒 Storefront (JA) | http://localhost:3000/ja |
| 🛒 Storefront (ZH) | http://localhost:3000/zh |

---

## ⚙️ First Time Setup

```bash
# 1. Create .env files
cd /Users/123khongbiet/Documents/medusa/icfix
cp ../env.template .env
# Edit .env with your settings

cd /Users/123khongbiet/Documents/medusa/icfix-storefront
touch .env.local
# Add required variables (see LOCAL_DEVELOPMENT_GUIDE.md)

# 2. Install dependencies
cd /Users/123khongbiet/Documents/medusa/icfix
npm install

cd /Users/123khongbiet/Documents/medusa/icfix-storefront
yarn install

# 3. Setup database
cd /Users/123khongbiet/Documents/medusa/icfix
npm run db:migrate
npm run seed
npm run user:create
```

---

## 🛠️ Troubleshooting

### Kill processes on ports
```bash
# Port 9000 (Backend)
lsof -ti:9000 | xargs kill -9

# Port 7000 (Admin)  
lsof -ti:7000 | xargs kill -9

# Port 3000 (Storefront)
lsof -ti:3000 | xargs kill -9
```

### Check services
```bash
# PostgreSQL
pg_isready

# Redis
redis-cli ping
```

---

## 📚 Full Documentation

For complete setup instructions, see:
- **LOCAL_DEVELOPMENT_GUIDE.md** - Detailed setup guide
- **MULTILINGUAL_IMPLEMENTATION_GUIDE.md** - i18n guide
- **MULTILINGUAL_TRANSLATION_REPORT.md** - Translation tasks

