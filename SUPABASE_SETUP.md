# Supabase Setup Guide - cetakin.com

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name:** cetakin-app
   - **Database Password:** (strong password - save it!)
   - **Region:** Southeast Asia (Singapore) - closest to Indonesia
4. Click **Create new project**
5. Wait for project to be ready (~2 minutes)

---

## Step 2: Get Credentials

In Supabase Dashboard → **Settings** → **API**:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (for edge functions - KEEP SECRET)
```

Save these credentials!

---

## Step 3: Configure Auth Redirects

In Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: https://cetakin-app.netlify.app

Redirect URLs (add these):
- https://cetakin-app.netlify.app
- https://cetakin-app.netlify.app/login
- https://cetakin-app.netlify.app/member
- https://cetakin-app.netlify.app/admin
- http://localhost:5173
```

Click **Save**

---

## Step 4: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase-cli

# Or on Windows
scoop install supabase

# Login to Supabase
supabase login

# Link your project (replace PROJECT_REF with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Option B: Manual SQL (Dashboard)

1. Go to Supabase Dashboard → **SQL Editor**
2. Create **New query**
3. Copy-paste contents of `supabase/migrations/001_initial.sql`
4. Click **Run**
5. Create **New query** again
6. Copy-paste contents of `supabase/migrations/002_enhanced_rls.sql`
7. Click **Run**

---

## Step 5: Add Environment Variables to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select **cetakin-app**
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

### Required Variables

| Variable | Value (example) | Notes |
|----------|-----------------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | From Step 2 |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Step 2 |
| `VITE_SITE_URL` | `https://cetakin-app.netlify.app` | Your Netlify URL |

### Optional Variables (for Payment)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxx` | From Midtrans dashboard |
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxx` | From Midtrans dashboard |
| `MIDTRANS_ENVIRONMENT` | `sandbox` | Use `production` when live |

5. Click **Save**
6. **Trigger new deploy:** Go to **Deploys** → **Trigger deploy** → **Deploy latest**

---

## Step 6: Verify Setup

### Test Landing Page
Visit https://cetakin-app.netlify.app/

- Should show landing page without errors
- WhatsApp button should work

### Test Admin Dashboard
Visit https://cetakin-app.netlify.app/admin

- Should redirect to login (protected route)
- Login page should load

### Check Browser Console
Open DevTools (F12) → Console tab:
- Should NOT see errors about `VITE_SUPABASE_URL`
- Should NOT see `Supabase connection failed`

---

## Step 7: Create Test Admin User

Since there's no signup for admin (by design), create manually:

### SQL to create admin:

```sql
-- In Supabase Dashboard → SQL Editor
INSERT INTO profiles (auth_user_id, full_name, phone, email, role, is_active)
VALUES (
  NULL,  -- auth_user_id (set after creating auth user)
  'Admin User',
  '081234567890',
  'admin@cetakin.com',
  'admin',
  true
);
```

### Or use Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter email and password
4. Then go to **Table Editor** → **profiles**
5. Add new row with matching data

---

## Step 8: Configure Storage Buckets

The migrations should create storage buckets, but verify:

1. Go to Supabase Dashboard → **Storage**
2. Should see buckets: `order-files`, `media`
3. If not, run in SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('order-files', 'order-files', true, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('media', 'media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;
```

---

## Troubleshooting

### "Table does not exist"
→ Run migrations again (Step 4)

### "Invalid API key"
→ Check `VITE_SUPABASE_ANON_KEY` in Netlify env vars

### "Connection refused"
→ Verify `VITE_SUPABASE_URL` is correct (includes `.co`)

### Auth redirects not working
→ Check Step 3 - redirect URLs configuration

---

## Quick Reference

### Supabase Dashboard Links

- **Project Settings:** https://supabase.com/dashboard/project/_/settings
- **Authentication:** https://supabase.com/dashboard/project/_/auth/users
- **SQL Editor:** https://supabase.com/dashboard/project/_/sql
- **Storage:** https://supabase.com/dashboard/project/_/storage
- **Database:** https://supabase.com/dashboard/project/_/database

### Environment Variables Checklist

```
Netlify Environment Variables:
[ ] VITE_SUPABASE_URL = https://xxx.supabase.co
[ ] VITE_SUPABASE_ANON_KEY = eyJhbGc...
[ ] VITE_SITE_URL = https://cetakin-app.netlify.app
[ ] VITE_MIDTRANS_CLIENT_KEY = SB-Mid-client-xxx (optional)
[ ] MIDTRANS_SERVER_KEY = SB-Mid-server-xxx (optional)
[ ] MIDTRANS_ENVIRONMENT = sandbox (optional)
```

---

## Next Steps

After Supabase is configured:

1. Test user registration/login
2. Test order submission
3. Configure Midtrans (if enabling payments)
4. Add custom domain