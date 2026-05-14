create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz default now()
);

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
  performed_by text,
  created_at timestamptz default now()
);

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

create policy "public full access companies" on companies for all using (true) with check (true);
create policy "public full access certificates" on certificates for all using (true) with check (true);
create policy "public full access logs" on logs for all using (true) with check (true);
create policy "public full access settings" on settings for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cert-logos', 'cert-logos', true)
on conflict (id) do nothing;

create policy "public access company logos" on storage.objects
for all
using (bucket_id = 'company-logos')
with check (bucket_id = 'company-logos');

create policy "public access cert logos" on storage.objects
for all
using (bucket_id = 'cert-logos')
with check (bucket_id = 'cert-logos');
