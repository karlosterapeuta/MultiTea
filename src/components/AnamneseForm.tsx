"use client";

import React, { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient } from "@/types";

// Definição de tipos para os campos do formulário
type AnamneseField = {
  id: string;
  label: string;
  description?: string;
  type: "textarea" | "checkbox-group" | "radio-group" | "select" | "section-header";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
};

// --- Modelos de Anamnese por especialidade com foco em TEA ---
const anamneseModels: Record<string, AnamneseField[]> = {
  "Psicologia": [
    { id: "queixaPrincipal", label: "Queixa Principal / Motivo da Avaliação", type: "textarea", placeholder: "Descreva a principal queixa da família/paciente, quem encaminhou e por quê." },
    { id: "historicoQueixa", label: "Histórico da Queixa", type: "textarea", placeholder: "Quando os primeiros sinais foram notados? Houve algum evento marcante associado? Como a família tem lidado com a situação?" },
    { id: "headerSaudeDesenvolvimento", label: "Histórico de Saúde e Desenvolvimento", type: "section-header" },
    { id: "gestacaoParto", label: "Gestação e Parto", type: "textarea", placeholder: "Houve intercorrências na gestação (infecções, uso de medicação, etc.)? Como foi o parto (normal, cesárea, fórceps)? Prematuridade? Peso ao nascer?" },
    { id: "historicoSaude", label: "Histórico de Saúde Geral", type: "textarea", placeholder: "Doenças crônicas, alergias, cirurgias, internações, medicações em uso, histórico de convulsões." },
    { id: "padraoSono", label: "Padrão de Sono", type: "checkbox-group", options: [{ value: "dificuldade_iniciar", label: "Dificuldade para iniciar o sono" }, { value: "despertares_frequentes", label: "Despertares frequentes" }, { value: "sono_agitado", label: "Sono agitado" }, { value: "terror_noturno", label: "Terror noturno/Pesadelos" }, { value: "dorme_sozinho", label: "Dorme sozinho no próprio quarto" }] },
    { id: "marcosMotores", label: "Marcos Motores (Sustentou cabeça, sentou, engatinhou, andou)", type: "radio-group", options: [{ value: "esperado", label: "Dentro do esperado" }, { value: "atraso", label: "Atraso observado" }, { value: "nao_observado", label: "Não observado/Não sabe" }] },
    { id: "marcosFala", label: "Marcos da Fala (Balbucio, primeiras palavras, frases)", type: "radio-group", options: [{ value: "esperado", label: "Dentro do esperado" }, { value: "atraso", label: "Atraso observado" }, { value: "regressao", label: "Houve regressão da fala" }] },
    { id: "desfralde", label: "Controle dos Esfíncteres (Desfralde)", type: "radio-group", options: [{ value: "completo", label: "Completo (diurno e noturno)" }, { value: "parcial", label: "Parcial (apenas diurno)" }, { value: "em_processo", label: "Em processo" }, { value: "nao_iniciado", label: "Não iniciado" }, { value: "dificuldades", label: "Apresenta dificuldades significativas" }] },
    { id: "headerSocial", label: "Comunicação e Interação Social", type: "section-header" },
    { id: "contatoVisual", label: "Contato Visual", type: "radio-group", options: [{ value: "bom", label: "Bom e sustentado" }, { value: "fugaz", label: "Fugaz/Inconsistente" }, { value: "raro", label: "Raro ou ausente" }] },
    { id: "atendePeloNome", label: "Atende pelo nome", type: "radio-group", options: [{ value: "sempre", label: "Sim, consistentemente" }, { value: "as_vezes", label: "Às vezes/Inconsistente" }, { value: "raramente", label: "Raramente ou não" }] },
    { id: "atencaoCompartilhada", label: "Atenção Compartilhada (Apontar, mostrar, seguir o olhar)", type: "checkbox-group", options: [{ value: "aponta_pedir", label: "Aponta para pedir" }, { value: "aponta_mostrar", label: "Aponta para mostrar interesse" }, { value: "segue_gestos", label: "Segue gestos/apontar do outro" }, { value: "dificuldade", label: "Apresenta dificuldade" }] },
    { id: "interacaoPares", label: "Interação com Pares", type: "radio-group", options: [{ value: "inicia", label: "Inicia interação" }, { value: "responde", label: "Responde, mas não inicia" }, { value: "isolamento", label: "Prefere isolar-se" }, { value: "inadequada", label: "Interage de forma inadequada" }] },
    { id: "reciprocidadeSocioemocional", label: "Reciprocidade Sócio-emocional", type: "textarea", placeholder: "Como demonstra afeto? Compartilha interesses e emoções? Busca conforto em outros?" },
    { id: "headerComportamento", label: "Comportamentos, Interesses e Atividades (CIRs)", type: "section-header" },
    { id: "estereotipias", label: "Estereotipias (Motoras e Verbais)", type: "checkbox-group", options: [{ value: "flapping", label: "Flapping (mãos)" }, { value: "balancar_corpo", label: "Balançar o corpo" }, { value: "andar_ponta_pes", label: "Andar na ponta dos pés" }, { value: "ecolalia", label: "Ecolalia (imediata/tardia)" }, { value: "frases_repetitivas", label: "Repetição de frases/jargões" }, { value: "outros", label: "Outros" }] },
    { id: "interesses", label: "Interesses", type: "radio-group", options: [{ value: "restritos", label: "Restritos e intensos (hiperfoco)" }, { value: "incomuns", label: "Incomuns para a idade/intensidade" }, { value: "variados", label: "Variados e típicos" }] },
    { id: "brincar", label: "Padrão de Brincar", type: "radio-group", options: [{ value: "simbolico", label: "Simbólico/Faz de conta" }, { value: "funcional", label: "Funcional (usa brinquedo para sua função)" }, { value: "repetitivo", label: "Repetitivo/Não funcional (enfileirar, girar, focar em partes)" }] },
    { id: "flexibilidade", label: "Flexibilidade e Adesão a Rotinas", type: "checkbox-group", options: [{ value: "resistencia_mudanca", label: "Sofrimento intenso com pequenas mudanças" }, { value: "necessidade_rotina", label: "Forte necessidade de seguir a mesma rotina" }, { value: "rituais", label: "Presença de rituais (verbais ou não-verbais)" }, { value: "rigidez_pensamento", label: "Rigidez de pensamento/dificuldade com transições" }] },
    { id: "headerSensorial", label: "Processamento Sensorial", type: "section-header" },
    { id: "perfilSensorial", label: "Reações a Estímulos Sensoriais", type: "textarea", placeholder: "Descreva reações incomuns a sons, toques, luzes, cheiros, sabores, texturas, dor e temperatura. (Ex: cobre os ouvidos, seletividade alimentar, fascínio por luzes)." },
    { id: "buscaEvitacao", label: "Busca ou Evitação Sensorial", type: "checkbox-group", options: [{ value: "busca_movimento", label: "Busca excessiva por movimento (pular, girar)" }, { value: "evita_movimento", label: "Evita parquinhos, balanços" }, { value: "busca_toque", label: "Busca toque/pressão (abraços fortes)" }, { value: "evita_toque", label: "Evita toque, se sujar, certas roupas" }] },
    { id: "headerEmocional", label: "Aspectos Emocionais e Comportamentais", type: "section-header" },
    { id: "regulacaoEmocional", label: "Regulação Emocional", type: "textarea", placeholder: "Como lida com frustrações? Consegue se acalmar após uma crise? Quais estratégias de regulação utiliza?" },
    { id: "comportamentosDesafiadores", label: "Comportamentos Desafiadores", type: "checkbox-group", options: [{ value: "birras_intensas", label: "Birras intensas e frequentes" }, { value: "agressividade", label: "Agressividade (com outros/objetos)" }, { value: "auto_lesao", label: "Comportamentos autolesivos" }, { value: "oposicao", label: "Oposição/Desafio" }] },
    { id: "humorAfeto", label: "Humor e Afeto", type: "textarea", placeholder: "Descreva o humor predominante. Presença de ansiedade, medos, tristeza, irritabilidade. O afeto é congruente com a situação?" },
    { id: "headerEscolar", label: "Histórico Escolar e de Aprendizagem", type: "section-header" },
    { id: "adaptacaoEscolar", label: "Adaptação e Trajetória Escolar", type: "textarea", placeholder: "Com que idade iniciou a escola? Como foi a adaptação? Houve trocas de escola? Por quê?" },
    { id: "relacionamentoEscolar", label: "Relacionamento na Escola", type: "textarea", placeholder: "Como se relaciona com professores e colegas? Participa de atividades em grupo? Há relatos de bullying?" },
    { id: "desempenhoAcademico", label: "Desempenho Acadêmico", type: "textarea", placeholder: "Apresenta dificuldades de aprendizagem específicas? Quais são seus pontos fortes? Necessita de adaptações ou suporte (mediador, PEI)?" },
    { id: "headerFamiliar", label: "Dinâmica Familiar e Social", type: "section-header" },
    { id: "composicaoFamiliar", label: "Composição Familiar", type: "textarea", placeholder: "Com quem a criança mora? Descreva a dinâmica familiar, relacionamento entre os membros." },
    { id: "redeApoio", label: "Rede de Apoio", type: "textarea", placeholder: "A família conta com apoio de outros familiares, amigos, comunidade? A criança participa de atividades sociais fora da escola/terapias?" },
    { id: "historicoFamiliar", label: "Histórico Familiar", type: "textarea", placeholder: "Há casos de TEA, outros transtornos do neurodesenvolvimento ou transtornos psiquiátricos na família?" },
    { id: "headerIntervencoes", label: "Avaliações e Intervenções Anteriores", type: "section-header" },
    { id: "avaliacoesAnteriores", label: "Avaliações Anteriores", type: "textarea", placeholder: "Já passou por avaliação com outros profissionais (neurologista, fonoaudiólogo, etc.)? Quais foram os resultados/diagnósticos?" },
    { id: "terapiasPrevias", label: "Terapias Prévias ou Atuais", type: "textarea", placeholder: "Quais terapias já realizou ou realiza? Qual a frequência e por quanto tempo? Quais foram os resultados observados?" },
  ],
  "Fonoaudiologia": [
    { id: "queixaPrincipalFono", label: "Queixa Principal Fonoaudiológica", type: "textarea", placeholder: "Descreva a queixa principal da família, quem encaminhou e por quê (atraso de fala, dificuldades de comunicação, seletividade alimentar, etc.)." },
    { id: "headerSaudeAuditiva", label: "Histórico de Saúde e Auditivo", type: "section-header" },
    { id: "historicoSaudeGeral", label: "Histórico de Saúde Geral", type: "textarea", placeholder: "Doenças crônicas, alergias, internações, medicações em uso. Histórico de otites de repetição." },
    { id: "examesAuditivos", label: "Exames Auditivos", type: "checkbox-group", options: [{ value: "triagem_neonatal_ok", label: "Triagem auditiva neonatal normal" }, { value: "bera_realizado", label: "Realizou BERA/PEATE" }, { value: "audiometria_realizada", label: "Realizou audiometria" }, { value: "exames_alterados", label: "Algum exame apresentou alteração" }] },
    { id: "comportamentoAuditivo", label: "Comportamento Auditivo", type: "radio-group", options: [{ value: "hiper", label: "Hipersensibilidade a sons (cobre os ouvidos)" }, { value: "hipo", label: "Hipossensibilidade (parece não escutar)" }, { value: "normal", label: "Comportamento auditivo típico" }] },
    { id: "headerComunicacaoPreVerbal", label: "Desenvolvimento da Comunicação Pré-Verbal", type: "section-header" },
    { id: "contatoVisual", label: "Contato Visual", type: "radio-group", options: [{ value: "sustentado", label: "Sustentado" }, { value: "fugaz", label: "Fugaz/Inconsistente" }, { value: "ausente", label: "Ausente" }] },
    { id: "atencaoCompartilhada", label: "Atenção Compartilhada", type: "checkbox-group", options: [{ value: "aponta_pedir", label: "Aponta para pedir" }, { value: "aponta_mostrar", label: "Aponta para mostrar/comentar" }, { value: "segue_olhar", label: "Segue o olhar/gesto do outro" }, { value: "dificuldade", label: "Apresenta dificuldade" }] },
    { id: "usoGestos", label: "Uso de Gestos Comunicativos", type: "checkbox-group", options: [{ value: "dar_tchau", label: "Dar tchau" }, { value: "mandar_beijo", label: "Mandar beijo" }, { value: "sim_nao_cabeca", label: "Sim/Não com a cabeça" }, { value: "uso_limitado", label: "Uso limitado ou ausente" }] },
    { id: "balbucio", label: "Balbucio", type: "radio-group", options: [{ value: "presente_variado", label: "Presente e variado (ex: 'mamama', 'babada')" }, { value: "presente_restrito", label: "Presente mas restrito a poucos sons" }, { value: "ausente", label: "Ausente ou muito raro" }] },
    { id: "headerLinguagemReceptiva", label: "Linguagem Receptiva (Compreensão)", type: "section-header" },
    { id: "compreensaoComandos", label: "Compreensão de Comandos", type: "radio-group", options: [{ value: "simples_contexto", label: "Comandos simples com apoio de gestos/contexto" }, { value: "simples_sem_contexto", label: "Comandos simples sem apoio" }, { value: "complexos", label: "Comandos com 2 ou mais ações" }, { value: "dificuldade", label: "Dificuldade significativa" }] },
    { id: "compreensaoPerguntas", label: "Compreensão de Perguntas", type: "checkbox-group", options: [{ value: "sim_nao", label: "Responde a perguntas de 'sim/não'" }, { value: "o_que", label: "Responde a 'O que é isso?'" }, { value: "quem", label: "Responde a 'Quem?'" }, { value: "onde", label: "Responde a 'Onde?'" }, { value: "por_que", label: "Dificuldade com 'Por quê?' e 'Como?'" }] },
    { id: "compreensaoVocabulario", label: "Compreensão de Vocabulário", type: "textarea", placeholder: "Identifica partes do corpo, objetos, figuras? Compreende conceitos (grande/pequeno, dentro/fora)?" },
    { id: "headerLinguagemExpressiva", label: "Linguagem Expressiva (Fala)", type: "section-header" },
    { id: "nivelExpressao", label: "Nível de Expressão", type: "radio-group", options: [{ value: "nao_verbal", label: "Não-verbal" }, { value: "vocalizacoes", label: "Vocalizações/Jargão" }, { value: "palavras_isoladas", label: "Palavras isoladas" }, { value: "frases_2_palavras", label: "Frases de 2 palavras" }, { value: "frases_3_mais_palavras", label: "Frases com 3 ou mais palavras" }] },
    { id: "articulacao", label: "Articulação dos Sons da Fala", type: "textarea", placeholder: "A fala é inteligível para familiares? E para estranhos? Há trocas de sons?" },
    { id: "caracteristicasFala", label: "Características da Fala (Foco em TEA)", type: "checkbox-group", options: [{ value: "ecolalia_imediata", label: "Ecolalia Imediata" }, { value: "ecolalia_tardia", label: "Ecolalia Tardia (frases de desenhos, etc.)" }, { value: "inversao_pronominal", label: "Inversão pronominal ('você quer' ao invés de 'eu quero')" }, { value: "prosodia_atipica", label: "Prosódia atípica (monótona, cantada, robotizada)" }, { value: "fala_script", label: "Uso de 'scripts' ou frases decoradas" }] },
    { id: "headerPragmatica", label: "Pragmática (Uso Social da Linguagem)", type: "section-header" },
    { id: "funcoesComunicativas", label: "Funções da Comunicação", type: "checkbox-group", options: [{ value: "pedidos", label: "Usa a comunicação principalmente para pedir" }, { value: "protestos", label: "Para protestar/recusar" }, { value: "comentarios", label: "Para comentar/mostrar" }, { value: "perguntas", label: "Para fazer perguntas" }, { value: "funcoes_restritas", label: "Funções comunicativas restritas" }] },
    { id: "habilidadesConversacionais", label: "Habilidades Conversacionais", type: "checkbox-group", options: [{ value: "inicia_comunicacao", label: "Inicia a comunicação" }, { value: "mantem_turnos", label: "Mantém turnos na conversa" }, { value: "mantem_topico", label: "Mantém-se no tópico" }, { value: "dificuldade_iniciar_manter", label: "Dificuldade em iniciar ou manter conversas" }] },
    { id: "headerAlimentacao", label: "Sistema Sensório-Motor-Oral e Alimentação", type: "section-header" },
    { id: "historicoAlimentar", label: "Histórico Alimentar", type: "textarea", placeholder: "Como foi a transição para sólidos? Aceitação de diferentes texturas." },
    { id: "seletividadeAlimentar", label: "Seletividade Alimentar", type: "checkbox-group", options: [{ value: "restricao_textura", label: "Restrição por textura (só pastoso, só crocante)" }, { value: "restricao_cor", label: "Restrição por cor/aparência" }, { value: "restricao_grupo", label: "Restrição por grupo alimentar (não come frutas, etc.)" }, { value: "recusa_novos", label: "Recusa experimentar novos alimentos" }] },
    { id: "habilidadesMotorasOrais", label: "Habilidades Motoras Orais", type: "checkbox-group", options: [{ value: "dificuldade_mastigacao", label: "Dificuldade na mastigação" }, { value: "engasgos_frequentes", label: "Engasgos frequentes" }, { value: "baba_excessiva", label: "Baba excessiva" }, { value: "respirador_oral", label: "É respirador oral" }, { value: "bruxismo", label: "Range os dentes (bruxismo)" }] },
    { id: "headerPreAcademicas", label: "Habilidades Pré-Acadêmicas", type: "section-header" },
    { id: "interesseLetras", label: "Interesse por Material Escrito", type: "radio-group", options: [{ value: "interesse_livros", label: "Demonstra interesse por livros e figuras" }, { value: "reconhece_letras", label: "Reconhece letras/números (hiperlexia?)" }, { value: "pouco_interesse", label: "Pouco interesse" }] },
    { id: "observacoesFono", label: "Intervenções Anteriores e Observações Adicionais", type: "textarea", placeholder: "Já realizou terapia fonoaudiológica? Uso de Comunicação Alternativa (CAA)? Outras informações relevantes." },
  ],
  "Terapia Ocupacional": [
    { id: "queixaPrincipalTO", label: "Queixa Principal / Demanda para TO", type: "textarea", placeholder: "Descreva as principais dificuldades da criança nas atividades diárias (autocuidado, brincar, escola)." },
    { id: "rotinaDiaria", label: "Rotina Diária", type: "textarea", placeholder: "Descreva um dia típico da criança, desde o acordar até a hora de dormir." },
    { id: "headerAVDs", label: "Áreas de Ocupação: Atividades de Vida Diária (AVDs)", type: "section-header" },
    { id: "avdAlimentacao", label: "Alimentação", type: "radio-group", options: [{ value: "independente", label: "Independente (usa talheres, come sozinho)" }, { value: "ajuda_parcial", label: "Necessita de ajuda parcial/supervisão" }, { value: "dependente", label: "Dependente" }] },
    { id: "avdVestuario", label: "Vestuário", type: "radio-group", options: [{ value: "independente", label: "Independente (veste/despe, amarra sapatos)" }, { value: "ajuda_parcial", label: "Necessita de ajuda parcial (botões, zíperes)" }, { value: "dependente", label: "Dependente" }] },
    { id: "avdHigiene", label: "Higiene Pessoal", type: "radio-group", options: [{ value: "independente", label: "Independente (escova dentes, usa banheiro, lava mãos)" }, { value: "ajuda_parcial", label: "Necessita de ajuda parcial/lembretes" }, { value: "dependente", label: "Dependente" }] },
    { id: "avdSono", label: "Sono", type: "textarea", placeholder: "Como é a rotina de sono? Apresenta dificuldades para adormecer, despertares, etc.?" },
    { id: "headerSensorial", label: "Processamento Sensorial e Regulação", type: "section-header" },
    { id: "perfilSensorialGeral", label: "Padrão Geral de Reação Sensorial", type: "radio-group", options: [{ value: "busca_sensorial", label: "Busca Sensorial (movimento constante, toca em tudo)" }, { value: "evitacao_sensorial", label: "Evitação Sensorial (resiste a estímulos)" }, { value: "baixa_responsividade", label: "Baixa Responsividade (parece não notar estímulos)" }, { value: "misto", label: "Padrão Misto" }] },
    { id: "detalhesSensoriais", label: "Detalhes do Perfil Sensorial", type: "textarea", placeholder: "Descreva comportamentos específicos relacionados a cada sistema: Tátil (toques, texturas), Vestibular/Proprioceptivo (movimento, equilíbrio, força), Auditivo (sons), Visual (luzes), Oral (sabores, texturas)." },
    { id: "nivelAlerta", label: "Nível de Alerta e Regulação", type: "textarea", placeholder: "A criança parece estar frequentemente 'ligada no 220v' ou mais 'devagar'? Como ela se acalma quando está agitada ou chateada?" },
    { id: "headerMotor", label: "Habilidades de Desempenho: Motoras e Práxis", type: "section-header" },
    { id: "coordMotoraFina", label: "Coordenação Motora Fina", type: "checkbox-group", options: [{ value: "dificuldade_lapis", label: "Dificuldade na preensão do lápis" }, { value: "dificuldade_tesoura", label: "Dificuldade com tesoura" }, { value: "dificuldade_manipulacao", label: "Dificuldade em manipular objetos pequenos" }, { value: "dificuldade_botoes", label: "Dificuldade com botões/zíperes" }] },
    { id: "coordMotoraGrossa", label: "Coordenação Motora Grossa", type: "checkbox-group", options: [{ value: "desajeitado", label: "Parece 'desajeitado', esbarra nas coisas" }, { value: "dificuldade_esportes", label: "Dificuldade em esportes (correr, pular, chutar bola)" }, { value: "equilibrio_pobre", label: "Equilíbrio pobre, quedas frequentes" }] },
    { id: "praxis", label: "Praxis (Planejamento Motor)", type: "textarea", placeholder: "A criança tem dificuldade em aprender novas tarefas motoras (ex: andar de bicicleta, amarrar sapatos)? Consegue imitar gestos e sequências de movimentos?" },
    { id: "habilidadesGrafomotoras", label: "Habilidades Grafomotoras", type: "textarea", placeholder: "Como é a escrita/desenho? A caligrafia é legível? Respeita os limites da folha?" },
    { id: "headerBrincar", label: "Áreas de Ocupação: Brincar, Lazer e Participação Social", type: "section-header" },
    { id: "tipoBrincar", label: "Tipo de Brincar Predominante", type: "radio-group", options: [{ value: "simbolico", label: "Simbólico/Faz de conta" }, { value: "exploratorio", label: "Exploratório/Funcional" }, { value: "repetitivo", label: "Repetitivo/Restrito (enfileirar, girar)" }] },
    { id: "interessesBrinquedos", label: "Interesses e Brinquedos Favoritos", type: "textarea", placeholder: "Quais são os interesses da criança? Com o que ela mais gosta de brincar?" },
    { id: "participacaoSocial", label: "Participação Social", type: "textarea", placeholder: "Como é a interação com outras crianças no brincar? Inicia a brincadeira, aceita regras, compartilha brinquedos?" },
    { id: "headerEscolar", label: "Áreas de Ocupação: Educação", type: "section-header" },
    { id: "desafiosEscolares", label: "Principais Desafios Escolares", type: "checkbox-group", options: [{ value: "caligrafia", label: "Caligrafia" }, { value: "organizacao", label: "Organização (material, mesa)" }, { value: "atencao", label: "Atenção e permanência na tarefa" }, { value: "interacao_social", label: "Interação social com colegas" }, { value: "cortar_colar", label: "Atividades de cortar e colar" }] },
    { id: "headerFuncoesExecutivas", label: "Funções Executivas", type: "section-header" },
    { id: "desafiosExecutivos", label: "Dificuldades Observadas", type: "checkbox-group", options: [{ value: "planejamento", label: "Planejar e sequenciar tarefas" }, { value: "organizacao", label: "Organizar-se no tempo e espaço" }, { value: "iniciar_finalizar_tarefas", label: "Iniciar e/ou finalizar tarefas" }, { value: "flexibilidade_cognitiva", label: "Flexibilidade para mudar de plano" }, { value: "controle_inibitorio", label: "Controle de impulsos" }] },
    { id: "observacoesTO", label: "Observações Adicionais", type: "textarea", placeholder: "Adaptações já utilizadas, pontos fortes da criança, expectativas da família, etc." },
  ],
  "Psicomotricidade": [
    { id: "queixaPrincipalPsicomotora", label: "Queixa Principal e Histórico da Demanda", type: "textarea", placeholder: "Descreva a queixa principal (agitação, inibição, descoordenação, etc.), quem encaminhou e por quê." },
    { id: "historicoMotor", label: "Histórico do Desenvolvimento Motor", type: "textarea", placeholder: "Como foi o desenvolvimento motor? (Sustentou a cabeça, sentou, engatinhou, andou). Houve atrasos? Quedas frequentes?" },
    { id: "headerFuncaoTonica", label: "Função Tônica", type: "section-header" },
    { id: "tonusMuscular", label: "Tônus Muscular de Base", type: "radio-group", options: [{ value: "hipotonia", label: "Hipotonia (musculatura 'mole')" }, { value: "hipertonia", label: "Hipertonia (musculatura 'rígida')" }, { value: "normotonia", label: "Normotonia (adequado)" }, { value: "flutuante", label: "Flutuante/Variável" }] },
    { id: "dialogoTonico", label: "Diálogo Tônico", type: "textarea", placeholder: "Como a criança reage ao ser segurada no colo, ao toque? Busca ou evita contato físico? Consegue se acalmar?" },
    { id: "paratonias", label: "Paratonias", type: "radio-group", options: [{ value: "presente", label: "Presente (dificuldade em relaxar um membro passivamente)" }, { value: "ausente", label: "Ausente" }, { value: "nao_observado", label: "Não observado" }] },
    { id: "headerEquilibracao", label: "Equilibração", type: "section-header" },
    { id: "equilibrioEstatico", label: "Equilíbrio Estático", type: "textarea", placeholder: "Consegue ficar em um pé só? Por quanto tempo? Apresenta muitas oscilações?" },
    { id: "equilibrioDinamico", label: "Equilíbrio Dinâmico", type: "textarea", placeholder: "Como é ao andar em linha reta, pular, correr? Demonstra segurança ou medo em atividades que desafiam o equilíbrio (ex: parquinho)?" },
    { id: "headerEsquemaImagemCorporal", label: "Esquema e Imagem Corporal", type: "section-header" },
    { id: "conscienciaCorporal", label: "Consciência Corporal", type: "checkbox-group", options: [{ value: "nomeia_partes", label: "Nomeia partes do corpo em si e no outro" }, { value: "localiza_partes", label: "Localiza partes do corpo ao comando" }, { value: "imita_posturas", label: "Imita posturas e gestos" }, { value: "dificuldades", label: "Apresenta dificuldades" }] },
    { id: "percepcaoCorpoEspaco", label: "Percepção do Corpo no Espaço", type: "radio-group", options: [{ value: "adequada", label: "Adequada" }, { value: "desajeitado", label: "Parece 'desajeitado', esbarra em objetos/pessoas" }] },
    { id: "headerLateralidade", label: "Lateralidade", type: "section-header" },
    { id: "dominanciaManual", label: "Dominância Manual", type: "radio-group", options: [{ value: "destro", label: "Destro" }, { value: "canhoto", label: "Canhoto" }, { value: "ambidestro", label: "Ambidestro" }, { value: "nao_definida", label: "Não definida/Usa ambas as mãos" }] },
    { id: "dominanciaOcularPodal", label: "Dominância Ocular e Podal", type: "textarea", placeholder: "Já foi observado qual olho usa para espiar e qual pé usa para chutar?" },
    { id: "conhecimentoDireitaEsquerda", label: "Conhecimento Direita/Esquerda", type: "radio-group", options: [{ value: "adquirido_si", label: "Adquirido em si mesmo" }, { value: "adquirido_outro", label: "Adquirido no outro" }, { value: "em_desenvolvimento", label: "Em desenvolvimento" }, { value: "nao_adquirido", label: "Não adquirido" }] },
    { id: "headerEstruturacaoEspacoTemporal", label: "Estruturação Espaço-Temporal", type: "section-header" },
    { id: "nocoesEspaciais", label: "Noções Espaciais", type: "checkbox-group", options: [{ value: "compreende_em_cima_embaixo", label: "Compreende em cima/embaixo, dentro/fora" }, { value: "compreende_perto_longe", label: "Compreende perto/longe, frente/atrás" }, { value: "dificuldade_organizacao", label: "Dificuldade em organizar-se no espaço (ex: na folha, na sala)" }] },
    { id: "nocoesTemporais", label: "Noções Temporais", type: "checkbox-group", options: [{ value: "compreende_antes_depois", label: "Compreende antes/depois" }, { value: "compreende_rapido_lento", label: "Compreende rápido/lento" }, { value: "dificuldade_sequencia", label: "Dificuldade em sequenciar eventos de uma história" }] },
    { id: "headerPraxiaGlobal", label: "Praxia Global (Coordenação Motora Ampla)", type: "section-header" },
    { id: "dissociacaoMovimentos", label: "Dissociação de Movimentos", type: "textarea", placeholder: "Consegue mover braços e pernas de forma independente e coordenada (ex: pular e bater palmas)?" },
    { id: "coordenacaoOculoManualPodal", label: "Coordenação Óculo-Manual e Óculo-Podal", type: "textarea", placeholder: "Como é para arremessar/pegar uma bola? E para chutar?" },
    { id: "marchaCorrida", label: "Marcha e Corrida", type: "textarea", placeholder: "A marcha é coordenada? A corrida é fluida? Há presença de sincinesias (movimentos involuntários associados)?" },
    { id: "headerPraxiaFina", label: "Praxia Fina (Coordenação Motora Fina)", type: "section-header" },
    { id: "habilidadesManuais", label: "Habilidades Manuais", type: "checkbox-group", options: [{ value: "rasga_amassa_papel", label: "Rasga e amassa papel" }, { value: "usa_tesoura", label: "Usa tesoura com/sem auxílio" }, { value: "abotoa_desabotoa", label: "Abotoa/Desabotoa" }, { value: "amarra_lacos", label: "Amarra laços" }, { value: "movimento_pinca", label: "Realiza movimento de pinça" }] },
    { id: "headerGrafomotricidade", label: "Grafomotricidade", type: "section-header" },
    { id: "preensaoLapis", label: "Preensão do Lápis", type: "radio-group", options: [{ value: "adequada", label: "Adequada" }, { value: "inadequada", label: "Inadequada (muita/pouca força, posição incorreta)" }] },
    { id: "qualidadeTraco", label: "Qualidade do Traço", type: "textarea", placeholder: "O traço é contínuo, tremido, forte, fraco? Consegue copiar formas geométricas simples?" },
    { id: "headerRitmo", label: "Ritmo", type: "section-header" },
    { id: "percepcaoReproducaoRitmo", label: "Percepção e Reprodução de Ritmo", type: "textarea", placeholder: "Consegue acompanhar o ritmo de uma música com o corpo? Consegue reproduzir sequências rítmicas simples (palmas)?" },
    { id: "headerAspectosRelacionais", label: "Aspectos Relacionais e Comportamentais", type: "section-header" },
    { id: "comportamentoMotor", label: "Comportamento Motor Predominante", type: "radio-group", options: [{ value: "inibicao", label: "Inibição (pouca exploração, medo do movimento)" }, { value: "instabilidade", label: "Instabilidade (agitação, não para, busca constante por movimento)" }, { value: "adequado", label: "Adequado à situação" }] },
    { id: "interacaoTerapeuta", label: "Interação com o Terapeuta e no Brincar", type: "textarea", placeholder: "Como estabelece contato (visual, corporal)? Como lida com regras e frustrações nas atividades motoras?" },
  ],
  "Psicopedagogia": [
    { id: "queixaPrincipalPp", label: "Queixa Principal e Histórico da Demanda de Aprendizagem", type: "textarea", placeholder: "Descreva a queixa escolar/familiar, dificuldades específicas (alfabetização, matemática), desatenção, falta de interesse, quem encaminhou e por quê." },
    { id: "historicoEscolar", label: "Histórico Escolar e Relação com a Aprendizagem", type: "textarea", placeholder: "Trajetória escolar (trocas de escola, adaptação), relação com professores e colegas, como o paciente se vê como aprendiz, o que gosta/não gosta na escola." },
    { id: "suporteEscolar", label: "Suportes e Adaptações Escolares", type: "checkbox-group", options: [{ value: "mediador", label: "Mediador em sala" }, { value: "pei", label: "PEI (Plano de Ensino Individualizado)" }, { value: "adaptacoes_curriculares", label: "Adaptações curriculares" }, { value: "adaptacoes_avaliacao", label: "Adaptações de avaliação" }, { value: "reforco_escolar", label: "Reforço escolar" }, { value: "nenhum", label: "Nenhum suporte específico" }] },
    { id: "headerProcessosCognitivos", label: "Processos Cognitivos e Funções Executivas (Foco em TEA)", type: "section-header" },
    { id: "atencao", label: "Atenção", type: "textarea", placeholder: "Como é a atenção sustentada? Distrai-se facilmente com estímulos externos? Apresenta hiperfoco em temas de interesse?" },
    { id: "memoria", label: "Memória", type: "textarea", placeholder: "Boa memória para fatos ou detalhes específicos (memória de longo prazo)? Dificuldade em reter informações novas ou instruções (memória de trabalho)?" },
    { id: "funcoesExecutivas", label: "Funções Executivas", type: "checkbox-group", options: [{ value: "dificuldade_planejamento", label: "Dificuldade em planejar e sequenciar tarefas" }, { value: "dificuldade_organizacao", label: "Dificuldade com organização (material, tempo, ideias)" }, { value: "dificuldade_iniciativa", label: "Dificuldade em iniciar tarefas" }, { value: "dificuldade_monitoramento", label: "Dificuldade em monitorar o próprio desempenho e corrigir erros" }] },
    { id: "flexibilidadeCognitiva", label: "Flexibilidade Cognitiva", type: "radio-group", options: [{ value: "dificuldade_mudancas", label: "Dificuldade em lidar com mudanças na rotina ou na forma de fazer uma atividade" }, { value: "pensamento_rigido", label: "Pensamento rígido, dificuldade em ver outras perspectivas" }, { value: "flexivel", label: "Demonstra flexibilidade" }] },
    { id: "teoriaMente", label: "Teoria da Mente / Cognição Social", type: "textarea", placeholder: "Compreende as intenções, pensamentos e sentimentos dos outros? Dificuldade em trabalhos em grupo por não entender o ponto de vista do colega?" },
    { id: "coerenciaCentral", label: "Coerência Central", type: "radio-group", options: [{ value: "foco_detalhes", label: "Foco excessivo em detalhes, perdendo a ideia principal de um texto ou explicação" }, { value: "boa_visao_geral", label: "Consegue ter uma boa visão geral do contexto" }] },
    { id: "headerHabilidadesAcademicas", label: "Habilidades Acadêmicas Instrumentais (Foco em TEA)", type: "section-header" },
    { id: "leitura", label: "Leitura", type: "checkbox-group", options: [{ value: "hiperlexia", label: "Hiperlexia (decodifica palavras bem, mas com baixa compreensão)" }, { value: "dificuldade_compreensao", label: "Dificuldade na compreensão literal" }, { value: "dificuldade_inferencia", label: "Dificuldade em fazer inferências ('ler nas entrelinhas')" }, { value: "dificuldade_linguagem_figurada", label: "Dificuldade com linguagem figurada (metáforas, expressões idiomáticas)" }] },
    { id: "escrita", label: "Escrita", type: "checkbox-group", options: [{ value: "dificuldade_grafomotora", label: "Dificuldade grafomotora (letra ilegível, cansaço ao escrever)" }, { value: "dificuldade_organizacao_texto", label: "Dificuldade em organizar ideias no texto" }, { value: "erros_ortograficos", label: "Erros ortográficos e gramaticais persistentes" }, { value: "escrita_descritiva_literal", label: "Escrita muito descritiva e literal, com pouca subjetividade" }] },
    { id: "matematica", label: "Matemática", type: "checkbox-group", options: [{ value: "dificuldade_calculo", label: "Dificuldade com cálculo mental ou armado" }, { value: "dificuldade_resolucao_problemas", label: "Dificuldade na interpretação e resolução de problemas" }, { value: "dificuldade_conceitos_abstratos", label: "Dificuldade com conceitos matemáticos abstratos" }, { value: "habilidade_calculo", label: "Habilidade acima da média para cálculo (hipercalculia?)" }] },
    { id: "headerAspectosComportamentais", label: "Aspectos Comportamentais e Emocionais na Aprendizagem", type: "section-header" },
    { id: "motivacaoInteresses", label: "Motivação e Interesses", type: "textarea", placeholder: "O que motiva o paciente a aprender? Os hiperfocos são utilizados como porta de entrada para outros conteúdos?" },
    { id: "reacaoErroFrustracao", label: "Reação ao Erro e à Frustração", type: "radio-group", options: [{ value: "desiste_facil", label: "Desiste facilmente" }, { value: "crises_comportamentais", label: "Apresenta crises (choro, raiva)" }, { value: "persevera", label: "Persevera e busca ajuda" }, { value: "indiferente", label: "Mostra-se indiferente" }] },
    { id: "ansiedadeDesempenho", label: "Ansiedade de Desempenho", type: "textarea", placeholder: "Demonstra ansiedade excessiva antes ou durante avaliações e tarefas? Apresenta comportamentos de esquiva?" },
    { id: "headerEstiloAprendizagem", label: "Estilo de Aprendizagem e Pontos Fortes", type: "section-header" },
    { id: "estiloAprendizagem", label: "Estilo de Aprendizagem Preferencial", type: "checkbox-group", options: [{ value: "visual", label: "Visual (aprende melhor com imagens, gráficos, vídeos)" }, { value: "auditivo", label: "Auditivo (aprende melhor ouvindo explicações)" }, { value: "cinestesico", label: "Cinestésico (aprende melhor fazendo, experimentando)" }] },
    { id: "pontosFortes", label: "Pontos Fortes Observados", type: "textarea", placeholder: "Quais são as habilidades e talentos do paciente? (Ex: memória visual, reconhecimento de padrões, sinceridade, conhecimento aprofundado em áreas de interesse)." },
  ],
  "Musicoterapia": [
    { id: "demandaMusicoterapia", label: "Demanda para Musicoterapia", type: "textarea", placeholder: "Objetivos: ampliar comunicação, promover interação, regulação emocional, integração sensorial..." },
    { id: "headerPerfilSonoro", label: "Histórico Sonoro-Musical e Perfil Sensorial", type: "section-header" },
    { id: "sensibilidadeAuditiva", label: "Sensibilidade Auditiva", type: "radio-group", options: [{ value: "hipersensivel", label: "Hipersensível (cobre ouvidos, se assusta com sons)" }, { value: "hipossensivel", label: "Hipossensível (parece não ouvir, busca sons altos)" }, { value: "tipica", label: "Típica/Variável" }] },
    { id: "reacoesSonsAmbiente", label: "Reações a Sons do Ambiente (ex: liquidificador, latidos)", type: "checkbox-group", options: [{ value: "ansiedade", label: "Ansiedade/Medo" }, { value: "irritabilidade", label: "Irritabilidade" }, { value: "fascinio", label: "Fascínio" }, { value: "indiferenca", label: "Indiferença" }] },
    { id: "preferenciasMusicais", label: "Preferências Musicais", type: "checkbox-group", options: [{ value: "musicas_infantis", label: "Músicas infantis" }, { value: "musica_classica", label: "Música clássica" }, { value: "pop_rock", label: "Pop/Rock" }, { value: "mpb", label: "MPB" }, { value: "instrumental", label: "Instrumental" }, { value: "sem_preferencia", label: "Não demonstra preferência clara" }] },
    { id: "experienciasMusicaisPrevias", label: "Experiências Musicais Prévias", type: "radio-group", options: [{ value: "nenhuma", label: "Nenhuma" }, { value: "aulas_musica", label: "Aulas de música (instrumento/canto)" }, { value: "musicalizacao_infantil", label: "Musicalização infantil" }] },
    { id: "headerRespostasMusica", label: "Respostas e Comportamentos no Contexto Sonoro-Musical", type: "section-header" },
    { id: "reacoesComportamentais", label: "Reações Comportamentais à Música", type: "checkbox-group", options: [{ value: "acalma", label: "Acalma/Relaxa" }, { value: "agita", label: "Agita/Desorganiza" }, { value: "organiza", label: "Organiza/Estrutura o comportamento" }, { value: "foca_atencao", label: "Aumenta o foco e a atenção" }, { value: "dispersa", label: "Dispersa" }] },
    { id: "respostasMotoras", label: "Respostas Físicas/Motoras", type: "checkbox-group", options: [{ value: "balanca_corpo", label: "Balança o corpo no ritmo" }, { value: "bate_palmas", label: "Bate palmas ou pés" }, { value: "estereotipias", label: "Aumenta/diminui estereotipias" }, { value: "danca_livre", label: "Dança ou se movimenta livremente" }] },
    { id: "respostasVocais", label: "Respostas Vocais/Verbais", type: "checkbox-group", options: [{ value: "vocaliza_espontaneamente", label: "Vocaliza espontaneamente" }, { value: "canta_junto", label: "Canta junto (melodia e/ou letra)" }, { value: "ecolalia_musical", label: "Ecolalia musical (repete trechos)" }, { value: "silencio", label: "Permanece em silêncio" }] },
    { id: "headerInteracaoComunicacao", label: "Interação e Comunicação Musical", type: "section-header" },
    { id: "exploracaoInstrumentos", label: "Exploração de Instrumentos", type: "radio-group", options: [{ value: "variada", label: "Explora de forma variada e funcional" }, { value: "repetitiva", label: "Exploração repetitiva/sensorial" }, { value: "restrita", label: "Restrita a poucos instrumentos" }, { value: "nao_explora", label: "Não explora/Resiste" }] },
    { id: "dialogoMusical", label: "Diálogo Musical (Improvisação)", type: "checkbox-group", options: [{ value: "imita_ritmos", label: "Imita ritmos/melodias" }, { value: "responde_estimulos", label: "Responde a estímulos sonoros" }, { value: "inicia_interacao", label: "Inicia interação sonora" }, { value: "mantem_trocas", label: "Mantém trocas sonoras (turnos)" }] },
    { id: "headerCognitivoAfetivo", label: "Aspectos Cognitivos e Afetivos na Música", type: "section-header" },
    { id: "atencaoFoco", label: "Atenção e Foco", type: "radio-group", options: [{ value: "aumenta", label: "A música aumenta o tempo de atenção" }, { value: "diminui", label: "A música diminui a atenção" }, { value: "indiferente", label: "Indiferente" }] },
    { id: "expressaoEmocional", label: "Expressão Emocional", type: "checkbox-group", options: [{ value: "demonstra_alegria", label: "Demonstra alegria/excitação" }, { value: "demonstra_tristeza", label: "Demonstra tristeza/calma" }, { value: "expressa_raiva", label: "Expressa raiva/frustração com sons" }, { value: "dificuldade_expressar", label: "Dificuldade em expressar emoções" }] },
    { id: "memoriaMusical", label: "Memória Musical", type: "radio-group", options: [{ value: "reconhece_musicas", label: "Reconhece músicas familiares" }, { value: "aprende_facil", label: "Aprende novas canções com facilidade" }, { value: "dificuldade_reter", label: "Dificuldade em reter informações musicais" }] },
    { id: "observacoesMusicoterapia", label: "Observações Adicionais", type: "textarea", placeholder: "Descrever o ISO (Identidade Sonora) do paciente, se conhecido. Outras observações pertinentes..." },
  ],
  "Fisioterapia": [
    { id: "queixaPrincipalFisio", label: "Queixa Principal e Histórico Fisioterapêutico", type: "textarea", placeholder: "Descreva a queixa principal (hipotonia, marcha atípica, quedas frequentes), quem encaminhou e por quê." },
    { id: "historicoMotorFisio", label: "Histórico do Desenvolvimento Motor", type: "textarea", placeholder: "Descreva a aquisição dos marcos motores (sustentou cabeça, sentou, engatinhou, andou). Houve atrasos? Qual a qualidade desses movimentos?" },
    { id: "headerAvaliacaoPostural", label: "Avaliação Postural", type: "section-header" },
    { id: "posturaEstatica", label: "Postura Estática (Sentado e em Pé)", type: "textarea", placeholder: "Descreva alinhamento da cabeça, ombros, coluna e pelve. Presença de assimetrias, aumento de curvaturas (hiperlordose, cifose), etc." },
    { id: "posturaDinamica", label: "Postura Dinâmica", type: "textarea", placeholder: "Como a postura se mantém durante atividades como alcançar, agachar, brincar no chão?" },
    { id: "headerTonusForca", label: "Tônus Muscular e Força", type: "section-header" },
    { id: "tonusMuscular", label: "Tônus Muscular", type: "radio-group", options: [{ value: "hipotonia", label: "Hipotonia (geral ou localizada)" }, { value: "hipertonia", label: "Hipertonia (geral ou localizada)" }, { value: "normotonia", label: "Normotonia" }, { value: "flutuante", label: "Flutuante" }] },
    { id: "forcaMuscularFuncional", label: "Força Muscular Funcional", type: "textarea", placeholder: "Apresenta dificuldade para levantar do chão, subir escadas, empurrar/puxar objetos? Demonstra fraqueza em musculatura de tronco (core)?" },
    { id: "headerMarchaCorrida", label: "Padrão de Marcha e Corrida", type: "section-header" },
    { id: "caracteristicasMarcha", label: "Características da Marcha", type: "checkbox-group", options: [{ value: "ponta_pes", label: "Marcha na ponta dos pés (persistente)" }, { value: "base_alargada", label: "Base alargada" }, { value: "bracos_pouco_movimento", label: "Pouco movimento de braços" }, { value: "instavel_quedas", label: "Instável, com quedas frequentes" }, { value: "pe_plano", label: "Pé plano funcional" }] },
    { id: "caracteristicasCorrida", label: "Características da Corrida", type: "textarea", placeholder: "A corrida é coordenada? Há dissociação de cinturas (movimento alternado de braços e pernas)? Parece 'desajeitada' ou 'pesada'?" },
    { id: "headerCoordenacaoEquilibrioPraxis", label: "Coordenação, Equilíbrio e Práxis", type: "section-header" },
    { id: "coordenacaoMotoraAmpla", label: "Coordenação Motora Ampla", type: "textarea", placeholder: "Como é o desempenho em atividades como pular (com os dois pés, num pé só), arremessar e receber uma bola, chutar?" },
    { id: "equilibrio", label: "Equilíbrio (Estático e Dinâmico)", type: "textarea", placeholder: "Consegue ficar em um pé só? E em superfícies instáveis? Demonstra medo ou insegurança gravitacional (medo de altura, de tirar os pés do chão)?" },
    { id: "praxisPlanejamentoMotor", label: "Práxis (Planejamento Motor)", type: "textarea", placeholder: "Apresenta dificuldade em aprender novas habilidades motoras? Consegue imitar sequências de movimentos? Parece não saber como usar o corpo para realizar uma tarefa?" },
    { id: "headerPerfilSensorioMotor", label: "Perfil Sensório-Motor (Foco em TEA)", type: "section-header" },
    { id: "sistemaVestibular", label: "Sistema Vestibular (Movimento e Equilíbrio)", type: "checkbox-group", options: [{ value: "busca_movimento_intenso", label: "Busca movimento intenso (girar, pular, balançar-se excessivamente)" }, { value: "evita_movimento", label: "Evita parquinhos, balanços, escadas rolantes" }, { value: "inseguranca_gravitacional", label: "Insegurança gravitacional" }] },
    { id: "sistemaProprioceptivo", label: "Sistema Proprioceptivo (Consciência Corporal)", type: "checkbox-group", options: [{ value: "busca_pressao_profunda", label: "Busca pressão profunda (abraços apertados, deitar sob cobertas pesadas)" }, { value: "forca_desregulada", label: "Usa força de forma desregulada (muito forte/fraco)" }, { value: "parece_desajeitado", label: "Parece desajeitado, esbarra nas coisas" }] },
    { id: "headerFuncaoRespiratoria", label: "Função Respiratória", type: "section-header" },
    { id: "padraoRespiratorio", label: "Padrão Respiratório", type: "radio-group", options: [{ value: "toracico_superior", label: "Torácico superior/curto" }, { value: "diafragmatico", label: "Diafragmático/abdominal" }, { value: "misto", label: "Misto" }, { value: "apneias_frequentes", label: "Presença de apneias/prende a respiração" }] },
    { id: "headerResistenciaParticipacao", label: "Resistência e Participação", type: "section-header" },
    { id: "resistenciaFadiga", label: "Resistência e Fadiga", type: "textarea", placeholder: "Cansa-se facilmente em atividades motoras? Evita atividades que exigem esforço físico?" },
    { id: "participacaoAtividades", label: "Participação em Atividades Físicas", type: "textarea", placeholder: "Participa de aulas de educação física, esportes ou outras atividades de lazer que envolvem o corpo? Quais são as barreiras e facilitadores?" },
  ],
  "Nutrição": [
    { id: "queixaNutricional", label: "Queixa Principal Nutricional", type: "textarea", placeholder: "Seletividade alimentar extrema, recusa alimentar, problemas gastrointestinais, baixo peso..." },
    { id: "headerHistoricoAlimentar", label: "Histórico Alimentar Pregresso", type: "section-header" },
    { id: "aleitamentoMaterno", label: "Aleitamento Materno", type: "radio-group", options: [{ value: "exclusivo", label: "Exclusivo (até 6 meses)" }, { value: "misto", label: "Misto" }, { value: "formula", label: "Fórmula desde o início" }, { value: "nao_amamentado", label: "Não foi amamentado" }] },
    { id: "introducaoAlimentar", label: "Introdução Alimentar", type: "radio-group", options: [{ value: "adequada", label: "Adequada (aos 6 meses)" }, { value: "precoce", label: "Precoce (< 6 meses)" }, { value: "tardia", label: "Tardia (> 6 meses)" }] },
    { id: "dificuldadesIntroducao", label: "Dificuldades na Introdução Alimentar", type: "checkbox-group", options: [{ value: "recusa", label: "Recusa inicial" }, { value: "vomitos", label: "Vômitos/Gag reflex exacerbado" }, { value: "engasgos", label: "Engasgos frequentes" }, { value: "dificuldade_texturas", label: "Dificuldade na transição de texturas" }] },
    { id: "headerComportamentoRotina", label: "Comportamento e Rotina Alimentar Atual", type: "section-header" },
    { id: "ambienteRefeicoes", label: "Ambiente das Refeições", type: "checkbox-group", options: [{ value: "come_a_mesa", label: "Come à mesa" }, { value: "come_com_familia", label: "Come com a família" }, { value: "assiste_telas", label: "Assiste telas durante as refeições" }, { value: "ambiente_tranquilo", label: "Ambiente tranquilo" }, { value: "ambiente_agitado", label: "Ambiente agitado/com distrações" }] },
    { id: "comportamentoMesa", label: "Comportamento à Mesa", type: "checkbox-group", options: [{ value: "seletividade", label: "Seletividade/Recusa" }, { value: "rituais", label: "Rituais (separar alimentos, ordem específica)" }, { value: "come_rapido", label: "Come muito rápido" }, { value: "come_lento", label: "Come muito lento" }, { value: "levanta_da_mesa", label: "Levanta-se da mesa várias vezes" }] },
    { id: "headerPerfilSensorial", label: "Perfil Sensorial Alimentar Detalhado", type: "section-header" },
    { id: "sensorialVisual", label: "Visual", type: "checkbox-group", options: [{ value: "recusa_cor", label: "Recusa por cor" }, { value: "prefere_cores", label: "Prefere cores específicas" }, { value: "pratos_especificos", label: "Precisa de pratos/talheres específicos" }, { value: "nao_mistura", label: "Não aceita alimentos misturados no prato" }] },
    { id: "sensorialTatil", label: "Tátil (Texturas)", type: "checkbox-group", options: [{ value: "recusa_pastosos", label: "Recusa pastosos" }, { value: "recusa_crocantes", label: "Recusa crocantes" }, { value: "recusa_liquidos", label: "Recusa líquidos" }, { value: "recusa_solidos", label: "Recusa sólidos" }, { value: "recusa_pegajosos", label: "Recusa pegajosos" }, { value: "nao_toca_alimento", label: "Não gosta de tocar no alimento" }] },
    { id: "sensorialOlfativo", label: "Olfativo (Cheiros)", type: "checkbox-group", options: [{ value: "recusa_cheiros_fortes", label: "Recusa por cheiros fortes" }, { value: "cheira_comida", label: "Cheira a comida antes de comer" }] },
    { id: "sensorialGustativo", label: "Gustativo (Sabores)", type: "checkbox-group", options: [{ value: "prefere_neutros", label: "Prefere sabores neutros" }, { value: "prefere_intensos", label: "Prefere sabores intensos (ácidos, salgados)" }, { value: "recusa_amargos", label: "Recusa sabores amargos/azedos" }] },
    { id: "sensorialTemperatura", label: "Temperatura", type: "checkbox-group", options: [{ value: "prefere_quentes", label: "Prefere alimentos quentes" }, { value: "prefere_frios", label: "Prefere alimentos frios" }, { value: "prefere_ambiente", label: "Prefere em temperatura ambiente" }] },
    { id: "headerRepertorioAlimentar", label: "Repertório Alimentar", type: "section-header" },
    { id: "alimentosAceitos", label: "Principais Alimentos Aceitos", type: "textarea", placeholder: "Liste os alimentos de cada grupo (frutas, vegetais, proteínas, carboidratos) que o paciente aceita bem." },
    { id: "alimentosRecusados", label: "Principais Alimentos Recusados", type: "textarea", placeholder: "Liste alimentos que já foram ofertados e são consistentemente recusados." },
    { id: "headerSintomasGastro", label: "Sinais e Sintomas Gastrointestinais", type: "section-header" },
    { id: "sintomasGastro", label: "Sintomas Frequentes", type: "checkbox-group", options: [{ value: "constipacao", label: "Constipação" }, { value: "diarreia", label: "Diarreia" }, { value: "dor_abdominal", label: "Dor abdominal" }, { value: "refluxo", label: "Refluxo" }, { value: "gases", label: "Gases / Distensão abdominal" }] },
    { id: "caracteristicasEvacuacao", label: "Características da Evacuação", type: "textarea", placeholder: "Descreva frequência, consistência (pode usar a Escala de Bristol como referência), presença de dor, etc." },
    { id: "headerHistoricoClinico", label: "Histórico Clínico e Suplementação", type: "section-header" },
    { id: "alergiasIntolerancias", label: "Alergias ou Intolerâncias Alimentares", type: "textarea", placeholder: "Descreva alergias/intolerâncias diagnosticadas ou suspeitas." },
    { id: "medicamentosSuplementos", label: "Medicamentos e Suplementos em Uso", type: "textarea", placeholder: "Liste todos, incluindo dosagens." },
    { id: "observacoesNutricionais", label: "Observações Adicionais", type: "textarea", placeholder: "Adicione outras informações relevantes, como dados antropométricos (peso, altura), exames bioquímicos, etc." },
  ],
  "Padrão": [
    { id: "queixaPrincipal", label: "Queixa Principal", type: "textarea", placeholder: "Descreva a principal queixa do paciente." },
    { id: "observacoesGerais", label: "Observações Gerais", type: "textarea", placeholder: "Nenhuma anamnese específica registrada ainda. Use este campo para observações gerais." },
  ]
};

const dynamicSchemaDef = {
  patientId: z.string().min(1, { message: "O paciente é obrigatório." }),
  ...Object.values(anamneseModels).flat().reduce((acc, field) => {
    if (field.type !== "section-header") {
      let fieldSchema: z.ZodType<any, any, any>;
      if (field.type === "textarea" || field.type === "radio-group" || field.type === "select") {
        fieldSchema = z.string().optional();
      } else if (field.type === "checkbox-group") {
        fieldSchema = z.array(z.string()).optional();
      } else {
        fieldSchema = z.any().optional();
      }
      return { ...acc, [field.id]: fieldSchema };
    }
    return acc;
  }, {})
};
const dynamicSchema = z.object(dynamicSchemaDef);
export type AnamneseFormData = z.infer<typeof dynamicSchema>;

interface AnamneseFormProps {
  id?: string;
  specialty: string;
  onSave: (data: AnamneseFormData) => void;
  initialData?: AnamneseFormData | null;
  hideButtons?: boolean;
  patients: Patient[];
}

export const AnamneseForm = ({ id, specialty, onSave, initialData = null, hideButtons = false, patients }: AnamneseFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const currentModel = anamneseModels[specialty] || anamneseModels["Padrão"];

  const form = useForm<AnamneseFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: initialData || {
      patientId: "",
      ...currentModel.reduce((acc, field) => {
        acc[field.id as keyof AnamneseFormData] = field.defaultValue !== undefined ? field.defaultValue : (field.type === 'checkbox-group' ? [] : "");
        return acc;
      }, {} as any),
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form.reset]);

  const onSubmit = (data: AnamneseFormData) => {
    onSave(data);
    if (!initialData) {
      toast.success("Anamnese salva com sucesso!");
      form.reset({ patientId: "", ...Object.fromEntries(Object.keys(form.getValues()).map(key => [key, ''])) });
    }
  };

  const handleDownloadPDF = () => {
    if (!formRef.current) return;
    const patientId = form.getValues("patientId");
    const patientName = patients.find(p => p.id === patientId)?.name || "Paciente";
    if (!patientId) {
      toast.error("Por favor, selecione um paciente antes de baixar o PDF.");
      return;
    }
    toast.info("Gerando PDF da Anamnese...");

    const buttons = formRef.current.querySelector('.form-buttons') as HTMLElement;
    if (buttons) buttons.style.display = 'none';

    html2canvas(formRef.current, { scale: 2 }).then((canvas) => {
        if (buttons) buttons.style.display = 'flex';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const height = pdfWidth / ratio;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
        let heightLeft = height - pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - height;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
            heightLeft -= pdfHeight;
        }
        pdf.save(`Anamnese_${specialty}_${patientName.replace(/\s+/g, '_')}.pdf`);
        toast.success("PDF da Anamnese gerado com sucesso!");
    }).catch(err => {
        if (buttons) buttons.style.display = 'flex';
        console.error("Erro ao gerar PDF:", err);
        toast.error("Ocorreu um erro ao gerar o PDF.");
    });
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
              name={field.id as keyof AnamneseFormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="font-bold">{field.label}</FormLabel>
                  {field.description && <FormDescription>{field.description}</FormDescription>}
                  <FormControl>
                    {field.type === "textarea" ? (
                      <Textarea placeholder={field.placeholder} {...formField} value={formField.value || ''} rows={4} />
                    ) : field.type === "radio-group" ? (
                      <RadioGroup
                        onValueChange={formField.onChange}
                        value={formField.value as string || ""}
                        className="flex flex-col space-y-1"
                      >
                        {field.options?.map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    ) : field.type === "checkbox-group" ? (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <Controller
                            key={option.value}
                            name={field.id as keyof AnamneseFormData}
                            control={form.control}
                            render={({ field: controllerField }) => {
                              const fieldValue = (controllerField.value as string[] | undefined) || [];
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={fieldValue.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? controllerField.onChange([...fieldValue, option.value])
                                          : controllerField.onChange(fieldValue.filter((value) => value !== option.value));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{option.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Input placeholder={field.placeholder} {...formField} value={formField.value || ''} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        {!hideButtons && (
          <div className="flex space-x-2 pt-2 form-buttons">
            <Button type="submit">Salvar Anamnese</Button>
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