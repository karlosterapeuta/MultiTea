-- SOLUÇÃO COMPLETA PARA PROBLEMAS DE SALVAMENTO
-- Execute este script completo no SQL Editor do Supabase Dashboard

-- 1) DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapeutic_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devolutivas DISABLE ROW LEVEL SECURITY;

-- 2) CRIAR POLÍTICAS MAIS PERMISSIVAS
-- Profiles - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
CREATE POLICY "profiles_all"
ON public.profiles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Patients - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "patients_all" ON public.patients;
CREATE POLICY "patients_all"
ON public.patients FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anamneses - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "anamneses_all" ON public.anamneses;
CREATE POLICY "anamneses_all"
ON public.anamneses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Evolutions - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "evolutions_all" ON public.evolutions;
CREATE POLICY "evolutions_all"
ON public.evolutions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reports - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "reports_all" ON public.reports;
CREATE POLICY "reports_all"
ON public.reports FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Therapeutic Plans - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "therapeutic_plans_all" ON public.therapeutic_plans;
CREATE POLICY "therapeutic_plans_all"
ON public.therapeutic_plans FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Devolutivas - permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "devolutivas_all" ON public.devolutivas;
CREATE POLICY "devolutivas_all"
ON public.devolutivas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3) REABILITAR RLS COM POLÍTICAS PERMISSIVAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapeutic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devolutivas ENABLE ROW LEVEL SECURITY;

-- 4) VERIFICAR SE FUNCIONOU
SELECT 'RLS Status:' as info, schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'anamneses', 'evolutions', 'reports', 'therapeutic_plans', 'devolutivas');

-- 5) VERIFICAR POLÍTICAS ATIVAS
SELECT 'Active Policies:' as info, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'anamneses', 'evolutions', 'reports', 'therapeutic_plans', 'devolutivas');

-- 6) TESTE DE INSERÇÃO (opcional - descomente para testar)
-- INSERT INTO public.profiles (id, first_name, last_name) 
-- VALUES (auth.uid(), 'Teste', 'Usuario') 
-- ON CONFLICT (id) DO UPDATE SET 
--   first_name = EXCLUDED.first_name,
--   last_name = EXCLUDED.last_name;
