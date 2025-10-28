import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  PlayCircle,
  HeartHandshake,
  BrainCircuit,
  Mic,
  Footprints,
  BookOpen,
  HeartPulse,
  Music,
  Salad,
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  Lock,
  Download,
  Star,
  CheckCircle,
  ToyBrick,
} from "lucide-react";

const specialties = [
  { icon: BrainCircuit, name: "Psicologia", description: "Gestão de sessões, prontuários e planos terapêuticos." },
  { icon: Mic, name: "Fonoaudiologia", description: "Acompanhamento da evolução da fala e linguagem." },
  { icon: ToyBrick, name: "Terapia Ocupacional", description: "Atividades para autonomia e desenvolvimento sensorial." },
  { icon: Footprints, name: "Psicomotricidade", description: "Registro de atividades e desenvolvimento motor." },
  { icon: BookOpen, name: "Psicopedagogia", description: "Planos de intervenção e relatórios de aprendizagem." },
  { icon: HeartPulse, name: "Fisioterapia", description: "Monitoramento de progresso motor e funcional." },
  { icon: Music, name: "Musicoterapia", description: "Registro de sessões e respostas a estímulos musicais." },
  { icon: Salad, name: "Nutrição", description: "Planos alimentares e acompanhamento da seletividade." },
];

const features = [
  { icon: Users, title: "Gestão de Pacientes", description: "Prontuários completos, histórico clínico e evoluções em um só lugar." },
  { icon: FileText, title: "Relatórios Automáticos", description: "Crie relatórios técnicos e personalizados com nosso assistente inteligente." },
  { icon: Calendar, title: "Agendamento de Sessões", description: "Agenda integrada para organizar seus atendimentos de forma simples e visual." },
  { icon: Download, title: "Exportação Profissional", description: "Exporte evoluções, relatórios e planos terapêuticos em PDF com sua logo." },
  { icon: HeartHandshake, title: "Área do Paciente", description: "Um portal seguro para compartilhar informações e atividades com as famílias." },
  { icon: ShieldCheck, title: "Segurança e Sigilo", description: "Dados criptografados e em conformidade com as normas de sigilo profissional." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-xl items-center">
          <Logo />
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex ml-10">
            <a href="#especialidades" className="transition-colors hover:text-primary">Especialidades</a>
            <a href="#recursos" className="transition-colors hover:text-primary">Recursos</a>
            <a href="#planos" className="transition-colors hover:text-primary">Planos</a>
            <a href="#depoimentos" className="transition-colors hover:text-primary">Depoimentos</a>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90">
              <Link to="/login">Teste Gratuito</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"></div>
          <div className="container text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="MultiTEA Logo" 
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Gestão inteligente para profissionais que cuidam com amor.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              O MultiTEA centraliza tudo que você precisa para otimizar sua prática terapêutica, permitindo que você foque no mais importante: a evolução de seus pacientes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/login">Comece seu teste gratuito <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline">
                <PlayCircle className="mr-2 h-5 w-5" /> Ver demonstração
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="sobre" className="py-16 md:py-24 bg-muted/50">
          <div className="container max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold md:text-4xl">O que é o MultiTEA?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              O MultiTEA é um sistema completo, criado por terapeutas para terapeutas. Nossa missão é simplificar sua rotina administrativa com ferramentas inteligentes para gestão de pacientes, agendamentos, criação de relatórios e acompanhamento de evoluções, tudo em um ambiente seguro e intuitivo.
            </p>
          </div>
        </section>

        {/* Specialties Section */}
        <section id="especialidades" className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold md:text-4xl">Desenvolvido para todas as áreas terapêuticas</h2>
              <p className="mt-4 text-lg text-muted-foreground">Modelos de anamnese, evolução e relatórios adaptados para sua especialidade.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialties.map((spec) => (
                <Card key={spec.name} className="text-center p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <spec.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{spec.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{spec.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="py-16 md:py-24 bg-muted/50">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold md:text-4xl">Recursos que transformam sua rotina</h2>
              <p className="mt-4 text-lg text-muted-foreground">Ferramentas poderosas para uma gestão clínica eficiente e humanizada.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1 p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planos" className="py-16 md:py-24">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold md:text-4xl">Planos flexíveis para sua necessidade</h2>
              <p className="mt-4 text-lg text-muted-foreground">Escolha o plano ideal e comece a transformar sua prática hoje mesmo.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Essencial</CardTitle>
                  <p className="text-4xl font-bold mt-4">R$ 79<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Até 20 pacientes</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Agenda e Prontuários</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Suporte por e-mail</p>
                </CardContent>
                <div className="p-6 pt-0"><Button className="w-full" variant="outline">Começar agora</Button></div>
              </Card>
              <Card className="flex flex-col border-2 border-primary shadow-lg relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">Mais Popular</div>
                <CardHeader>
                  <CardTitle>Profissional</CardTitle>
                  <p className="text-4xl font-bold mt-4">R$ 129<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Pacientes ilimitados</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Relatórios com IA</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Área do Paciente</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Suporte prioritário</p>
                </CardContent>
                <div className="p-6 pt-0"><Button className="w-full">Escolher plano</Button></div>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Clínica</CardTitle>
                  <p className="text-4xl font-bold mt-4">Contato</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Múltiplos terapeutas</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Gestão de permissões</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Faturamento integrado</p>
                  <p className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Suporte dedicado</p>
                </CardContent>
                <div className="p-6 pt-0"><Button className="w-full" variant="outline">Fale conosco</Button></div>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-16 md:py-24 bg-muted/50">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold md:text-4xl">O que os terapeutas dizem sobre o MultiTEA</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                { name: "Juliana Oliveira", specialty: "Psicóloga", quote: "O MultiTEA revolucionou minha organização. Consigo dedicar muito mais tempo aos meus pacientes e menos tempo à burocracia." },
                { name: "Carlos Ferreira", specialty: "Terapeuta Ocupacional", quote: "A funcionalidade de relatórios com IA é uma mão na roda. Agiliza meu trabalho e garante que nada importante seja esquecido." },
                { name: "Fernanda Costa", specialty: "Fonoaudióloga", quote: "A melhor plataforma que já usei. É intuitiva, completa e o suporte é muito atencioso. Recomendo para todos os colegas." },
              ].map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="p-6">
                    <div className="flex mb-2">{Array(5).fill(0).map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}</div>
                    <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                    <div className="mt-4 font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.specialty}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32">
          <div className="container text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold md:text-4xl">Pronto para transformar sua prática terapêutica?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comece seu teste gratuito de 14 dias. Sem cartão de crédito, sem compromisso.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/login">Experimente o MultiTEA agora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo size="sm" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} MultiTEA. Todos os direitos reservados.
            </p>
          </div>
          <nav className="flex gap-4">
            <Link to="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Termos de Uso</Link>
            <Link to="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Política de Privacidade</Link>
            <Link to="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contato</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;