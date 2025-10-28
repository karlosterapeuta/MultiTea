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

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      });
      if (error) {
        setSignupError(error.message);
      }
    } catch (err: any) {
      setSignupError(err?.message || "Erro ao cadastrar");
    } finally {
      setSignupLoading(false);
    }
  };

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
            <form onSubmit={handleEmailSignup} className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="border rounded-md px-3 py-2"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Senha</label>
                <input
                  type="password"
                  className="border rounded-md px-3 py-2"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {signupError && (
                <p className="text-sm text-red-600">{signupError}</p>
              )}
              <button
                type="submit"
                className="mt-1 bg-black text-white rounded-md py-2 disabled:opacity-60"
                disabled={signupLoading}
              >
                {signupLoading ? "Cadastrando..." : "Cadastrar com email"}
              </button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={["github"]}
              magicLink={false}
              onlyThirdPartyProviders={false}
              theme="light"
              redirectTo={import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'Entrar',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre',
                  },
                  sign_up: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'Cadastrar',
                    social_provider_text: 'Cadastrar com {{provider}}',
                    link_text: 'Não tem uma conta? Cadastre-se',
                  },
                  forgotten_password: {
                    email_label: 'Seu email',
                    button_label: 'Enviar instruções',
                    link_text: 'Esqueceu sua senha?',
                  },
                },
              }}
            />
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