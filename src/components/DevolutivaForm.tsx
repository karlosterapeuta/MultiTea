"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Sparkles, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Patient } from "@/types";

const devolutivaTemplates: Record<string, string> = {
  Psicologia: `
RELATÓRIO DE DEVOLUTIVA PSICOLÓGICA

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever brevemente a queixa inicial e os motivos que levaram ao início do acompanhamento psicológico.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - O presente relatório foi construído com base em observações clínicas sistemáticas em sessões lúdicas, entrevistas com os pais/responsáveis e aplicação de escalas/protocolos informais para rastreio do desenvolvimento.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Aspectos Socioemocionais: [Descrever a capacidade de interação, reciprocidade, expressão e reconhecimento de emoções, e o vínculo terapêutico.]
   - Aspectos Cognitivos: [Descrever atenção, memória, funções executivas (planejamento, flexibilidade), e o estilo de aprendizagem.]
   - Aspectos Comportamentais: [Descrever comportamentos-alvo, funções dos comportamentos, estratégias de regulação e adesão a regras e rotinas.]
   - Brincar: [Descrever o tipo de brincar (funcional, simbólico), interesses e como utiliza o lúdico para se expressar.]

5. EVOLUÇÃO DO PACIENTE
   - Durante o período, observou-se uma evolução significativa em [descrever as principais áreas de progresso, como melhora na comunicação, maior tolerância à frustração, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - Conclui-se que o paciente tem se beneficiado do processo terapêutico, demonstrando [resumir o principal ganho]. Recomenda-se a continuidade do acompanhamento para [objetivos futuros] e a articulação com [escola, outros profissionais].

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Fonoaudiologia: `
RELATÓRIO DE DEVOLUTIVA FONOAUDIOLÓGICA

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa inicial, como atraso de fala, dificuldades de comunicação, seletividade alimentar, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A avaliação e o acompanhamento foram realizados através de observação clínica, interação lúdica, aplicação de protocolos de linguagem e fala, e entrevista com os responsáveis.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Linguagem Receptiva (Compreensão): [Descrever a compreensão de comandos, perguntas, vocabulário e conceitos.]
   - Linguagem Expressiva (Expressão): [Descrever o nível de expressão (não-verbal, palavras, frases), vocabulário, e funções comunicativas.]
   - Pragmática: [Descrever o uso social da linguagem: contato visual, atenção compartilhada, troca de turnos, iniciativa comunicativa.]
   - Fala e Sistema Sensório-Motor-Oral: [Descrever a inteligibilidade da fala, pontos articulatórios, e aspectos da mastigação e deglutição, se aplicável.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente demonstrou avanços em [descrever as principais áreas de progresso, como aumento do vocabulário, melhora na inteligibilidade, maior iniciativa na comunicação, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - O paciente apresenta uma evolução positiva no desenvolvimento da comunicação. Sugere-se a continuidade da terapia fonoaudiológica para [objetivos futuros] e a implementação de estratégias de estimulação em ambiente familiar e escolar.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  "Terapia Ocupacional": `
RELATÓRIO DE DEVOLUTIVA DE TERAPIA OCUPACIONAL

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa inicial, como dificuldades em AVDs, desregulação sensorial, desafios na coordenação motora, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A intervenção foi baseada na abordagem de Integração Sensorial de Ayres, com observações clínicas estruturadas, análise do desempenho ocupacional e entrevista com os cuidadores.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Desempenho Ocupacional: [Descrever o nível de independência em Atividades de Vida Diária (AVDs), brincar e participação escolar/social.]
   - Processamento Sensorial: [Descrever o perfil sensorial do paciente, incluindo modulação (hiper/hiporresponsividade), discriminação e reações aos diferentes sistemas (tátil, vestibular, proprioceptivo, etc.).]
   - Habilidades Motoras e Práxis: [Descrever a coordenação motora fina e grossa, o planejamento motor (ideação, planejamento, execução) e a integração viso-motora.]
   - Regulação e Comportamento: [Descrever o nível de alerta, as estratégias de autorregulação e o impacto do processamento sensorial no comportamento.]

5. EVOLUÇÃO DO PACIENTE
   - Observou-se uma melhora significativa em [descrever as principais áreas de progresso, como maior tolerância a estímulos, melhora na caligrafia, maior independência no vestir, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - O paciente tem apresentado ganhos funcionais importantes com a intervenção. Recomenda-se a continuidade do acompanhamento para [objetivos futuros] e a implementação de uma 'dieta sensorial' em casa e na escola.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Psicomotricidade: `
RELATÓRIO DE DEVOLUTIVA DE PSICOMOTRICIDADE

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa inicial, como agitação/inibição motora, dificuldades de coordenação, baixa consciência corporal, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A intervenção foi realizada através de sessões de terapia psicomotora com foco no jogo simbólico, na expressividade motora e em circuitos psicomotores.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Tônus e Diálogo Tônico: [Descrever o estado tônico do paciente (hipo/hipertonia) e sua capacidade de regulação e interação corporal.]
   - Esquema e Imagem Corporal: [Descrever a consciência do paciente sobre seu próprio corpo, seus limites e potencialidades.]
   - Equilibração e Coordenação: [Descrever o equilíbrio estático e dinâmico, e a coordenação motora ampla e fina.]
   - Estruturação Espaço-Temporal: [Descrever a capacidade de organização no espaço e a compreensão de noções de tempo e ritmo.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente evoluiu em [descrever as principais áreas de progresso, como melhora na regulação tônica, maior consciência corporal, melhor planejamento motor, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - A terapia psicomotora tem sido fundamental para a integração do paciente com seu corpo e o ambiente. Recomenda-se a continuidade para [objetivos futuros] e a prática de atividades que explorem o corpo de forma lúdica.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Psicopedagogia: `
RELATÓRIO DE DEVOLUTIVA PSICOPEDAGÓGICA

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa escolar/familiar, como dificuldades de alfabetização, raciocínio lógico, desatenção, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A intervenção baseou-se em avaliação do processo de aprendizagem, utilizando jogos, atividades estruturadas, análise de material escolar e entrevistas.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Vínculo com a Aprendizagem: [Descrever como o paciente se percebe como aprendiz, sua motivação e os aspectos afetivos envolvidos.]
   - Funções Cognitivas: [Descrever as habilidades de atenção, memória e funções executivas aplicadas à aprendizagem.]
   - Habilidades Acadêmicas: [Descrever o desempenho em leitura, escrita e matemática, apontando as facilidades e dificuldades.]
   - Estratégias de Aprendizagem: [Descrever como o paciente organiza seus estudos e resolve problemas.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente demonstrou avanços em [descrever as principais áreas de progresso, como melhora na compreensão leitora, desenvolvimento de estratégias de organização, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - A intervenção psicopedagógica tem auxiliado o paciente a superar suas barreiras de aprendizagem. Recomenda-se a continuidade para [objetivos futuros] e a articulação com a escola para implementação de [adaptações, PEI].

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Musicoterapia: `
RELATÓRIO DE DEVOLUTIVA DE MUSICOTERAPIA

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever os objetivos da musicoterapia, como ampliar canais de comunicação, promover interação, trabalhar a regulação emocional, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - O processo foi conduzido através de experiências sonoro-musicais, como improvisação clínica, recriação de canções e composição, utilizando instrumentos musicais diversos.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Perfil Sonoro-Musical: [Descrever as preferências e sensibilidades do paciente a sons, ritmos e melodias.]
   - Comunicação e Interação Musical: [Descrever como o paciente utiliza os sons para se comunicar, se estabelece diálogos sonoros e participa de trocas.]
   - Expressão Emocional: [Descrever como as emoções são expressas e moduladas através da música.]
   - Aspectos Motores e Cognitivos: [Descrever como a música impacta a organização motora, a atenção e a memória.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente evoluiu em [descrever as principais áreas de progresso, como aumento da intenção comunicativa, uso da música para se regular, maior engajamento em trocas, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - A musicoterapia tem se mostrado um canal potente para o desenvolvimento do paciente. Recomenda-se a continuidade para [objetivos futuros] e o uso da música como ferramenta de apoio na rotina diária.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Fisioterapia: `
RELATÓRIO DE DEVOLUTIVA DE FISIOTERAPIA

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa inicial, como atraso motor, hipotonia, padrão de marcha atípico, dificuldades posturais, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A intervenção foi realizada através de avaliação funcional, cinesioterapia, treino de marcha, circuitos motores e exercícios terapêuticos específicos.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Tônus Muscular e Força: [Descrever o tônus de base e a força muscular funcional, principalmente de tronco e membros.]
   - Postura e Alinhamento: [Descrever a postura em diferentes posições e a presença de assimetrias ou alterações.]
   - Padrão de Marcha: [Descrever as características da marcha, como base de suporte, contato do pé, dissociação de cinturas.]
   - Coordenação e Equilíbrio: [Descrever o desempenho em atividades que exigem coordenação motora ampla e reações de equilíbrio.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente apresentou ganhos em [descrever as principais áreas de progresso, como melhora da força de core, adequação do padrão de marcha, melhor equilíbrio, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - A fisioterapia tem sido essencial para o desenvolvimento motor funcional do paciente. Recomenda-se a continuidade para [objetivos futuros] e a orientação para atividades que promovam o fortalecimento global.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
  Nutrição: `
RELATÓRIO DE DEVOLUTIVA NUTRICIONAL

1. IDENTIFICAÇÃO
   - Paciente: [NOME DO PACIENTE]
   - Período de Acompanhamento: [INÍCIO] a [FIM]
   - Terapeuta Responsável: [SEU NOME] ([SEU CONSELHO])

2. MOTIVO DO ACOMPANHAMENTO
   - [Descrever a queixa inicial, como seletividade alimentar, baixo peso, recusa alimentar, sintomas gastrointestinais, etc.]

3. INSTRUMENTOS E PROCEDIMENTOS UTILIZADOS
   - A intervenção foi realizada através de anamnese alimentar detalhada, avaliação antropométrica, recordatório alimentar e orientação nutricional comportamental.

4. ANÁLISE E SÍNTESE DOS RESULTADOS
   - Comportamento Alimentar: [Descrever o padrão alimentar, a presença de rituais, recusas e o comportamento durante as refeições.]
   - Repertório Alimentar: [Descrever a variedade de alimentos aceitos, com detalhamento por grupos alimentares.]
   - Aspectos Sensoriais: [Descrever a influência de texturas, cores, cheiros e temperaturas na aceitação alimentar.]
   - Avaliação Nutricional: [Descrever o estado nutricional com base em dados antropométricos e análise da ingestão.]

5. EVOLUÇÃO DO PACIENTE
   - O paciente demonstrou progresso em [descrever as principais áreas de avanço, como a inclusão de novos alimentos, melhora do comportamento à mesa, adequação do estado nutricional, etc.].

6. CONCLUSÃO E ENCAMINHAMENTOS
   - A intervenção nutricional tem sido eficaz para a melhora do comportamento alimentar e do estado nutricional. Recomenda-se a continuidade para [objetivos futuros] e a manutenção das estratégias em casa.

Atenciosamente,

_________________________
[SEU NOME]
[SEU CONSELHO]
`,
};

interface DevolutivaFormProps {
  specialty: string;
  therapistName: string;
  therapistCouncil: string;
  onSave: (data: { patientName: string; specialty: string; content: string; patientId: string; }) => void;
  patients: Patient[];
}

export const DevolutivaForm = ({ specialty, therapistName, therapistCouncil, onSave, patients }: DevolutivaFormProps) => {
  const [content, setContent] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const generateModel = () => {
    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente para gerar o modelo.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";
    const baseTemplate = devolutivaTemplates[specialty] || devolutivaTemplates.Psicologia;
    const personalizedTemplate = baseTemplate
      .replace(/\[NOME DO PACIENTE\]/g, patientName)
      .replace(/\[SEU NOME\]/g, therapistName)
      .replace(/\[SEU CONSELHO\]/g, therapistCouncil);
    
    setContent(personalizedTemplate);
    toast.success("Modelo de devolutiva gerado com sucesso!");
  };

  const handleSave = () => {
    if (!selectedPatientId || !content.trim()) {
      toast.error("Selecione um paciente e gere o conteúdo antes de salvar.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";
    onSave({
      patientId: selectedPatientId,
      patientName: patientName,
      specialty,
      content,
    });
    setContent("");
    setSelectedPatientId("");
  };

  const handleDownloadPDF = () => {
    if (!content.trim()) {
      toast.error("Gere um modelo de devolutiva antes de baixar o PDF.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "paciente";
    toast.info("Gerando PDF...");
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(content, pageWidth - margin * 2);
    doc.text(textLines, margin, margin);
    doc.save(`Devolutiva_${patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Paciente</Label>
          <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
            <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
            <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Textarea
        placeholder="Selecione um paciente e clique em 'Gerar Modelo' para começar. Você pode editar o texto aqui."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        className="font-mono text-sm"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={generateModel} className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4" /> Gerar Modelo
        </Button>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> Salvar Devolutiva
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Baixar PDF
        </Button>
      </div>
    </div>
  );
};