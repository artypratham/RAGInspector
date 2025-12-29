# Free Deployment Guide - RAG Inspector

Complete guide to deploy RAG Inspector (Frontend + Backend) using **100% free** services.

## 🎯 Overview

- **Frontend**: Vercel (Free)
- **Backend**: Render.com or Railway (Free)
- **Database**: Neon PostgreSQL (Free)
- **Total Cost**: $0/month

---

## 📋 Prerequisites

1. GitHub account
2. [Vercel](https://vercel.com) account (sign up with GitHub)
3. [Render](https://render.com) or [Railway](https://railway.app) account
4. [Neon](https://neon.tech) account for PostgreSQL database

---

## 🗄️ Step 1: Database Setup (Neon PostgreSQL)

### Create Free Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Configure:
   - **Project Name**: `rag-inspector-db`
   - **Region**: Choose closest to your users (e.g., Singapore, US East)
   - **PostgreSQL Version**: 16 (recommended)
4. Click **"Create Project"**
5. Copy the **connection string** (looks like):
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
   ```

### Important Notes
- ✅ Free tier includes: 512 MB storage, 1 project
- ✅ No credit card required
- ✅ Serverless - auto-scales to zero
- ✅ Connection pooling included

---

## 🚀 Step 2: Backend Deployment

### Option A: Render.com (Recommended)

**Pros**: Simple setup, auto-deploy from Git, 750 hrs/month free
**Cons**: Cold starts after 15 min inactivity (~30s spin-up)

#### Deploy Steps

1. **Push Backend to GitHub**
   ```bash
   cd RAGInspector
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Click **"Connect"** next to your repo

3. **Configure Build Settings**
   ```yaml
   Name: rag-inspector-api
   Region: Singapore (or your choice)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**

   Click **"Environment"** tab and add:
   ```env
   DATABASE_URL=postgresql://your-neon-connection-string-here
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   NODE_ENV=production
   PORT=5000
   ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment
   - Copy your backend URL: `https://rag-inspector-api.onrender.com`

#### Update CORS for Frontend

After deployment, update `backend/src/index.ts` to allow your frontend domain:

```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({
  origin: [FRONTEND_URL, 'https://your-app.vercel.app'],
  credentials: true
}))
```

Push changes and Render will auto-redeploy.

---

### Option B: Railway.app (Alternative)

**Pros**: No cold starts, faster performance, $5 free credit/month
**Cons**: Limited to ~500 hours/month with free credit

#### Deploy Steps

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select **root directory**: `backend`
6. Railway auto-detects Node.js and builds
7. Add environment variables in **Settings → Variables**:
   ```env
   DATABASE_URL=postgresql://your-neon-connection-string
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   ```
8. Copy your backend URL from **Settings → Domains**

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### Deploy to Vercel

1. **Connect GitHub Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"**
   - Select your `RAGInspector` repository
   - Click **"Import"**

2. **Configure Project**
   ```yaml
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variable**

   In **Settings → Environment Variables**, add:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

   Example:
   ```env
   VITE_API_URL=https://rag-inspector-api.onrender.com/api
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app.vercel.app`

5. **Update Backend CORS**

   Add your Vercel URL to backend environment variables:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```

---

## ✅ Step 4: Verify Deployment

### Test Backend API

```bash
# Health check
curl https://your-backend.onrender.com/health

# Signup test
curl -X POST https://your-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login test
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Frontend

1. Visit your Vercel URL
2. Sign up with a new account
3. Upload schema + output JSON
4. Annotate fields (mark as correct/incorrect)
5. Submit annotations
6. Check sidebar for submitted extractions
7. Download PDF/JSON reports

---

## 🔧 Environment Variables Reference

### Backend Environment Variables
```env
# Database (from Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# App Config
NODE_ENV=production
PORT=5000

# Frontend CORS (from Vercel)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Environment Variables
```env
# Backend API (from Render/Railway)
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📊 Free Tier Limits

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Neon DB** | 512 MB storage | 1 project, auto-suspend after inactivity |
| **Render** | 750 hrs/month | Cold starts after 15 min, ~30s spin-up |
| **Railway** | $5 credit/month | ~500 hours/month, no cold starts |
| **Vercel** | Unlimited | 100 GB bandwidth, 100 deployments/day |

**Total Cost**: **$0/month** for small-medium usage

---

## 🚨 Troubleshooting

### Backend Not Starting
- **Check logs** in Render/Railway dashboard
- Verify `DATABASE_URL` is correct (includes `?sslmode=require`)
- Ensure `JWT_SECRET` is at least 32 characters
- Check build command: `npm install && npx prisma generate && npm run build`

### Frontend Can't Connect
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend CORS allows your frontend domain
- Ensure backend is running (check Render/Railway dashboard)
- Test backend API directly with curl

### Database Connection Errors
- Ensure Neon database is active (not suspended)
- Verify connection string includes `?sslmode=require`
- Check Neon dashboard for connection pooling settings
- Run `npx prisma migrate deploy` if needed

### CORS Errors
- Add your Vercel domain to backend CORS config
- Set `FRONTEND_URL` in backend environment variables
- Redeploy backend after CORS changes

### Cold Start Issues (Render)
- First request after 15 min takes ~30s
- Consider Railway if cold starts are problematic
- Use [Uptime Robot](https://uptimerobot.com) (free) to ping every 10 min

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Database connected and migrations run
- [ ] Frontend deployed and loading
- [ ] Signup/Login working
- [ ] Extraction creation working
- [ ] Annotations saving correctly
- [ ] Sidebar showing submitted extractions
- [ ] PDF report download working
- [ ] CORS properly configured
- [ ] Environment variables set correctly

---

## 🔄 Auto-Deployment

Both Vercel and Render/Railway support **automatic deployments**:

- **Push to GitHub** → Automatically redeploys
- **Main branch** → Production deployment
- **Other branches** → Preview deployments (Vercel)

Example workflow:
```bash
git add .
git commit -m "Add new feature"
git push origin main
# Vercel + Render automatically deploy within 2-3 minutes
```

---

## 📈 Scaling (When You Outgrow Free Tier)

### Upgrade Path
1. **Render**: $7/month for persistent instances (no cold starts)
2. **Railway**: $20/month for higher limits
3. **Vercel**: $20/month Pro plan for teams
4. **Neon**: $19/month for 3 GB storage

### Recommended First Upgrade
- Render **Starter Plan** ($7/month) - eliminates cold starts
- Keep everything else free initially

---

## 🎉 Success!

Your RAG Inspector is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Neon PostgreSQL (serverless)

Share your app, collect feedback, and iterate! 🚀
