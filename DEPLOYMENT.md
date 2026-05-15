# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables

Set these in your hosting platform's dashboard (never commit to git):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Project URL from Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon/public key from Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — **server-only, never expose** |

### 2. Supabase Configuration

- [ ] **Run schema**: Paste `supabase/schema.sql` into Supabase SQL Editor and execute
- [ ] **Create users**: Supabase → Authentication → Users → Add user (email + password)
- [ ] **Allowed origins**: Supabase → Project Settings → API → Allowed Origins → add your production domain (e.g., `https://tracker.yourdomain.com`)
- [ ] **Storage buckets**: Confirm `company-logos` and `cert-logos` buckets exist with correct policies
- [ ] **Email auth enabled**: Supabase → Authentication → Providers → Email → must be enabled

### 3. Security

- [ ] **Service role key**: Confirm it is set as a *secret* environment variable (not `NEXT_PUBLIC_`)
- [ ] **RLS policies**: Verify Row Level Security is active on all tables in Supabase → Database → Tables
- [ ] **HTTPS only**: Ensure your hosting platform enforces HTTPS (Vercel/Netlify do this by default)
- [ ] **Auth email confirm**: Consider enabling email confirmation in Supabase → Auth → Settings for production

---

## Deploy to Vercel (Recommended)

```bash
# 1. Push your code to a GitHub / GitLab / Bitbucket repo

# 2. Go to vercel.com → New Project → Import your repo

# 3. Set Root Directory to: frontend

# 4. Add Environment Variables in the Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL      → your project URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY → your anon key
#    SUPABASE_SERVICE_ROLE_KEY     → your service role key

# 5. Deploy — Next.js is auto-detected, no extra config needed
```

> If the project root already contains `frontend/`, set **Root Directory = `frontend`** in Vercel project settings so it finds `package.json`.

---

## Deploy to Netlify

```bash
# 1. Push to GitHub

# 2. Netlify → New Site → Import from Git

# 3. Build settings:
#    Base directory:   frontend
#    Build command:    npm run build
#    Publish directory: frontend/.next

# 4. Set environment variables in Netlify → Site Settings → Environment Variables

# 5. Add netlify.toml to frontend/ if needed:
```

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Deploy to Railway / Render / DigitalOcean

```bash
# 1. Connect GitHub repo
# 2. Set root directory to: frontend
# 3. Set start command: npm run start
# 4. Set build command: npm run build
# 5. Add the 3 environment variables
# 6. Deploy
```

---

## Post-Deployment

- [ ] **Smoke test login**: Visit `/login` → sign in with a Supabase user → should reach `/dashboard`
- [ ] **Test sign out**: Click Sign Out in sidebar → should redirect to `/login`
- [ ] **Test data**: Add a company and certificate; verify they appear after page refresh
- [ ] **Test logo upload**: Upload a company or certificate logo; verify it renders
- [ ] **Test protected routes**: Visit `/dashboard` while logged out → should redirect to `/login`
- [ ] **Check session persistence**: Refresh the page while logged in → should stay logged in

---

## Performance

- [ ] **Compression**: Vercel/Netlify serve Brotli/Gzip automatically — no action needed
- [ ] **Image optimization**: Next.js `<Image>` is used throughout — already optimized
- [ ] **CDN**: Supabase Storage assets are served via CDN by default

---

## Maintenance

- [ ] **Backups**: Enable daily backups in Supabase → Project Settings → Backups
- [ ] **Monitor auth**: Review Supabase → Authentication → Logs for failed login attempts
- [ ] **Dependency updates**: Run `npm audit` and `npm outdated` periodically in `frontend/`
- [ ] **Session lifetime**: Default Supabase JWT expires in 1 hour with auto-refresh; configure in Supabase → Auth → Settings → JWT Expiry if needed