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
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Ensure owner_id exists if the table was created previously without it
alter table companies add column if not exists owner_id uuid references auth.users(id);

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
  user_id uuid references auth.users(id),
  performed_by text,
  created_at timestamptz default now()
);

-- Ensure user_id exists if the table was created previously
alter table logs add column if not exists user_id uuid references auth.users(id);

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

-- Restrictive policies for Companies
create policy "users_access_own_companies" on companies
  for select using (
    auth.uid() is not null and (
      owner_id = auth.uid() or
      exists (
        select 1 from company_members
        where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
      )
    )
  );

create policy "users_update_own_companies" on companies
  for update using (
    owner_id = auth.uid() or
    exists (
      select 1 from company_members
      where company_members.company_id = companies.id
      and company_members.user_id = auth.uid()
      and role in ('owner', 'editor')
    )
  );

create policy "users_delete_own_companies" on companies
  for delete using (owner_id = auth.uid());

-- Restrictive policies for Certificates (Inherit from Company access)
create policy "users_access_company_certificates" on certificates
  for all using (
    auth.uid() is not null and
    exists (
      select 1 from companies
      where companies.id = certificates.company_id and (
        companies.owner_id = auth.uid() or
        exists (
          select 1 from company_members
          where company_members.company_id = companies.id
          and company_members.user_id = auth.uid()
          and (
            role in ('owner', 'editor') or 
            (current_query() ilike '%select%' and role = 'viewer')
          )
        )
      )
    )
  );

-- Restrictive policies for Logs
create policy "users_view_company_logs" on logs
  for select using (
    auth.uid() is not null and (
      user_id = auth.uid() or
      exists (
        select 1 from companies
        where companies.id = logs.company_id and (
          companies.owner_id = auth.uid() or
          exists (
            select 1 from company_members
            where company_members.company_id = companies.id
            and company_members.user_id = auth.uid()
            and role in ('owner', 'editor')
          )
        )
      )
    )
  );

-- Restrictive policies for Settings
create policy "users_view_settings" on settings
  for select using (auth.uid() is not null);

create policy "admins_modify_settings" on settings
  for update using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
      and is_admin = true
    )
  );

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cert-logos', 'cert-logos', false)
on conflict (id) do nothing;

-- Secure Storage Policies
create policy "users_upload_company_logos" on storage.objects
  for insert with check (
    bucket_id = 'company-logos' and
    auth.uid() is not null and
    exists (
      select 1 from companies
      where companies.id = (storage.foldername(name))[1]::uuid
      and (
        owner_id = auth.uid() or
        exists (
          select 1 from company_members
          where company_members.company_id = companies.id
          and company_members.user_id = auth.uid()
          and role in ('owner', 'editor')
        )
      )
    )
  );

create policy "authenticated_users_read_logos" on storage.objects
  for select using (auth.uid() is not null);
