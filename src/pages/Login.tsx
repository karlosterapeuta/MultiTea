import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  

  if (loading) {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <div className="mb-4 flex justify-center">
                <Logo />
              </div>
              <h1 className="text-3xl font-bold">Carregando...</h1>
              <p className="text-balance text-muted-foreground">
                Verificando autenticação...
              </p>
            </div>
          </div>
        </div>
        <div className="hidden bg-muted lg:block">
          <img
            src="/placeholder.svg"
            alt="Uma imagem inspiradora mostrando um ambiente terapêutico acolhedor."
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold">Bem-vindo!</h1>
            <p className="text-balance text-muted-foreground">
              Acesse sua conta para continuar.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                className={`flex-1 py-2 ${mode === 'signin' ? 'bg-black text-white' : ''}`}
                onClick={() => { setSubmitError(null); setMode('signin'); }}
              >Entrar</button>
              <button
                type="button"
                className={`flex-1 py-2 ${mode === 'signup' ? 'bg-black text-white' : ''}`}
                onClick={() => { setSubmitError(null); setMode('signup'); }}
              >Cadastrar</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitError(null);
                setSubmitLoading(true);
                try {
                  if (mode === 'signin') {
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) setSubmitError(error.message);
                  } else {
                    const { error } = await supabase.auth.signUp({
                      email,
                      password,
                      options: { emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin },
                    });
                    if (error) setSubmitError(error.message);
                  }
                } catch (err: any) {
                  setSubmitError(err?.message || 'Erro de autenticação');
                } finally {
                  setSubmitLoading(false);
                }
              }}
              className="grid gap-3"
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="border rounded-md px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Senha</label>
                <input
                  type="password"
                  className="border rounded-md px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <button
                type="submit"
                className="mt-1 bg-black text-white rounded-md py-2 disabled:opacity-60"
                disabled={submitLoading}
              >
                {submitLoading ? (mode === 'signin' ? 'Entrando...' : 'Cadastrando...') : (mode === 'signin' ? 'Entrar' : 'Cadastrar')}
              </button>
            </form>

            <button
              type="button"
              onClick={async () => {
                try {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin }
                  });
                } catch (e) {
                  console.error('Erro ao iniciar login Google', e);
                  alert('Falha ao iniciar login com Google. Verifique configurações do provedor.');
                }
              }}
              className="w-full border rounded-md py-2"
            >
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Uma imagem inspiradora mostrando um ambiente terapêutico acolhedor."
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Login;