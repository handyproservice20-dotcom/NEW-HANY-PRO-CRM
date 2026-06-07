-- ============================================================
-- HANDY PRO CRM - Supabase Database Setup
-- Run this entire file in your Supabase SQL Editor
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Customers table
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text
);

-- Estimates table
create table if not exists estimates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  customer_name text,
  title text not null,
  description text,
  amount numeric(10,2),
  status text default 'draft' check (status in ('draft', 'sent', 'approved', 'declined', 'completed')),
  estimate_date date default current_date
);

-- Enable Row Level Security (required for Supabase Auth)
alter table customers enable row level security;
alter table estimates enable row level security;

-- Allow any logged-in user to read/write customers
create policy "Auth users can select customers" on customers
  for select using (auth.role() = 'authenticated');

create policy "Auth users can insert customers" on customers
  for insert with check (auth.role() = 'authenticated');

create policy "Auth users can update customers" on customers
  for update using (auth.role() = 'authenticated');

create policy "Auth users can delete customers" on customers
  for delete using (auth.role() = 'authenticated');

-- Allow any logged-in user to read/write estimates
create policy "Auth users can select estimates" on estimates
  for select using (auth.role() = 'authenticated');

create policy "Auth users can insert estimates" on estimates
  for insert with check (auth.role() = 'authenticated');

create policy "Auth users can update estimates" on estimates
  for update using (auth.role() = 'authenticated');

create policy "Auth users can delete estimates" on estimates
  for delete using (auth.role() = 'authenticated');
