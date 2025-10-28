# Welcome to your Dyad app

## Preparação para Implantação na Vercel

Este projeto está configurado para ser facilmente implantado na Vercel. Siga os passos abaixo:

### 1. Configuração das Variáveis de Ambiente

Antes de implantar, configure as seguintes variáveis de ambiente na Vercel:

```
VITE_SUPABASE_URL=https://slmwnuwuouetzjvwigdj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbXdudXd1b3VldHpqdndpZ2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzY5MzMsImV4cCI6MjA3NDIxMjkzM30.eMa9NdmOoY5kBpo69NN9Rzn3FfmpvI5Gv0XevxQxsdk
```

### 2. Implantação na Vercel

1. Faça login na sua conta da Vercel
2. Clique em "New Project"
3. Importe este repositório do GitHub
4. Configure as variáveis de ambiente conforme indicado acima
5. Clique em "Deploy"

### 3. Configuração do Banco de Dados (Supabase)

Certifique-se de que as políticas de segurança do Supabase estão configuradas corretamente para permitir acesso ao frontend.

### 4. Configuração de Domínio (Opcional)

Após a implantação, você pode configurar um domínio personalizado nas configurações do projeto na Vercel.

## Desenvolvimento Local

Para rodar o projeto localmente:

1. Clone o repositório
2. Crie um arquivo `.env.local` com as variáveis de ambiente
3. Execute `npm install`
4. Execute `npm run dev`

### Variáveis de Ambiente (.env.local)

Adicione as seguintes chaves (sem aspas) na raiz do projeto em `.env.local`:

```
VITE_SUPABASE_URL=<- sua URL do projeto Supabase ->
VITE_SUPABASE_ANON_KEY=<- sua chave ANON ->
VITE_SUPABASE_REDIRECT_URL=<- ex.: http://localhost:8080 ->
```

Na Vercel, adicione as mesmas chaves nas Environment Variables do projeto.

### Configuração do Supabase

1) Autenticação
- Providers: habilite o provedor GitHub no Supabase Auth, configure `SITE_URL` (por exemplo, `http://localhost:8080` para local) e a URL de redirecionamento no GitHub OAuth App.
- No GitHub (Settings → Developer settings → OAuth Apps):
  - Homepage URL: use sua URL (local ou de produção)
  - Authorization callback URL: use a mesma URL (Supabase gerencia o hash de retorno)

2) Tabela `profiles`
- Colunas mínimas: `id uuid primary key` (mapeado para `auth.users.id`), `first_name text`, `last_name text`, `specialty text`, `crp text`, `phone text`, `address text`, `avatar_url text`.
- RLS e policies:
```sql
create policy "read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
```

3) Storage: bucket `avatars`
- Crie o bucket `avatars`. Para o código atual, use público (ou ajuste para URLs assinadas).
- Políticas (caso não seja público):
```sql
create policy "read public avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "users can manage own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can update own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can delete own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

4) Buckets e caminho de upload
- O app envia o avatar para `avatars/${user.id}/avatar.<ext>`; garanta que `auth.uid()` corresponda ao primeiro segmento do path.

### GitHub OAuth

- Habilite GitHub como provider no Supabase e copie Client ID/Secret do GitHub.
- No GitHub, crie um OAuth App:
  - Homepage URL: `http://localhost:8080` (local) ou sua URL de produção
  - Authorization callback URL: use a mesma URL (Supabase cuidará do retorno)
- No Supabase Auth → Providers → GitHub, cole o Client ID/Secret.
- No frontend, `Login.tsx` já está com `providers={["github"]}` e usa `VITE_SUPABASE_REDIRECT_URL` como `redirectTo`.

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
- `src/pages/` - Páginas da aplicação
- `src/components/` - Componentes reutilizáveis
- `src/integrations/` - Integrações com serviços externos
- `public/` - Arquivos estáticos

## Tecnologias Utilizadas

- React com TypeScript
- Vite
- Tailwind CSS
- Supabase (autenticação e banco de dados)
- shadcn/ui components