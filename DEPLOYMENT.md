# Production Deployment Guide

## Backend Deployment (Railway)

### 1. Deploy Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `IL272/Wilddict` repository
5. Railway will auto-detect the configuration

### 2. Configure Backend

**Environment Variables (Railway Dashboard):**
- No additional variables needed - SQLite will be created automatically
- Railway will provide `PORT` variable automatically

**Build Settings:**
- Root Directory: `backend`
- Dockerfile Path: `backend/Dockerfile`
- Start Command: Auto-detected from Dockerfile

### 3. Get Backend URL

After deployment, Railway will provide a URL like:
`https://wilddict-production-XXXX.up.railway.app`

---

## Frontend Deployment (Vercel)

### 1. Update Frontend API URL

Before deploying, update `.env.example`:
```env
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 2. Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select `IL272/Wilddict` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - Key: `VITE_API_URL`
     - Value: `https://your-railway-backend-url.railway.app`

### 3. Deploy

Click "Deploy" - Vercel will build and deploy automatically!

Your site will be live at: `https://wilddict.vercel.app` (or custom domain)

---

## Alternative: GitHub Pages (Frontend Only)

Already configured! Just enable in repo settings:
- Settings → Pages → Source: GitHub Actions
- Site will be at: `https://il272.github.io/Wilddict/`

Note: You'll need to update backend URL in code before building.

---

## Post-Deployment

### Update CORS in Backend

After getting Vercel URL, update `backend/main.py`:
```python
allow_origins=[
    "http://localhost:5173",
    "https://wilddict.vercel.app",  # Your Vercel domain
    "https://il272.github.io",
]
```

Then commit and push - Railway will auto-redeploy!

---

## Quick Commands

```bash
# Update environment for production
echo "VITE_API_URL=https://your-backend-url" > .env.local

# Build frontend locally to test
npm run build
npm run preview

# Check backend health
curl https://your-backend-url/api/stats
```

---

## Costs

- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited for personal projects)
- **GitHub Pages**: Free

Total: **$0/month** 🎉
