# ComplianceTracker - Premium Certificate & Compliance Management

A sleek, minimalist Next.js application for tracking company certifications, compliance status, and renewal timelines. Built with Supabase, TailwindCSS, and Framer Motion.

## 🎯 Features

- **Certificate Management** — Track certificates by company with issue/expiry dates, issuing bodies, and logos
- **Compliance Dashboard** — Real-time compliance percentage, expiring certificates alert, and activity logs
- **Company Profiles** — Manage company details with logos, certificate counts, and compliance badges
- **Activity Logging** — Append-only audit trail of all changes (add, delete, undo) with user attribution
- **Undo Deletions** — 5-second undo window for accidental certificate deletions
- **Expiry Alerts** — Configurable threshold (default 30 days) for "expiring soon" alerts
- **Dark/Light Theme** — System-aware theme switching with next-themes
- **Export Logs** — Download all activity logs as CSV for audit purposes
- **Access Hash Auth** — Simple 4-hash authentication for small team access control

## 🏗️ Tech Stack

**Frontend-Only (No Backend Required)**
- Next.js 15+ with App Router & TypeScript
- Supabase (PostgreSQL database + file storage)
- TailwindCSS + shadcn/ui components
- Framer Motion for smooth animations
- next-themes for dark/light mode

## 📁 Project Structure

```
tracker/
├── frontend/                # Next.js application
│   ├── app/
│   │   ├── login/          # Access hash login
│   │   ├── (protected)/    # Protected routes with sidebar
│   │   │   ├── dashboard/  # Compliance overview
│   │   │   ├── companies/  # Company list & details
│   │   │   ├── logs/       # Activity audit log
│   │   │   └── settings/   # App configuration
│   ├── components/         # Reusable React components
│   ├── lib/               # Utilities & data fetching
│   └── styles/            # Global styles
├── supabase/              # Database schema
├── .env.example           # Environment variables template
└── SETUP.md              # Complete setup guide
```

## 🚀 Quick Start

**See [SETUP.md](./SETUP.md) for detailed setup instructions.**

### Easiest Way: Use Start Script

After setting up your `.env.local` (see SETUP.md), just run:

```bash
# Linux/Mac
./start

# Windows
start.bat
```

That's it! The script handles everything and starts the dev server at `http://localhost:3000`

### 1 Minute Manual Setup (TL;DR)

```bash
# 1. Create Supabase project and get credentials
# 2. Run schema from supabase/schema.sql in Supabase SQL editor
# 3. Generate 4 hashes
openssl rand -base64 8 | tr -dc 'A-Za-z0-9' | head -c 10  # Run 4 times

# 4. Update frontend/lib/auth-config.ts with your hashes
# 5. Set .env.local in frontend/
cd frontend
echo "NEXT_PUBLIC_SUPABASE_URL=<your-url>" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>" >> .env.local

# 6. Run dev server
npm install
npm run dev
```

Visit `http://localhost:3000` and log in with one of your access hashes.

## 📋 Pages & Routes

| Route | Purpose |
|-------|---------|
| `/login` | Access hash authentication |
| `/dashboard` | Compliance overview, stats, recent logs |
| `/companies` | Grid of all companies |
| `/companies/[id]` | Company detail with certificates |
| `/logs` | Full activity audit log with filters |
| `/settings` | App name, threshold, theme, export logs |

## 🔐 Authentication

- **No password auth** — Uses 4 hardcoded 10-character access hashes
- **SessionStorage only** — Per-tab session, lost on browser close
- **Case-sensitive** — Hashes must match exactly
- **Simple & Safe** — Suitable for small teams (not for public apps)

## 📊 Activity Logging

Every change (add, update, delete, undo, upload) is logged with:
- **Timestamp** — When the action occurred
- **Action** — What happened (e.g., "Certificate Added")
- **Entity** — Which certificate/company (e.g., "ACME - ISO 27001")
- **Performed By** — Masked user hash (last 4 chars, e.g., "••••Rt")

Logs are **append-only** — no delete/modify capability.

## 🎨 Design

- **Inspiration**: Apple.com premium design language
- **Style**: Minimalist, glassmorphic, enterprise-grade
- **Font**: Roboto family via TailwindCSS
- **Animations**: Smooth Framer Motion transitions
- **Responsiveness**: Mobile-first, fully responsive

## 🗄️ Database Schema

See `supabase/schema.sql` for the complete schema. Key tables:

- `companies` — Organization data with logos
- `certificates` — Certs linked to companies with auto-computed status
- `logs` — Append-only activity trail
- `settings` — App configuration (app_name, expiry_threshold)

## 🔧 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-120-char-anon-key
```

These are public (prefixed `NEXT_PUBLIC_`) because the app is frontend-only.

## 📦 Deployment

Frontend-only app, can deploy to:
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **AWS Amplify**
- **Any Node.js host**

Just set the environment variables and deploy.

## 🆘 Troubleshooting

**"Invalid access hash"** → Check `frontend/lib/auth-config.ts`, verify hash is in the array  
**Can't see data** → Verify `.env.local` has correct Supabase credentials  
**Logo uploads fail** → Check Supabase storage buckets exist (company-logos, cert-logos)  
**Undo not working** → Undo only works within 5 seconds of deletion  

See [SETUP.md](./SETUP.md) for more troubleshooting.

## 📝 License

Proprietary — All rights reserved

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Built**: May 2026
