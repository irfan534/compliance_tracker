# ComplianceTracker — Setup Guide

## Overview

ComplianceTracker is a Next.js 15 application with App Router, TypeScript, Supabase (Auth + PostgreSQL + Storage), TailwindCSS, and Framer Motion. Authentication uses **Supabase Auth** (email/password) with cookie-based sessions enforced by Next.js middleware.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| A Supabase account | [supabase.com](https://supabase.com) |

### Project Verification

Before proceeding with the setup steps, verify your environment and project structure:

1. **Check Next.js Installed**
   Run: `cat frontend/package.json` (or `type` on Windows)
   Look for:
   ```json
   "dependencies": {
     "next": "^15.x.x",
     "react": "...",
     "react-dom": "..."
   }
   ```
   If `next` is missing, install it: `npm install next react react-dom`

2. **Verify App Structure**
   Ensure you have the `app/` directory inside `frontend/` (this project uses the App Router).
   
   If neither `app/` nor `pages/` exists, the project is not yet recognized as a Next.js application.

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, database password, and region
3. Wait ~2 minutes for the project to initialize
4. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g., `https://abcxyz.supabase.co`)
   - **Anon / public key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...` — keep this secret)

---

## Step 2 — Run the Database Schema

1. In Supabase, go to **SQL Editor → New Query**
2. Copy the full contents of `supabase/schema.sql`
3. Paste and click **Run**

This creates the `companies`, `certificates`, `logs`, and `settings` tables, plus storage bucket policies.

---

## Step 3 — Create Auth Users

1. In Supabase, go to **Authentication → Users → Add user**
2. Enter an email and a strong password
3. Repeat for any additional users

> There are no user roles in this app — any authenticated Supabase user has full access.

---

## Step 4 — Configure Environment Variables

In the `frontend/` directory, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Important**: `SUPABASE_SERVICE_ROLE_KEY` is used only in Server Actions (never sent to the browser). The `NEXT_PUBLIC_` variables are public and safe for the client.

---

## Step 5 — Install Dependencies & Start

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` — you will be redirected to `/login`. Sign in with the user credentials you created in Step 3.

### Or use the start script

```bash
# Linux/Mac (from project root)
./start

# Windows
start.bat
```

---

## Step 6 — Supabase Storage Buckets

The schema.sql should create these automatically. Verify in **Supabase → Storage**:

| Bucket | Purpose |
|--------|---------|
| `company-logos` | Company logo images |
| `cert-logos` | Certificate logo images |

If they don't exist, create them manually and set the bucket to **Public** or add a permissive policy for authenticated users.

> **Note**: For image uploads, only JPEG, PNG, and WebP formats are supported, with a maximum file size of 2MB.

---

## Authentication Flow

```
User visits any protected route
        ↓
middleware.ts runs (server-side)
        ↓
supabase.auth.getUser() called with request cookies
        ↓
No session? → redirect to /login
Has session? → render page
        ↓
/login: supabase.auth.signInWithPassword({ email, password })
        ↓
Success → cookie set by @supabase/ssr → redirect to /dashboard
        ↓
Sidebar "Sign Out" → supabase.auth.signOut() → redirect to /login
```

---

## Project Structure

```
frontend/
├── app/
│   ├── login/page.tsx              # Email/password login
│   ├── page.tsx                    # Root → redirects to /dashboard or /login
│   ├── layout.tsx                  # Root layout (providers)
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected layout (sidebar + AuthGate)
│   │   ├── dashboard/page.tsx      # Stats, compliance chart, recent logs
│   │   ├── companies/
│   │   │   ├── page.tsx            # Companies grid
│   │   │   └── [id]/page.tsx       # Company detail with certs
│   │   ├── logs/page.tsx           # Activity audit log
│   │   └── settings/page.tsx       # App settings
│   └── actions/
│       ├── auth.ts                 # signOut() server action
│       └── db.ts                   # All database server actions
├── components/
│   ├── AuthGate.tsx                # Client-side session guard
│   ├── Sidebar.tsx                 # Navigation with Sign Out button
│   ├── AddCertModal.tsx
│   ├── providers/
│   │   ├── app-settings-provider.tsx
│   │   └── theme-provider.tsx
│   └── ui/                         # badge, button, card, dialog, input, select
├── lib/
│   ├── supabase-browser.ts         # Browser Supabase client (@supabase/ssr)
│   ├── supabase-server.ts          # Service-role server client (for DB actions)
│   ├── supabase-server-auth.ts     # Anon server client (for auth/session checks)
│   └── utils.ts                    # Shared utilities
├── middleware.ts                   # Route protection (runs on every request)
├── types/index.ts                  # TypeScript interfaces
└── styles/globals.css              # TailwindCSS + custom styles
```

---

## Environment Variables Reference

| Variable | Required | Where Used | Notes |
|----------|----------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client + Server | Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client + Middleware | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server Actions only | Bypasses RLS — never expose to browser |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production checklist.

**Quick Vercel deploy:**

```bash
# 1. Push to GitHub
# 2. Connect repo in vercel.com
# 3. Set environment variables in Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
# 4. Deploy (Next.js detected automatically)
```

---

## Troubleshooting

### "Invalid login credentials"
- Ensure the user exists in **Supabase → Authentication → Users**
- Passwords are case-sensitive
- Check the user is not blocked/banned

### Redirect loop between `/` and `/login`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set and correct
- Restart the dev server after changing `.env.local`

### Can't see data after login
- Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
- Confirm `supabase/schema.sql` ran without errors
- Check RLS policies in Supabase allow your use case

### Logo uploads failing
- Confirm storage buckets `company-logos` and `cert-logos` exist
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (needed for signed URL generation)
- Max upload size is 2 MB; JPEG/PNG/WebP only

### Session expiring too quickly
- Supabase default JWT expiry is 1 hour (with automatic refresh)
- To increase: Supabase → Authentication → Settings → JWT expiry

---

## Customization

| What | Where |
|------|-------|
| Default app name | `components/providers/app-settings-provider.tsx` |
| Default expiry threshold | `settings` table in Supabase (key: `expiry_threshold`) |
| Theme colors | `styles/globals.css` CSS variables |
| Sidebar navigation items | `components/Sidebar.tsx` → `items` array |
| Max upload size | `app/actions/db.ts` → `MAX_UPLOAD_BYTES` |
