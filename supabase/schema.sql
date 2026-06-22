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
alter table user_profiles enable row level security;

-- RLS Policies: Allow public SELECT (read-only guest access), but protect writes
-- User Profiles: public can read, only authenticated users can write their own
drop policy if exists "allow_public_read" on user_profiles;
drop policy if exists "allow_self_write" on user_profiles;
drop policy if exists "allow_self_update" on user_profiles;
create policy "allow_public_read" on user_profiles
  for select using (true);
create policy "allow_self_write" on user_profiles
  for insert with check (auth.uid() = id);
create policy "allow_self_update" on user_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Companies: public can read, only authenticated users can write
drop policy if exists "allow_public_read" on companies;
drop policy if exists "allow_authenticated_write" on companies;
drop policy if exists "allow_owner_update" on companies;
drop policy if exists "allow_owner_delete" on companies;
create policy "allow_public_read" on companies
  for select using (true);
create policy "allow_authenticated_write" on companies
  for insert with check (auth.uid() = owner_id);
create policy "allow_owner_update" on companies
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "allow_owner_delete" on companies
  for delete using (
    auth.uid() = owner_id
    or exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
      and user_profiles.is_admin = true
    )
  );

-- Certificates: public can read, only authenticated users can write
drop policy if exists "allow_public_read" on certificates;
drop policy if exists "allow_authenticated_write" on certificates;
drop policy if exists "allow_owner_update" on certificates;
drop policy if exists "allow_owner_delete" on certificates;
create policy "allow_public_read" on certificates
  for select using (true);
create policy "allow_authenticated_write" on certificates
  for insert with check (
    exists (
      select 1 from companies
      where companies.id = certificates.company_id
      and (companies.owner_id = auth.uid() or exists (
        select 1 from company_members
        where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
      ))
    )
  );
create policy "allow_owner_update" on certificates
  for update using (
    exists (
      select 1 from companies
      where companies.id = certificates.company_id
      and (companies.owner_id = auth.uid() or exists (
        select 1 from company_members
        where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
      ))
    )
  ) with check (
    exists (
      select 1 from companies
      where companies.id = certificates.company_id
      and (companies.owner_id = auth.uid() or exists (
        select 1 from company_members
        where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
      ))
    )
  );
create policy "allow_owner_delete" on certificates
  for delete using (
    exists (
      select 1 from companies
      where companies.id = certificates.company_id
      and (companies.owner_id = auth.uid() or exists (
        select 1 from company_members
        where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
      ))
    )
  );

-- Logs: public can read (audit trail visibility), only authenticated inserts
drop policy if exists "allow_public_read" on logs;
drop policy if exists "allow_authenticated_write" on logs;
create policy "allow_public_read" on logs
  for select using (true);
create policy "allow_authenticated_write" on logs
  for insert with check (auth.uid() is not null);

-- Settings: public can read, no one can write via client (settings managed server-side)
drop policy if exists "allow_public_read" on settings;
create policy "allow_public_read" on settings
  for select using (true);

-- Storage Buckets: Set to private by default
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', false), ('cert-logos', 'cert-logos', false)
on conflict (id) do nothing;

-- Storage Policies: Block all access from the anonymous key.
-- Access to storage is managed by signed URLs generated server-side.
drop policy if exists "block_anon_storage" on storage.objects;
create policy "block_anon_storage" on storage.objects
  for all
  using (false)
  with check (false);
