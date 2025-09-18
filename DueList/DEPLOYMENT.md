
# DueList Deployment Guide for Vercel

## Overview
DueList consists of two parts that need to be deployed separately:
1. **Frontend** (React app) - Deploy to Vercel
2. **Backend** (Node.js API) - Deploy to Vercel Functions or another service

## Prerequisites
- Vercel account (free at vercel.com)
- GitHub account
- Supabase account (for database)
- Google Gemini API key

## Step 1: Deploy Backend API

### Option A: Deploy Backend to Vercel (Serverless Functions)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy Backend on Vercel**
   - Go to vercel.com and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `backend`
   - Add environment variables:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     PORT=5001
     ```
   - Click "Deploy"
   - Note your backend URL (e.g., `https://duelist-backend.vercel.app`)

### Option B: Deploy Backend to Render.com (Recommended for persistent service)

1. **Create account at render.com**

2. **New Web Service**
   - Connect GitHub repo
   - Set root directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5001
   ```

4. **Deploy and get URL** (e.g., `https://duelist-api.onrender.com`)

## Step 2: Deploy Frontend to Vercel

1. **Update Frontend Environment Variable**
   - In Vercel, create new project
   - Import same GitHub repository
   - Set root directory to `frontend`

2. **Configure Build Settings**:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Add Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```
   (Use the URL from your backend deployment)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at the provided Vercel URL

## Step 3: Configure CORS (if needed)

If you encounter CORS issues, update your backend's `index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

## Step 4: Test Your Deployment

1. Visit your frontend URL
2. Upload a test syllabus
3. Verify tasks are created and displayed
4. Test all CRUD operations

## Environment Variables Summary

### Backend (.env)
```
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5001
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-deployment-url
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure backend allows your frontend domain
   - Check Vercel's CORS headers in vercel.json

2. **API Connection Failed**
   - Verify REACT_APP_API_URL is correct
   - Ensure backend is running and accessible
   - Check network tab for actual request URLs

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check Supabase connection pool limits
   - Ensure database tables exist

4. **Build Failures**
   - Check Node version compatibility
   - Verify all dependencies are in package.json
   - Review build logs in Vercel dashboard

## Alternative Backend Hosting Options

- **Heroku**: Similar to Render, with free tier
- **Railway**: Simple deployment with GitHub integration
- **Fly.io**: Good for containerized deployments
- **AWS Lambda**: For serverless deployment
- **Google Cloud Run**: Containerized serverless option

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel)
3. Set up monitoring (Vercel Analytics)
4. Configure error tracking (Sentry)
5. Implement rate limiting for API

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs