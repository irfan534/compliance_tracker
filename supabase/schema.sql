create extension if not exists pgcrypto;

-- Create users table for profile and admin management
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Ensure owner_id exists if the table was created previously without it
alter table companies add column if not exists owner_id uuid references auth.users(id) on delete set null;

-- Create company_members table for multi-user access control
create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'editor', 'viewer')) default 'viewer',
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

-- Create a view or trigger to ensure profiles are synced (omitted for brevity, handled by Auth hooks)

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  issuing_body text,
  issue_date date,
  expiry_date date,
  status text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text,
  company_id uuid,
  cert_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  performed_by text,
  created_at timestamptz default now()
);

-- Ensure user_id exists if the table was created previously
alter table logs add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists settings (
  key text primary key,
  value text
);

insert into settings (key, value)
values ('app_name', 'ComplianceTracker'), ('expiry_threshold', '30')
on conflict (key) do nothing;

alter table companies enable row level security;
alter table certificates enable row level security;
alter table logs enable row level security;
alter table settings enable row level security;

-- RLS Policies: Block all access from the anonymous key.
-- All legitimate database access is expected to come from server actions
-- using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
create policy "block_anon" on companies
  for all using (false) with check (false);

create policy "block_anon" on certificates
  for all using (false) with check (false);

create policy "block_anon" on logs
  for all using (false) with check (false);

create policy "block_anon" on settings
  for all using (false) with check (false);

-- Storage Buckets: Set to private by default
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', false), ('cert-logos', 'cert-logos', false)
on conflict (id) do nothing;

-- Storage Policies: Block all access from the anonymous key.
-- Access to storage is managed by signed URLs generated server-side.
create policy "block_anon_storage" on storage.objects
  for all
  using (false)
  with check (false);
