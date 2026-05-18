# ComplianceTracker — Certificate & Compliance Management

A sleek, minimalist Next.js application for tracking company certifications, compliance status, and renewal timelines. Built with Supabase (database + auth + storage), TailwindCSS, and Framer Motion.

## 🎯 Features

- **Supabase Authentication** — Secure email/password login managed entirely by Supabase Auth
- **Certificate Management** — Track certificates by company with issue/expiry dates, issuing bodies, and logos
- **Compliance Dashboard** — Real-time compliance percentage, expiring certificate alerts, and activity logs
- **Company Profiles** — Manage company details with logos, certificate counts, and compliance badges
- **Activity Logging** — Append-only audit trail of all changes with timestamps
- **Undo Deletions** — 5-second undo window for accidental certificate deletions
- **Expiry Alerts** — Configurable threshold (default 30 days) for "expiring soon" warnings
- **Dark/Light Theme** — System-aware theme switching via next-themes
- **Export Logs** — Download all activity logs as CSV for audit purposes

## 🏗️ Tech Stack

- **Framework**: Next.js 15+ with App Router & TypeScript
- **Auth**: Supabase Auth (email/password, cookie-based sessions)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (company-logos, cert-logos buckets)
- **UI**: TailwindCSS + custom components + Framer Motion
- **Session Management**: `@supabase/ssr` middleware for server-side session refresh

## 📁 Project Structure

```
compliance_tracker/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── login/               # Email/password login page
│   │   ├── (protected)/         # Auth-gated routes
│   │   │   ├── dashboard/       # Compliance overview & stats
│   │   │   ├── companies/       # Company list & detail pages
│   │   │   ├── logs/            # Activity audit log
│   │   │   └── settings/        # App configuration
│   │   └── actions/             # Server Actions (db.ts, auth.ts)
│   ├── components/              # Reusable React components
│   ├── lib/                     # Supabase clients, utilities
│   ├── middleware.ts             # Route protection via Supabase session
│   └── styles/                  # Global CSS
├── supabase/
│   └── schema.sql               # Database schema
├── .env.example                 # Environment variable template
├── SETUP.md                     # Full setup guide
└── DEPLOYMENT.md                # Production deployment checklist
```

## 🚀 Quick Start

**See [SETUP.md](./SETUP.md) for the full step-by-step guide.**

```bash
# 1. Clone & install
cd frontend
npm install

# 2. Configure environment
cp ../.env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Verify Next.js installation and app structure (app/)

# 4. Run schema in Supabase SQL Editor
#    (paste contents of supabase/schema.sql)

# 5. Create a user in Supabase Dashboard → Authentication → Users

# 6. Start the dev server
npm run dev
```

Visit `http://localhost:3000` and sign in with your Supabase user credentials.

## 📋 Pages & Routes

| Route | Purpose |
|-------|---------|
| `/login` | Email/password sign-in (Supabase Auth) |
| `/dashboard` | Compliance overview, stats, recent logs |
| `/companies` | Grid of all companies |
| `/companies/[id]` | Company detail with certificates |
| `/logs` | Full activity audit log with filters |
| `/settings` | App name, expiry threshold, theme, export |

## 🔐 Authentication

Authentication is handled entirely by **Supabase Auth**:

- **Email/password** login via `supabase.auth.signInWithPassword()`
- **Cookie-based sessions** managed by `@supabase/ssr` — sessions persist across tabs and page refreshes
- **Middleware enforcement** — every request is checked server-side before rendering
- **Sign-out** button in the sidebar clears the session and redirects to `/login`
- **User management** done in Supabase Dashboard → Authentication → Users

## 🗄️ Database Schema

See `supabase/schema.sql` for the full schema. Key tables:

| Table | Purpose |
|-------|---------|
| `companies` | Organization records with optional logo |
| `certificates` | Certs linked to companies with auto-computed status |
| `logs` | Append-only activity trail |
| `settings` | App config (`app_name`, `expiry_threshold`) |

## 🔧 Environment Variables

```env
# frontend/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only (used in Server Actions for privileged DB access). Never expose it to the browser.

## 📊 Activity Logging

Every mutation is logged to the `logs` table with:
- **Timestamp** — When the action occurred
- **Action** — What happened (e.g., "Certificate Added")
- **Entity** — Which certificate/company (e.g., "ACME - ISO 27001")

Logs are **append-only** — no delete or modify capability.

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production checklist.

Supported platforms (any Node.js host):
- **Vercel** (recommended — zero-config Next.js)
- Netlify, Railway, AWS Amplify, Google Cloud Run, DigitalOcean

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| **"Invalid login credentials"** | Check Supabase Auth → Users; verify email/password |
| **Redirect loop on login** | Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly |
| **Can't see data** | Verify `.env.local` credentials and that schema.sql was run |
| **Logo uploads fail** | Check Supabase storage buckets exist (`company-logos`, `cert-logos`) |
| **Session drops unexpectedly** | Supabase default session is 1 hour; configurable in Auth settings |

See [SETUP.md](./SETUP.md) for more.

---

**Version**: 2.0.0
**Auth**: Supabase Auth (email/password)
**Status**: Production Ready
**Built**: May 2026
