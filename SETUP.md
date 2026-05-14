# ComplianceTracker Setup & Deployment Guide

## Overview
This is a premium compliance tracking application built with Next.js 15, TypeScript, Supabase, and Framer Motion. It features a minimalist, Apple-inspired UI with glassmorphic design patterns.

## Tech Stack
- **Frontend**: Next.js 15+ with App Router, TypeScript
- **UI Framework**: shadcn/ui + TailwindCSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage (company-logos, cert-logos)
- **Authentication**: Simple sessionStorage-based with 4 hardcoded access hashes

## Quick Start

### Option A: Use Start Script (Easiest)

After setting up `.env.local` (see steps below), just run:

```bash
# On Linux/Mac from root directory
./start

# Or from frontend directory
cd frontend
./start

# On Windows from root directory
start.bat
```

This script will:
- ✅ Check if `.env.local` exists
- ✅ Install dependencies if needed
- ✅ Start the dev server
- ✅ Open on http://localhost:3000

### Option B: Manual Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Wait for the project to initialize
- Copy your **Project URL** and **Anon Key** (found in Settings → API)

### Option B: Manual Setup

### Step 1: Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Wait for the project to initialize
- Copy your **Project URL** and **Anon Key** (found in Settings → API)

### Step 2: Set Up Database Schema
- In Supabase, go to **SQL Editor**
- Create a new query and copy-paste the entire contents of `supabase/schema.sql`
- Run the query to set up all tables, buckets, and policies

### Step 3: Generate Access Hashes
Open a terminal and run the following command **4 times** to generate 4 unique 10-character alphanumeric hashes:
```bash
openssl rand -base64 8 | tr -dc 'A-Za-z0-9' | head -c 10
```

Example output (your hashes will be different):
```
eTOnTckbPg
1uT05y00kH
hxDr36ssUW
TkDxsyozdh
```

### Step 4: Update Access Hashes
Edit `frontend/lib/auth-config.ts` and replace the placeholder hashes with your 4 generated hashes:
```typescript
export const ACCESS_HASHES = [
  'YOUR_HASH_1',
  'YOUR_HASH_2',
  'YOUR_HASH_3',
  'YOUR_HASH_4',
] as const;
```

### Step 5: Configure Environment Variables
Create `frontend/.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Install Dependencies & Run
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and connect your GitHub repo
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Deploy to Other Platforms
The app is a pure Next.js frontend with no backend dependencies, so it can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run
- Digital Ocean App Platform

## Features

### 1. Login (/)
- Single input field: "Enter Access Hash"
- Case-sensitive 10-character alphanumeric check against 4 hardcoded hashes
- SessionStorage-based authentication (per-tab session, no persistence)
- Shows error message "Invalid access hash" on wrong entry

### 2. Dashboard (/dashboard)
- **Stats Row**: Total Certs, Active, Expiring Soon (clickable), Expired
- **Expiring Soon Modal**: Lists certs expiring within threshold, links to company pages
- **Overall Compliance**: Single percentage bar showing (active / total) × 100
- **Recent Logs**: Last 5 activity entries inline

### 3. Companies (/companies)
- **Grid View**: All companies with logo, name, cert count, compliance status badge
- **Company Detail** (/companies/[id]):
  - Header: Logo (with upload button), editable name, upload button
  - Compliance summary with percentage bar
  - Certificate table with add/delete functionality
  - Undo toast for deletions (5-second window)

### 4. Certificate Management
- **Add Certificate Modal**: Name, Issuing Body, Issue Date, Expiry Date, Logo upload
- **Delete**: Removes from UI/DB immediately, shows undo toast for 5 seconds
- **Logo Upload**: Stores in Supabase storage (`company-logos`, `cert-logos`)
- **Status Auto-Calculated**: Active/Expiring/Expired based on expiry_date vs threshold

### 5. Logs (/logs)
- Full-page append-only activity log
- Columns: Timestamp, Action, Entity, Performed By (masked last 4 chars)
- Filters: By Action type, By Company, Date range picker
- Pagination: 20 per page, newest first
- Read-only (no delete/clear option)

### 6. Settings (/settings)
- **App Name**: Editable, stored in settings table
- **Expiry Threshold**: Number input (days), default 30
- **Theme**: Dark/Light toggle via next-themes
- **Export Logs**: Download all logs as CSV
- All changes logged to activity log

## Database Schema

### `companies`
- `id` (UUID, PK)
- `name` (text)
- `logo_url` (text, nullable)
- `created_at` (timestamptz)

### `certificates`
- `id` (UUID, PK)
- `company_id` (UUID, FK)
- `name` (text)
- `issuing_body` (text, nullable)
- `issue_date` (date, nullable)
- `expiry_date` (date, nullable)
- `status` (text, generated: 'active' | 'expiring' | 'expired')
- `logo_url` (text, nullable)
- `created_at` (timestamptz)

### `logs`
- `id` (UUID, PK)
- `action` (text)
- `entity` (text, nullable)
- `company_id` (UUID, nullable)
- `cert_id` (UUID, nullable)
- `performed_by` (text, nullable) — stores last 4 chars of access hash
- `created_at` (timestamptz)

### `settings`
- `key` (text, PK)
- `value` (text)
- Preloaded: `app_name`, `expiry_threshold`

## Authentication Flow

1. User visits `/login`
2. Enters 10-character access hash
3. If valid (matches one of 4 hashes):
   - Set `sessionStorage.auth_token = <hash>`
   - Redirect to `/dashboard`
4. All protected routes check `sessionStorage` on mount
5. If missing → redirect to `/login`
6. Session is **per-tab only** (no cross-tab sync, no persistence across browser restarts)

## Logging

Every mutation (add, update, delete, upload) is logged:
- `performedBy` stores the masked hash (last 4 characters) — e.g., `••••Rt`
- Actions include: "Certificate Added", "Certificate Deleted", "Certificate Deletion Undone", "Company Logo Updated", "Company Name Updated", "Setting Changed"

## Undo Functionality

- When a certificate is deleted, it's removed from UI immediately
- A 5-second undo toast appears at the bottom
- If user clicks "Undo", the certificate is re-inserted with original ID/timestamps
- Action logged as "Certificate Deletion Undone"
- Uses `setTimeout` with ref to handle cleanup

## Styling

- **Font**: Roboto family (via TailwindCSS)
- **Design**: Apple.com-inspired minimalist with glassmorphism
- **Colors**: Dark sidebar, light/transparent cards with frosted glass effects
- **Animations**: Framer Motion for all transitions (0.25-0.45 second durations)
- **Responsive**: Mobile-first, optimized for desktop

## Environment Variables

```
# Required
NEXT_PUBLIC_SUPABASE_URL=          # e.g., https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # 120+ character key from Supabase
```

These are public (prefixed with `NEXT_PUBLIC_`) because the app is frontend-only and connects directly to Supabase.

## Project Structure

```
frontend/
├── app/
│   ├── login/page.tsx              # Login page with access hash
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected layout with sidebar + auth check
│   │   ├── dashboard/page.tsx      # Stats, compliance, recent logs
│   │   ├── companies/
│   │   │   ├── page.tsx            # Companies grid
│   │   │   └── [id]/page.tsx       # Company detail with certs
│   │   ├── logs/page.tsx           # Activity logs with filters
│   │   └── settings/page.tsx       # App settings
│   └── layout.tsx                  # Root layout with providers
├── components/
│   ├── Sidebar.tsx                 # Navigation sidebar
│   ├── AuthGate.tsx                # Auth check wrapper
│   ├── AddCertModal.tsx            # Modal to add certificates
│   ├── CertTable.tsx               # Certificate list table
│   ├── ComplianceBar.tsx           # Compliance percentage bar
│   ├── ExpiringPanel.tsx           # Expiring certs modal/panel
│   ├── UndoToast.tsx               # Deletion undo toast
│   ├── providers/
│   │   ├── app-settings-provider.tsx
│   │   └── theme-provider.tsx
│   └── ui/
│       ├── badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, select.tsx
├── lib/
│   ├── auth.ts                     # Auth helper functions
│   ├── auth-config.ts              # 4 hardcoded access hashes
│   ├── supabase.ts                 # Supabase client init
│   ├── data.ts                     # Data fetching functions
│   └── utils.ts                    # Helper utilities
├── types/
│   └── index.ts                    # TypeScript interfaces
└── styles/
    └── globals.css                 # Tailwind + custom styles
```

## Troubleshooting

### "Invalid access hash" error
- Verify you're using one of the 4 hashes from `lib/auth-config.ts`
- Check that hash is exactly 10 characters
- Hashes are case-sensitive

### Can't see Supabase data
- Confirm `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check RLS policies in Supabase are enabled (should be public access)
- Verify schema.sql was run successfully

### Logo uploads failing
- Ensure Supabase storage buckets exist: `company-logos`, `cert-logos`
- Check bucket policies are set to public
- Verify file size is under Supabase limits (~100 MB)

### Undo not working
- Undo only works within 5 seconds of deletion
- After 5 seconds, deletion is permanent
- Ensure certificate ID hasn't been reused

## Support & Customization

To customize:
1. **Hashes**: Edit `frontend/lib/auth-config.ts`
2. **Theme Colors**: Edit `frontend/tailwind.config.js` and `frontend/styles/globals.css`
3. **App Name Default**: Edit `frontend/components/providers/app-settings-provider.tsx`
4. **Expiry Threshold Default**: Edit Supabase `settings` table directly
5. **Sidebar Navigation**: Edit `frontend/components/Sidebar.tsx`

## Notes

- The app is **frontend-only** — no backend server, no NestJS, no Prisma
- Authentication is **not secure** for production — it's a simple access hash check suitable for small teams
- All data is **public** within Supabase (RLS policies allow all)
- **Logs are append-only** — no delete/clear functionality
- **Theme persists** via next-themes localStorage
- **Session is ephemeral** — closing the tab logs you out
