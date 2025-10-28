-- Script para verificar e corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1) Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'patients', 'anamneses', 'evolutions', 'reports', 'therapeutic_plans', 'devolutivas');

-- 2) Verificar políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'anamneses', 'evolutions', 'reports', 'therapeutic_plans', 'devolutivas');

-- 3) Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'anamneses', 'evolutions', 'reports', 'therapeutic_plans', 'devolutivas');

-- 4) Se as políticas não existirem, recriar todas elas:

-- Profiles - políticas mais permissivas para teste
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;

CREATE POLICY "read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Patients - políticas mais permissivas para teste
DROP POLICY IF EXISTS "patients_select_own" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_own" ON public.patients;
DROP POLICY IF EXISTS "patients_update_own" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_own" ON public.patients;

CREATE POLICY "patients_select_own"
ON public.patients FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "patients_insert_own"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "patients_update_own"
ON public.patients FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "patients_delete_own"
ON public.patients FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 5) Verificar usuário atual e sessão
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 6) Testar inserção de perfil (substitua o UUID pelo seu user_id)
-- INSERT INTO public.profiles (id, first_name, last_name) 
-- VALUES (auth.uid(), 'Teste', 'Usuario') 
-- ON CONFLICT (id) DO UPDATE SET 
--   first_name = EXCLUDED.first_name,
--   last_name = EXCLUDED.last_name;
