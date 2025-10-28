// Este é um arquivo de simulação para emular uma chamada de API de IA.
// Em uma aplicação real, isso faria uma requisição para um serviço como o OpenAI.

const professionalPhrases: Record<string, Record<string, string>> = {
  Psicologia: {
    informacoesBasicas: "O paciente, [NOME_PACIENTE], foi encaminhado para avaliação e acompanhamento psicológico. Durante o período de [DATA_INICIO] a [DATA_FIM], observou-se o seguinte contexto:",
    objetivosTerapeuticos: "Para o período em questão, foram delineados os seguintes objetivos terapêuticos centrais:",
    atividadesRealizadas: "As intervenções foram pautadas em uma abordagem lúdica e estruturada, utilizando-se das seguintes estratégias e atividades:",
    evolucaoPaciente: "Ao longo do período, o paciente demonstrou uma evolução notável em diversas áreas. Especificamente, observou-se que:",
    encaminhamentosRecomendacoes: "Com base na evolução apresentada, são feitas as seguintes recomendações e encaminhamentos para a continuidade do desenvolvimento do paciente:",
    conclusao: "Em suma, conclui-se que o acompanhamento terapêutico tem se mostrado de grande valia, contribuindo significativamente para o desenvolvimento do paciente.",
    observacoesComplementares: "Adicionalmente, algumas observações clínicas se fazem pertinentes para uma compreensão integral do caso:",
  },
  default: {
    informacoesBasicas: "O paciente, [NOME_PACIENTE], iniciou o acompanhamento no período de [DATA_INICIO] a [DATA_FIM], apresentando o seguinte quadro inicial:",
    objetivosTerapeuticos: "Os objetivos terapêuticos traçados para este período foram:",
    atividadesRealizadas: "Para alcançar os objetivos propostos, foram realizadas as seguintes atividades e intervenções:",
    evolucaoPaciente: "A evolução do paciente durante o período foi positiva, com destaque para os seguintes pontos:",
    encaminhamentosRecomendacoes: "Para dar continuidade ao progresso, recomenda-se:",
    conclusao: "Conclui-se que a intervenção tem sido benéfica para o paciente.",
    observacoesComplementares: "Como observações adicionais, pontua-se que:",
  }
};

const formatText = (text: string): string => {
  if (!text || !text.trim()) return "";
  
  const items = text.split('\n').map(s => s.trim().replace(/^- /, '')).filter(Boolean);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].charAt(0).toUpperCase() + items[0].slice(1);

  const lastItem = items.pop();
  return `${items.join(', ')} e ${lastItem}.`.charAt(0).toUpperCase() + `${items.join(', ')} e ${lastItem}.`.slice(1);
};

export const organizeWithAI = async (
  specialty: string,
  content: Record<string, string>,
  patientName: string,
  startDate: string,
  endDate: string
): Promise<Record<string, string>> => {
  // Simula o atraso da rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  const newContent: Record<string, string> = {};
  const phrases = professionalPhrases[specialty] || professionalPhrases.default;

  for (const sectionId in content) {
    if (Object.prototype.hasOwnProperty.call(content, sectionId)) {
      const rawText = content[sectionId];
      if (rawText && rawText.trim()) {
        let intro = phrases[sectionId] || "";
        intro = intro.replace('[NOME_PACIENTE]', patientName);
        const startDateFormatted = startDate ? new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'data não informada';
        const endDateFormatted = endDate ? new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'data não informada';
        intro = intro.replace('[DATA_INICIO]', startDateFormatted);
        intro = intro.replace('[DATA_FIM]', endDateFormatted);
        
        const formattedText = formatText(rawText);
        
        newContent[sectionId] = `${intro}\n${formattedText}`;
      } else {
        newContent[sectionId] = "";
      }
    }
  }

  return newContent;
};