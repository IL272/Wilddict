# WildDict - Deployment Guide

## 🚀 Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add user isolation and deployment configuration"
git push origin main
```

### Step 2: Deploy Backend on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository `IL272/Wilddict`
5. Railway will auto-detect the Dockerfile in `backend/`

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL` environment variable

### Step 4: Set Environment Variables

In Railway project settings, add:
- `SECRET_KEY`: Generate a secure random string
- `CORS_ORIGINS`: Your frontend URL (e.g., `https://il272.github.io`)

### Step 5: Deploy Frontend to GitHub Pages

The frontend is already configured to deploy automatically via GitHub Actions.

1. Go to your GitHub repository settings
2. Navigate to Pages → Source → GitHub Actions
3. Push any commit to `main` branch
4. GitHub Actions will build and deploy automatically

### Step 6: Update Frontend API URL

After Railway backend is deployed, update the API URL:

1. Get your Railway backend URL (e.g., `https://wilddict-production.up.railway.app`)
2. In GitHub repository settings, go to "Secrets and variables" → "Actions"
3. Add a new secret: `VITE_API_URL` with your Railway backend URL
4. Re-run the GitHub Actions deployment

## 🔧 Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
npm install
npm run dev
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Railway provides this
SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=https://il272.github.io,http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.up.railway.app
```

## 🎯 Deployment Checklist

- ✅ Backend code pushed to GitHub
- ✅ Railway project created
- ✅ PostgreSQL database added
- ✅ Environment variables set
- ✅ Backend deployed and running
- ✅ Frontend GitHub Actions workflow enabled
- ✅ Frontend API URL updated
- ✅ CORS configured correctly

## 🐛 Troubleshooting

### Backend not starting
- Check Railway logs for errors
- Verify DATABASE_URL is set correctly
- Ensure all dependencies in requirements.txt

### Frontend can't connect to backend
- Verify CORS_ORIGINS includes your frontend domain
- Check VITE_API_URL is correctly set
- Ensure backend is running (check Railway status)

### Database connection errors
- Verify PostgreSQL service is running in Railway
- Check DATABASE_URL format is correct
- Ensure Railway backend and database are linked
