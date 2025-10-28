-- Script completo para configurar o banco de dados MultiTea
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1) Extensões úteis
create extension if not exists "uuid-ossp";

-- 2) PERFIS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  specialty text,
  crp text,
  phone text,
  address text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Função para criar perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, null, null)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3) PACIENTES
create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birthdate date,
  created_at timestamp with time zone default now()
);
alter table public.patients enable row level security;

drop policy if exists "patients_select_own" on public.patients;
create policy "patients_select_own"
on public.patients for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "patients_insert_own" on public.patients;
create policy "patients_insert_own"
on public.patients for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "patients_update_own" on public.patients;
create policy "patients_update_own"
on public.patients for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "patients_delete_own" on public.patients;
create policy "patients_delete_own"
on public.patients for delete
to authenticated
using (user_id = auth.uid());

-- 4) ANAMNESES
create table if not exists public.anamneses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  specialty text not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.anamneses enable row level security;

create index if not exists idx_anamneses_user_created on public.anamneses (user_id, created_at desc);

drop policy if exists "anamneses_select_own" on public.anamneses;
create policy "anamneses_select_own"
on public.anamneses for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "anamneses_insert_own" on public.anamneses;
create policy "anamneses_insert_own"
on public.anamneses for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "anamneses_update_own" on public.anamneses;
create policy "anamneses_update_own"
on public.anamneses for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "anamneses_delete_own" on public.anamneses;
create policy "anamneses_delete_own"
on public.anamneses for delete
to authenticated
using (user_id = auth.uid());

-- 5) EVOLUTIONS
create table if not exists public.evolutions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.evolutions enable row level security;

create index if not exists idx_evolutions_user_created on public.evolutions (user_id, created_at desc);

drop policy if exists "evolutions_select_own" on public.evolutions;
create policy "evolutions_select_own"
on public.evolutions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "evolutions_insert_own" on public.evolutions;
create policy "evolutions_insert_own"
on public.evolutions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "evolutions_update_own" on public.evolutions;
create policy "evolutions_update_own"
on public.evolutions for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "evolutions_delete_own" on public.evolutions;
create policy "evolutions_delete_own"
on public.evolutions for delete
to authenticated
using (user_id = auth.uid());

-- 6) REPORTS
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.reports enable row level security;

create index if not exists idx_reports_user_created on public.reports (user_id, created_at desc);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own"
on public.reports for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own"
on public.reports for delete
to authenticated
using (user_id = auth.uid());

-- 7) THERAPEUTIC PLANS
create table if not exists public.therapeutic_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.therapeutic_plans enable row level security;

create index if not exists idx_therapeutic_plans_user_created on public.therapeutic_plans (user_id, created_at desc);

drop policy if exists "plans_select_own" on public.therapeutic_plans;
create policy "plans_select_own"
on public.therapeutic_plans for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "plans_insert_own" on public.therapeutic_plans;
create policy "plans_insert_own"
on public.therapeutic_plans for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "plans_update_own" on public.therapeutic_plans;
create policy "plans_update_own"
on public.therapeutic_plans for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "plans_delete_own" on public.therapeutic_plans;
create policy "plans_delete_own"
on public.therapeutic_plans for delete
to authenticated
using (user_id = auth.uid());

-- 8) DEVOLUTIVAS
create table if not exists public.devolutivas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.devolutivas enable row level security;

create index if not exists idx_devolutivas_user_created on public.devolutivas (user_id, created_at desc);

drop policy if exists "devolutivas_select_own" on public.devolutivas;
create policy "devolutivas_select_own"
on public.devolutivas for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "devolutivas_insert_own" on public.devolutivas;
create policy "devolutivas_insert_own"
on public.devolutivas for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "devolutivas_update_own" on public.devolutivas;
create policy "devolutivas_update_own"
on public.devolutivas for update
to authenticated
using (user_id = auth.uid());

drop policy if exists "devolutivas_delete_own" on public.devolutivas;
create policy "devolutivas_delete_own"
on public.devolutivas for delete
to authenticated
using (user_id = auth.uid());
