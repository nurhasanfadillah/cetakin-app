# Deploy Guide - cetakin.com to Netlify

## Prerequisites

1. **GitHub Account** - for storing the codebase
2. **Netlify Account** - [sign up free](https://netlify.com)
3. **Supabase Project** - for database
4. **Midtrans Account** - for payments (optional)

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git (if not already)

```bash
cd landing-page-cetakin/ver-1

git init
git add .
git commit -m "Initial commit - cetakin.com v1"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name: `cetakin-app`
4. Visibility: Private or Public
5. Click **Create Repository**

### 1.3 Push to GitHub

```bash
# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/cetakin-app.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Connect Netlify to GitHub

### 2.1 Add New Site

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub** as provider
4. Authorize Netlify to access GitHub (if first time)

### 2.2 Configure Build

| Setting | Value |
|---------|-------|
| **Repository** | `cetakin-app` |
| **Branch** | `main` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

### 2.3 Add Environment Variables

Click **Add environment variables** and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_ENVIRONMENT=sandbox
VITE_SITE_URL=https://your-site.netlify.app
```

> **Important:** For production, set `MIDTRANS_ENVIRONMENT=production`

### 2.4 Deploy

Click **Deploy site**. First deploy takes ~1-2 minutes.

---

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Domain

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter `cetakin.com`

### 3.2 Configure DNS

In your DNS provider, add:

```
Type: CNAME
Name: www (or @)
Value: your-site.netlify.app
```

### 3.3 HTTPS

Netlify automatically provides SSL. Enable **HTTPS** in domain settings.

---

## Step 4: Configure Supabase

### 4.1 Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 4.2 Run Database Migration

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

Or run manually in Supabase Dashboard → **SQL Editor**:

```sql
-- Run contents of supabase/migrations/001_initial.sql
-- Then run supabase/migrations/002_enhanced_rls.sql
```

### 4.3 Configure Auth Redirect

In Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: https://cetakin.com
Redirect URLs:
  - https://cetakin.com
  - https://www.cetakin.com
  - http://localhost:5173 (for development)
```

---

## Step 5: Configure Midtrans (Optional)

### 5.1 Get Midtrans Keys

1. Go to [midtrans.com](https://midtrans.com)
2. Dashboard → **Settings** → **Access Keys**
3. Copy:
   - Client Key → `VITE_MIDTRANS_CLIENT_KEY`
   - Server Key → `MIDTRANS_SERVER_KEY`

### 5.2 Update Netlify Environment Variables

Add in Netlify dashboard:

```env
VITE_MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_ENVIRONMENT=sandbox  # or production
```

### 5.3 Configure Webhook

In Midtrans Dashboard → **Settings** → **Payment Notification**:

```
Webhook URL: https://cetakin.com/api/payment-webhook
```

### 5.4 Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Deploy webhook function
supabase functions deploy payment-webhook
```

---

## Step 6: Update Netlify Config

Your `netlify.toml` should already be configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Step 7: Verify Deployment

### Check Points

1. **Landing Page** - `/` loads correctly
2. **Order Page** - Form submission works
3. **Login** - Auth flow works
4. **Admin Dashboard** - Protected routes work
5. **Database** - Data syncing correctly

### Test Commands

```bash
# Local development
npm run dev

# Production build test
npm run build
npm run preview
```

---

## Troubleshooting

### Build Fails

```
Error: Cannot find module './some-module'
```

→ Run `npm install` locally and commit `package-lock.json`

### 404 on Routes

```
Netlify redirects not working
```

→ Verify `netlify.toml` has correct redirect rules

### Auth Not Working

```
Auth redirect fails
```

→ Check Supabase URL Configuration (Step 4.3)

### Environment Variables Not Loading

```
VITE_* variables are undefined
```

→ Rebuild in Netlify after adding env vars (trigger deploy)

---

## Production Checklist

- [ ] Domain connected
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Auth redirects configured
- [ ] Midtrans keys (if payment enabled)
- [ ] Webhook configured (if payment enabled)
- [ ] Test checkout flow
- [ ] Set `MIDTRANS_ENVIRONMENT=production`

---

## Quick Deploy Commands

```bash
# Connect to Netlify via CLI
npm install -g netlify-cli
netlify login
netlify init

# Deploy
netlify deploy --prod

# View logs
netlify functions:invoke payment-webhook --tail
```

---

## Support

- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- Midtrans Docs: https://midtrans.com/docs