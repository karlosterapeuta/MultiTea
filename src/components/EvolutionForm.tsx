"use client";

import React, { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient } from "@/types";

type EvolutionField = {
  id: string;
  label: string;
  description?: string;
  type: "textarea" | "section-header" | "date";
  placeholder?: string;
  defaultValue?: any;
  suggestions?: string[];
};

const evolutionModels: Record<string, EvolutionField[]> = {
  "Musicoterapia": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou?", type: "textarea", placeholder: "Estado de humor, relato do cuidador...", suggestions: ["Chegou tranquilo e cooperativo.", "Apresentou-se agitado, com estereotipias motoras.", "Cuidador relatou uma noite de sono ruim.", "Verbalizou estar feliz para a sessão."] },
    { id: "recursosDinamicas", label: "Recursos e Dinâmicas Utilizadas", type: "textarea", placeholder: "Instrumentos, canções, atividades...", suggestions: ["Instrumentos de percussão (tambor, chocalho).", "Violão e canções de boas-vindas.", "Improvisação musical livre.", "Composição conjunta de uma pequena canção.", "Jogos musicais de imitação rítmica."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Fomentar a intenção comunicativa.", "Trabalhar a troca de turnos e a reciprocidade.", "Promover a regulação emocional através da música.", "Estimular a consciência corporal e o planejamento motor."] },
    { id: "respostasMusicais", label: "Respostas ao Ritmo, Melodia e Harmonia", type: "textarea", placeholder: "Sincronia, reações afetivas...", suggestions: ["Demonstrou sincronia rítmica com o corpo.", "Acompanhou a linha melódica com vocalizações.", "Reagiu a mudanças harmônicas (maior/menor) com alterações no afeto.", "Apresentou hiperfoco em um padrão rítmico específico.", "Mostrou-se sensível a frequências [agudas/graves]."] },
    { id: "participacaoAtiva", label: "Participação Ativa", type: "textarea", placeholder: "Uso de instrumentos, canto, movimento...", suggestions: ["Explorou os instrumentos de forma funcional.", "Iniciou o canto de músicas conhecidas.", "Utilizou o movimento corporal para expressar a música.", "Manteve-se engajado na atividade musical por [tempo]."] },
    { id: "evolucaoComunicacao", label: "Evolução na Comunicação", type: "textarea", placeholder: "Comunicação verbal e não-verbal...", suggestions: ["Utilizou o olhar para solicitar um instrumento.", "Fez contato visual durante as trocas musicais.", "Aumentou o repertório de vocalizações.", "Respondeu a perguntas simples dentro do contexto musical."] },
    { id: "respostasEmocionais", label: "Respostas Emocionais", type: "textarea", placeholder: "Expressão de emoções...", suggestions: ["Demonstrou alegria através de sorrisos e movimentos.", "A música pareceu ter um efeito calmante.", "Expressou frustração de forma adequada quando desafiado.", "Compartilhou afeto através da interação musical."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações para maximizar benefícios...", suggestions: ["Reduziu-se a complexidade rítmica para facilitar o acompanhamento.", "Aumentou-se o tempo de uma atividade de preferência.", "Introduziu-se um instrumento novo para estimular a exploração.", "Utilizou-se uma canção para facilitar a transição entre atividades."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Estado de humor, comportamentos...", suggestions: ["Saiu calmo e regulado.", "Mostrou-se satisfeito, despedindo-se com um gesto.", "Apresentou-se mais verbal e interativo que na chegada.", "Precisou de ajuda na transição para o final da sessão."] },
  ],
  "Psicologia": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou?", type: "textarea", placeholder: "Estado de humor, relato do cuidador...", suggestions: ["Chegou regulado, comunicando-se sobre seu dia.", "Apresentou-se ansioso devido a uma mudança na rotina.", "Cuidador relatou um bom desempenho escolar na semana.", "Demonstrou baixa tolerância à frustração na sala de espera."] },
    { id: "recursosAtividades", label: "Recursos e Atividades Utilizadas", type: "textarea", placeholder: "Jogos, livros, técnicas...", suggestions: ["Jogo de regras para trabalhar troca de turnos e flexibilidade.", "Uso de histórias sociais para abordar [tema].", "Técnicas de role-playing para treino de habilidades sociais.", "Atividade de desenho para expressão de sentimentos.", "Termômetro das emoções para psicoeducação."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Desenvolver habilidades de Teoria da Mente.", "Aumentar a flexibilidade cognitiva.", "Treinar a identificação e nomeação de emoções.", "Promover a resolução de problemas sociais."] },
    { id: "comportamentosObservados", label: "Comportamentos e Interações Observadas", type: "textarea", placeholder: "Interação, comunicação, rigidez...", suggestions: ["Iniciou interações sociais com o terapeuta [n] vezes.", "Demonstrou rigidez de pensamento ao [situação].", "Utilizou o interesse focado em [tema] para se comunicar.", "Apresentou [n] episódios de comportamento disruptivo com função de [função]."] },
    { id: "habilidadesCognitivas", label: "Habilidades Cognitivas e de Regulação", type: "textarea", placeholder: "Atenção, funções executivas, regulação...", suggestions: ["Manteve a atenção sustentada por [tempo] na tarefa.", "Demonstrou dificuldade no planejamento e execução de [atividade].", "Utilizou [estratégia de regulação] com sucesso após mediação.", "Mostrou dificuldade em compreender a perspectiva do outro no jogo."] },
    { id: "evolucaoComunicacao", label: "Evolução na Comunicação", type: "textarea", placeholder: "Pragmática, compreensão...", suggestions: ["Respeitou os turnos conversacionais.", "Fez comentários pertinentes ao tópico da conversa.", "Compreendeu linguagem não-literal (ironia, metáfora) com ajuda.", "Apresentou ecolalia [imediata/tardia] com função [comunicativa/auto-regulatória]."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações para maximizar benefícios...", suggestions: ["A atividade foi simplificada para garantir o sucesso e aumentar a motivação.", "Fornecido suporte visual para explicar as regras do jogo.", "Utilizado reforço positivo para comportamentos-alvo.", "A sessão foi encurtada devido à desregulação do paciente."] },
    { id: "orientacoes", label: "Orientações para Família/Escola", type: "textarea", placeholder: "Recomendações e estratégias...", suggestions: ["Orientado aos pais que usem [estratégia] para lidar com [comportamento].", "Sugerido à escola a implementação de [adaptação] em sala de aula.", "Modelado para o cuidador como mediar uma situação de conflito.", "Enviado material sobre [tema] para a família."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Estado de humor, comportamentos...", suggestions: ["Saiu tranquilo, verbalizando o que gostou na sessão.", "Apresentou-se satisfeito com seu desempenho.", "Mostrou-se cansado, mas regulado.", "Precisou de previsibilidade sobre a próxima sessão para sair bem."] },
  ],
  "Fonoaudiologia": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou?", type: "textarea", placeholder: "Estado de humor, relato do cuidador...", suggestions: ["Chegou comunicativo, usando frases curtas.", "Cuidador relatou que experimentou um novo alimento.", "Apresentou-se quieto e pouco interativo.", "Usou o CAA para cumprimentar."] },
    { id: "recursosAtividades", label: "Recursos e Atividades Utilizadas", type: "textarea", placeholder: "Jogos, livros, CAA...", suggestions: ["Livro de figuras para expansão de vocabulário.", "Jogos de tabuleiro para trabalhar pragmática.", "Software de Comunicação Alternativa (CAA).", "Atividades de sopro e sucção.", "Espelho para feedback visual na articulação."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Aumentar o Comprimento Médio do Enunciado (CME).", "Trabalhar a articulação do fonema-alvo [fonema].", "Estimular a compreensão de inferências.", "Promover o uso funcional da CAA.", "Dessensibilização oral para novas texturas."] },
    { id: "desempenhoComunicativo", label: "Desempenho Comunicativo (Receptivo e Expressivo)", type: "textarea", placeholder: "Compreensão, fala, intenção...", suggestions: ["Compreendeu comandos de [n] etapas com [suporte].", "Produziu frases de [n] palavras de forma espontânea.", "Demonstrou intenção comunicativa para [função, ex: pedir, comentar].", "A inteligibilidade da fala foi de aproximadamente [porcentagem]."] },
    { id: "habilidadesPragmaticas", label: "Habilidades Pragmáticas", type: "textarea", placeholder: "Uso social da linguagem...", suggestions: ["Manteve o contato visual durante a conversação.", "Respeitou a troca de turnos em [n] oportunidades.", "Teve dificuldade em manter o tópico conversacional.", "Iniciou a comunicação [n] vezes."] },
    { id: "aspectosMotoresFala", label: "Aspectos Motores da Fala e Alimentação", type: "textarea", placeholder: "Articulação, mastigação...", suggestions: ["A produção do fonema [fonema] foi correta em [nível, ex: sílabas, palavras].", "Apresentou vedamento labial adequado.", "Mostrou-se mais tolerante à textura [textura].", "A mastigação foi [bilateral/unilateral]."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações para maximizar benefícios...", suggestions: ["Fornecida pista fonética para a produção do som-alvo.", "A atividade foi dividida em etapas menores.", "Utilizado um item de alto interesse para aumentar o engajamento.", "Simplificada a linguagem para garantir a compreensão."] },
    { id: "orientacoes", label: "Orientações para Família/Escola", type: "textarea", placeholder: "Recomendações e estratégias...", suggestions: ["Orientado à família que modele frases completas.", "Sugerido o uso de pausas para incentivar a comunicação.", "Enviado para casa atividade de [habilidade].", "Recomendado à escola que incentive o uso do CAA."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Estado de humor, comportamentos...", suggestions: ["Saiu mais falante e interativo.", "Demonstrou orgulho de suas produções.", "Comunicou-se para se despedir.", "Mostrou-se cansado após o esforço comunicativo."] },
  ],
  "Terapia Ocupacional": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou?", type: "textarea", placeholder: "Nível de alerta, relato do cuidador...", suggestions: ["Chegou com nível de alerta baixo (hiporresponsivo).", "Apresentou-se hiperalerta e buscando movimento.", "Cuidador relatou sucesso na AVD de [AVD].", "Mostrou-se resistente a tirar o casaco (defensividade tátil)."] },
    { id: "recursosAtividades", label: "Recursos e Atividades Utilizadas", type: "textarea", placeholder: "Equipamentos, materiais...", suggestions: ["Circuito motor com equipamentos suspensos (balanço, trapézio).", "Caixa de texturas para estimulação tátil.", "Atividades de motricidade fina (massinha, pinça, tesoura).", "Treino de Atividade de Vida Diária (AVD) de [AVD].", "Uso de colete ponderado para feedback proprioceptivo."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Promover a modulação sensorial.", "Melhorar o planejamento motor (práxis).", "Aumentar a independência na AVD de [AVD].", "Desenvolver a coordenação motora fina e a integração viso-motora."] },
    { id: "processamentoSensorial", label: "Processamento Sensorial e Respostas", type: "textarea", placeholder: "Modulação, discriminação...", suggestions: ["Buscou ativamente estímulos [proprioceptivos/vestibulares] para se organizar.", "Apresentou defensividade tátil ao contato com [material].", "Nível de alerta modulado com sucesso através de [estratégia].", "Demonstrou hiporresponsividade a estímulos auditivos.", "Utilizou a pressão profunda como estratégia de autorregulação."] },
    { id: "desempenhoMotor", label: "Desempenho Motor (Práxis, Coordenação)", type: "textarea", placeholder: "Planejamento, execução...", suggestions: ["Demonstrou bom planejamento motor para transpor o circuito.", "Apresentou dificuldade na ideação (saber o que fazer) da tarefa.", "A preensão do lápis foi [tipo de preensão].", "Mostrou melhora na coordenação bilateral durante [atividade]."] },
    { id: "desempenhoOcupacional", label: "Desempenho Ocupacional (AVDs, Brincar)", type: "textarea", placeholder: "Independência, engajamento...", suggestions: ["Realizou [n] etapas da AVD de forma independente.", "O brincar foi [simbólico/funcional/exploratório].", "Manteve-se engajado na atividade de mesa por [tempo].", "Demonstrou iniciativa na escolha do brincar."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações para maximizar benefícios...", suggestions: ["O desafio da atividade foi graduado (aumentado/diminuído).", "Fornecido suporte físico para a execução do movimento.", "O ambiente foi modificado para reduzir estímulos distratores.", "A atividade foi alterada para uma de preferência do paciente."] },
    { id: "orientacoes", label: "Orientações para Família/Escola", type: "textarea", placeholder: "Recomendações e estratégias...", suggestions: ["Recomendada a implementação de uma 'dieta sensorial' em casa.", "Sugerido o uso de [adaptação, ex: assento de disco] na escola.", "Orientado sobre como preparar o ambiente para a AVD de [AVD].", "Enviado para casa um jogo para estimular a motricidade fina."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Nível de alerta, comportamentos...", suggestions: ["Saiu calmo e organizado.", "Mostrou-se orgulhoso da sua 'obra de arte'.", "Apresentou-se cansado, mas regulado.", "Verbalizou que gostou do balanço."] },
  ],
  "Nutrição": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou? / Relato do cuidador", type: "textarea", placeholder: "Relato da semana alimentar, queixas...", suggestions: ["Família relata sucesso na introdução de [alimento].", "Paciente apresentou recusa alimentar significativa nas refeições principais.", "Cuidador reporta queixas gastrointestinais (constipação/diarreia).", "Houve boa aceitação dos suplementos prescritos."] },
    { id: "recursosDinamicas", label: "Recursos e Dinâmicas Utilizadas", type: "textarea", placeholder: "Estratégias, materiais...", suggestions: ["Utilizada a estratégia de 'food chaining' a partir de [alimento aceito].", "Realizada atividade de exploração sensorial com [alimento-alvo].", "Uso de pratos lúdicos e cortadores para melhorar a apresentação.", "Sessão de culinária terapêutica para [preparação]."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Aumentar o repertório alimentar com foco em [grupo alimentar].", "Trabalhar a dessensibilização oral para texturas [crocantes/pastosas].", "Avançar na hierarquia de exposição ao [alimento-alvo].", "Manejo de sintomas gastrointestinais."] },
    { id: "respostasAlimentaresSensoriais", label: "Respostas Alimentares e Sensoriais", type: "textarea", placeholder: "Reações, comportamentos...", suggestions: ["Paciente tolerou o [alimento] no prato por [tempo].", "Apresentou reflexo de gag ao [cheirar/tocar] o alimento.", "Demonstrou rigidez, aceitando o alimento apenas em [formato/marca específica].", "Explorou o alimento com as mãos, mas não levou à boca."] },
    { id: "evolucaoAceitacao", label: "Evolução na Aceitação e Comportamento", type: "textarea", placeholder: "Progresso, novas aceitações...", suggestions: ["Paciente avançou na etapa de [tocar/cheirar/lamber/provar] o alimento.", "Aceitou experimentar [novo alimento] após observá-lo em [n] sessões.", "Houve redução dos comportamentos de fuga durante as refeições.", "Generalizou a aceitação de [alimento] para o ambiente doméstico."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações para maximizar benefícios...", suggestions: ["A demanda foi reduzida, focando apenas em tolerar o alimento no ambiente.", "A apresentação do alimento foi modificada para [descrição].", "Utilizado um alimento de alta preferência como reforçador positivo.", "A sessão foi focada em brincadeiras não relacionadas à comida para diminuir a ansiedade."] },
    { id: "orientacoes", label: "Orientações para Família", type: "textarea", placeholder: "Recomendações para casa...", suggestions: ["Orientado à família que continue a exposição passiva de [alimento] nas refeições.", "Sugerido envolver a criança no preparo de [receita simples].", "Reforçada a importância de não pressionar e manter um ambiente de refeição neutro.", "Ajustada a prescrição de [suplemento]."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Estado de humor, comportamentos...", suggestions: ["Saiu tranquilo, apesar da exposição a novos alimentos.", "Mostrou-se orgulhoso por ter conseguido [interagir com o alimento].", "Apresentou-se mais regulado que na chegada.", "Verbalizou sobre o que gostou ou não na sessão."] },
  ],
  "Padrão": [
    { id: "sessionDate", label: "Data da Sessão", type: "date", defaultValue: new Date().toISOString().split('T')[0] },
    { id: "chegadaPaciente", label: "Como o paciente chegou?", type: "textarea", placeholder: "Estado de humor, relato do cuidador...", suggestions: ["Chegou tranquilo e cooperativo.", "Apresentou-se agitado.", "Cuidador relatou uma boa semana."] },
    { id: "recursosAtividades", label: "Recursos e Atividades Utilizadas", type: "textarea", placeholder: "Materiais, jogos, técnicas...", suggestions: ["Utilizado [recurso 1].", "Realizada [atividade 1]."] },
    { id: "planoTerapeuticoSessao", label: "Plano Terapêutico em Foco", type: "textarea", placeholder: "Objetivos da sessão...", suggestions: ["Foco em [objetivo 1].", "Trabalhar [habilidade 1]."] },
    { id: "desempenhoObservado", label: "Desempenho e Comportamentos Observados", type: "textarea", placeholder: "Como o paciente respondeu...", suggestions: ["Demonstrou bom engajamento.", "Apresentou dificuldade em [tarefa].", "Mostrou progresso em [habilidade]."] },
    { id: "ajustesSessao", label: "Ajustes Feitos na Sessão", type: "textarea", placeholder: "Adaptações realizadas...", suggestions: ["A atividade foi simplificada.", "Foi oferecido um reforçador de preferência."] },
    { id: "orientacoes", label: "Orientações", type: "textarea", placeholder: "Recomendações para casa/escola...", suggestions: ["Orientado à família que [orientação].", "Sugerido à escola que [sugestão]."] },
    { id: "saidaPaciente", label: "Como o paciente saiu?", type: "textarea", placeholder: "Estado de humor, comportamentos...", suggestions: ["Saiu calmo e regulado.", "Mostrou-se satisfeito."] },
  ],
};

evolutionModels["Psicomotricidade"] = evolutionModels["Terapia Ocupacional"];
evolutionModels["Psicopedagogia"] = evolutionModels["Psicologia"];
evolutionModels["Fisioterapia"] = evolutionModels["Terapia Ocupacional"];

const createEvolutionSchema = (model: EvolutionField[]) => z.object({
  patientId: z.string().min(1, { message: "O nome do paciente é obrigatório." }),
  ...model.reduce((acc, field) => {
    if (field.type !== "section-header") {
      return { ...acc, [field.id]: z.string().optional() };
    }
    return acc;
  }, {})
});

export type EvolutionFormData = z.infer<ReturnType<typeof createEvolutionSchema>>;

interface EvolutionFormProps {
  id?: string;
  specialty: string;
  onSave: (data: EvolutionFormData) => void;
  initialData?: EvolutionFormData | null;
  hideButtons?: boolean;
  patients: Patient[];
}

export const EvolutionForm = ({ id, specialty, onSave, initialData = null, hideButtons = false, patients }: EvolutionFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const currentModel = evolutionModels[specialty] || evolutionModels["Padrão"];
  const evolutionSchema = createEvolutionSchema(currentModel);

  const form = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: initialData || {
      patientId: "",
      ...currentModel.reduce((acc, field) => {
        if (field.type !== "section-header") {
          acc[field.id as keyof EvolutionFormData] = field.defaultValue || "";
        }
        return acc;
      }, {} as any),
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form.reset]);

  const handleSuggestionClick = (fieldName: keyof EvolutionFormData, suggestion: string) => {
    const currentValue = form.getValues(fieldName) || "";
    const newValue = currentValue ? `${currentValue}\n- ${suggestion}` : `- ${suggestion}`;
    form.setValue(fieldName, newValue, { shouldValidate: true });
  };

  const onSubmit = (data: EvolutionFormData) => {
    onSave(data);
    if (!initialData) {
      toast.success("Registro de evolução salvo com sucesso!");
      form.reset({
        patientId: "",
        ...currentModel.reduce((acc, field) => {
          if (field.type !== "section-header") {
            acc[field.id as keyof EvolutionFormData] = field.defaultValue || "";
          }
          return acc;
        }, {} as any),
      });
    }
  };

  const handleDownloadPDF = () => {
    const formData = form.getValues();
    const patient = patients.find(p => p.id === formData.patientId);
    const patientName = patient?.name;

    if (!patientName || !patientName.trim()) {
      toast.error("Por favor, selecione um paciente antes de baixar o PDF.");
      return;
    }

    toast.info("Gerando PDF da Evolução...");

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 20;

    // --- Header ---
    doc.setFillColor(23, 73, 77); // Dark Teal
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Relatório de Evolução", pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const sessionDateValue = formData.sessionDate || new Date().toISOString().split('T')[0];
    const sessionDate = new Date(sessionDateValue).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    doc.text(`Paciente: ${patientName}`, margin, 30);
    doc.text(`Data da Sessão: ${sessionDate}`, margin, 35);
    
    y = 55;

    // --- Body ---
    doc.setTextColor(28, 25, 23);

    currentModel.forEach(field => {
      if (field.type === 'section-header' || field.id === 'patientId' || field.id === 'sessionDate') {
        return;
      }

      const value = formData[field.id as keyof EvolutionFormData];
      if (value && typeof value === 'string' && value.trim()) {
        const valueLines = doc.splitTextToSize(value, pageWidth - margin * 2);
        const valueHeight = valueLines.length * 5;
        const labelHeight = 6;
        
        if (y + labelHeight + valueHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(field.label, margin, y);
        y += labelHeight;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(valueLines, margin, y);
        y += valueHeight + 5;
        
        doc.setDrawColor(224, 224, 224);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      }
    });

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
        doc.text(
            `Gerado por MultiTea`,
            margin,
            pageHeight - 10
        );
    }

    const dateForFile = formData.sessionDate || new Date().toISOString().split('T')[0];
    doc.save(`Evolucao_${specialty}_${patientName.replace(/\s+/g, '_')}_${dateForFile}.pdf`);
    toast.success("PDF da Evolução gerado com sucesso!");
  };

  return (
    <Form {...form}>
      <form id={id} ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Nome do Paciente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <hr/>
        {currentModel.map((field) => {
          if (field.type === "section-header") {
            return (
              <div key={field.id} className="pt-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">{field.label}</h3>
              </div>
            );
          }

          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id as keyof EvolutionFormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="font-bold">{field.label}</FormLabel>
                  {field.description && <FormDescription>{field.description}</FormDescription>}
                  <FormControl>
                    {field.type === "textarea" ? (
                      <Textarea placeholder={field.placeholder} {...formField} value={formField.value || ''} rows={5} />
                    ) : (
                      <Input type={field.type} placeholder={field.placeholder} {...formField} value={formField.value || ''} />
                    )}
                  </FormControl>
                  {field.suggestions && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {field.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSuggestionClick(field.id as keyof EvolutionFormData, suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        {!hideButtons && (
          <div className="flex space-x-2 pt-2 form-buttons">
            <Button type="submit">Salvar Evolução</Button>
            <Button type="button" variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};