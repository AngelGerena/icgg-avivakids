# Netlify Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy via Netlify UI (Easiest - 2 minutes)

1. **Go to Netlify**: Visit [app.netlify.com](https://app.netlify.com)

2. **Sign Up/Login**: Create a free account or log in

3. **Deploy Site**:
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the entire `dist` folder from this project
   - Wait 30 seconds for deployment

4. **Configure Environment Variables**:
   - Go to Site settings → Environment variables
   - Add these two variables:
     ```
     VITE_SUPABASE_URL=https://aamdalhjwroogiscpxqu.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbWRhbGhqd3Jvb2dpc2NweHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjY0MzgsImV4cCI6MjA5MTAwMjQzOH0.49pH5YWjokNcS9MRdJ3nMFMRx9ATzKxZNPlwLiaBz3g
     ```

5. **Set Custom Domain** (Optional):
   - Go to Domain settings
   - Add your custom domain: `www.icgg-avivakids.org`
   - Follow DNS configuration instructions

6. **Test Facebook Sharing**:
   - Copy your Netlify URL (e.g., `https://your-site.netlify.app`)
   - Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Paste your URL and click "Debug"
   - All meta tags should now appear correctly!

---

### Option 2: Deploy via GitHub (Automatic updates)

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Click "Deploy site"

3. **Add Environment Variables** (same as Option 1, step 4)

4. **Enable Automatic Deployments**:
   - Every push to `main` branch will auto-deploy
   - Changes go live in ~2 minutes

---

## What's Included

✅ **Configured Files**:
- `netlify.toml` - Build and redirect configuration
- `.env.example` - Environment variable template
- Meta tags in `index.html` - Facebook/Twitter sharing

✅ **Features**:
- SPA routing (all routes redirect to index.html)
- Asset caching (1 year for /assets/*)
- Security headers
- Environment variable support

---

## After Deployment

### Update Your Domain References

Once deployed, you may need to update these files with your new Netlify URL:

1. **index.html** (line 15, 16, 18-19, 30, 33):
   - Change `https://www.icgg-avivakids.org/` to your Netlify URL
   - Or keep it if you're using custom domain

2. **Supabase Edge Function**:
   - Update allowed origins if needed for CORS

### Test Your Deployment

1. Visit your site
2. Check all routes work (Home, Check-In, Calendar, etc.)
3. Test Facebook sharing with the debugger
4. Verify Supabase connection works

---

## Troubleshooting

**Environment variables not working?**
- Rebuild the site after adding env vars
- Make sure they start with `VITE_` prefix

**Routes not working (404 errors)?**
- Check `netlify.toml` is in root directory
- Verify redirects configuration

**Meta tags not showing on Facebook?**
- Wait 24 hours for old cache to expire
- Use "Scrape Again" in Facebook debugger
- Verify meta tags exist in built `dist/index.html`

---

## Cost

✅ **100% FREE** for this project
- Netlify free tier includes:
  - 100GB bandwidth/month
  - Unlimited sites
  - Custom domains
  - SSL certificates
  - Forms (100 submissions/month)

Your site will cost $0/month to run!
