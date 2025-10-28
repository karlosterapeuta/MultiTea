"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, Save, BrainCircuit, ArrowLeft, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProfileData } from "@/pages/Profile";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { organizeWithAI } from "@/lib/ai";
import { Patient } from "@/types";

// Data structure for the quiz-like report generator
const reportQuizData: Record<string, Record<string, { prompt: string; options: string[]; allowCustom: boolean; }>> = {
  "Psicologia": {
    informacoesBasicas: {
      prompt: "Qual o contexto inicial do paciente?",
      options: [
        "Paciente foi encaminhado para avaliação e acompanhamento psicológico devido a dificuldades de interação social e comportamentos restritivos.",
        "A queixa principal da família refere-se a desafios na regulação emocional e baixa tolerância à frustração.",
        "O acompanhamento foi iniciado para investigar suspeita de Transtorno do Espectro Autista (TEA).",
        "A demanda inicial partiu da escola, que relatou dificuldades de adaptação do paciente ao ambiente e às rotinas.",
        "Paciente apresenta diagnóstico prévio de [diagnóstico], buscando suporte para o desenvolvimento de habilidades adaptativas.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Promover o desenvolvimento de habilidades socioemocionais.",
        "Aumentar a flexibilidade cognitiva e a tolerância a frustrações.",
        "Desenvolver estratégias de regulação emocional.",
        "Ampliar o repertório de comunicação funcional e pragmática.",
        "Trabalhar a Teoria da Mente e a compreensão de perspectivas.",
        "Reduzir a frequência e intensidade de comportamentos disruptivos.",
        "Estimular o brincar simbólico e a interação com pares.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Sessões com abordagem baseada em Análise do Comportamento Aplicada (ABA).",
        "Intervenções pautadas na Terapia Cognitivo-Comportamental (TCC) adaptada.",
        "Utilização de Treino de Habilidades Sociais (THS) em formato lúdico.",
        "Psicoeducação emocional com uso de recursos visuais (ex: termômetro das emoções).",
        "Orientação parental com foco em manejo de comportamentos e estratégias de reforçamento positivo.",
        "Intervenções baseadas no Modelo Denver de Intervenção Precoce (ESDM).",
        "Uso de histórias sociais para antecipar e explicar situações sociais complexas.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu?",
      options: [
        "Apresentou evolução na capacidade de nomear emoções básicas em si e nos outros.",
        "Demonstrou maior tolerância a pequenas mudanças na rotina com suporte verbal.",
        "Houve um aumento na frequência de interações sociais iniciadas com pares e adultos.",
        "Observou-se uma redução significativa na frequência de comportamentos disruptivos.",
        "Expandiu seu repertório de brincar simbólico e funcional.",
        "Demonstrou avanços na compreensão de perspectivas alheias (Teoria da Mente), visível em jogos e situações hipotéticas.",
        "Utilizou estratégias de autorregulação (ex: respiração, afastamento) de forma mais autônoma em momentos de frustração.",
        "A comunicação verbal tornou-se mais recíproca, com maior manutenção do tópico conversacional.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade da intervenção para consolidação das habilidades adquiridas.",
        "Sugere-se a articulação com a equipe escolar para generalização das estratégias no ambiente educacional.",
        "Encaminha-se para avaliação fonoaudiológica para investigar aspectos da linguagem.",
        "É importante manter a orientação parental para dar seguimento às estratégias em casa.",
        "Sugere-se avaliação neuropsicológica para um mapeamento detalhado das funções cognitivas.",
        "Recomenda-se avaliação com terapeuta ocupacional com foco em integração sensorial.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "O acompanhamento psicológico tem sido benéfico para o desenvolvimento de habilidades socioemocionais e adaptativas.",
        "O paciente tem respondido positivamente às intervenções propostas, demonstrando bom prognóstico com a continuidade do tratamento.",
        "A intervenção tem se mostrado fundamental para a melhora na qualidade de vida do paciente e de sua família.",
        "Conclui-se que os objetivos traçados para o período foram parcialmente/totalmente atingidos, sendo necessário o seguimento do plano terapêutico.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações clínicas ou comportamentais relevantes a adicionar?",
      options: [
        "O paciente demonstra hiperfoco em temas de seu interesse, que pode ser utilizado como ferramenta terapêutica.",
        "Foram registrados comportamentos de estereotipias motoras, principalmente em momentos de ansiedade ou excitação.",
        "Apresenta desafios significativos na reciprocidade socioemocional e na interpretação de pistas não-verbais.",
        "O engajamento familiar no processo terapêutico tem sido um fator crucial para a evolução do paciente.",
        "Observa-se um perfil de pensamento concreto, com dificuldade na compreensão de linguagem figurada.",
      ],
      allowCustom: true,
    },
  },
  "Fonoaudiologia": {
    informacoesBasicas: {
      prompt: "Qual o contexto fonoaudiológico inicial do paciente?",
      options: [
        "Paciente encaminhado para avaliação fonoaudiológica devido a atraso no desenvolvimento da linguagem oral.",
        "A queixa principal da família refere-se a dificuldades na comunicação, fala ininteligível e seletividade alimentar.",
        "Iniciou acompanhamento para desenvolvimento de habilidades de comunicação funcional, verbal e não-verbal.",
        "Apresenta diagnóstico de Apraxia de Fala na Infância, com impacto na inteligibilidade.",
        "Paciente não-verbal, com demanda para introdução de um sistema de Comunicação Aumentativa e Alternativa (CAA).",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Ampliar o vocabulário receptivo e expressivo.",
        "Aumentar o Comprimento Médio do Enunciado (CME).",
        "Melhorar a inteligibilidade da fala, trabalhando fonemas-alvo.",
        "Desenvolver habilidades pragmáticas, como contato visual e troca de turnos.",
        "Introduzir e/ou expandir o uso de Comunicação Aumentativa e Alternativa (CAA).",
        "Trabalhar a dessensibilização oral e a expansão do repertório alimentar.",
        "Adequar o planejamento motor da fala para sequências de sons e palavras.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Terapia com base em abordagens naturalistas e desenvolvimentistas.",
        "Utilização de pistas multissensoriais para a produção dos sons da fala.",
        "Implementação de sistema de comunicação por troca de figuras (PECS).",
        "Atividades lúdicas para estimulação da atenção compartilhada e intenção comunicativa.",
        "Exercícios do sistema sensório-motor-oral para trabalhar a mastigação e a deglutição.",
        "Terapia baseada nos princípios do PROMPT para reorganização dos pontos articulatórios.",
        "Modelagem e uso de aplicativos de CAA em tablet.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu na comunicação e linguagem?",
      options: [
        "Houve um aumento significativo no vocabulário expressivo, com a produção de novas palavras funcionais.",
        "Paciente passou a combinar duas ou mais palavras para formar frases simples.",
        "A produção do fonema-alvo [ex: /s/] tornou-se mais consistente em nível de palavra.",
        "Demonstrou maior iniciativa na comunicação, utilizando gestos e/ou CAA para fazer pedidos.",
        "Apresentou melhora na compreensão de comandos de duas etapas.",
        "Mostrou-se mais tolerante a novas texturas alimentares.",
        "Aumentou o repertório de funções comunicativas, indo além de pedidos e incluindo comentários e perguntas.",
        "A inteligibilidade da fala para ouvintes não familiares melhorou, sendo estimada em [porcentagem]%.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade da terapia fonoaudiológica para aprimorar a complexidade frasal e a clareza da fala.",
        "Sugere-se avaliação audiológica (BERA, Audiometria) para descartar perdas auditivas.",
        "Orientação à família para estimular a linguagem em contextos diários, utilizando estratégias de modelagem.",
        "Articulação com a escola para o uso consistente da CAA no ambiente educacional.",
        "Encaminhamento para avaliação com otorrinolaringologista para investigar questões respiratórias.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "O paciente demonstrou progresso significativo em suas habilidades de comunicação, o que impactou positivamente sua interação social.",
        "A intervenção fonoaudiológica tem sido essencial para o desenvolvimento da linguagem e da fala.",
        "A combinação de terapia direta e orientação familiar tem se mostrado eficaz para a generalização das habilidades.",
        "A introdução da CAA representou um marco no desenvolvimento comunicativo, reduzindo frustrações e ampliando a interação.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações fonoaudiológicas relevantes a adicionar?",
      options: [
        "Observa-se a presença de ecolalia (imediata/tardia), com função predominantemente comunicativa/auto-regulatória.",
        "A prosódia da fala apresenta-se atípica (monótona/cantada).",
        "Paciente demonstra boa memória para jingles e frases de desenhos, o que pode ser usado terapeuticamente.",
        "Apresenta hipersensibilidade oral, impactando tanto a fala quanto a alimentação.",
        "O processamento auditivo central parece ser uma área de desafio, com dificuldade em seguir instruções em ambientes ruidosos.",
      ],
      allowCustom: true,
    },
  },
  "Terapia Ocupacional": {
    informacoesBasicas: {
      prompt: "Qual o contexto ocupacional inicial do paciente?",
      options: [
        "Paciente encaminhado para T.O. com queixas de disfunção de integração sensorial, impactando o desempenho nas AVDs e participação social.",
        "A demanda principal refere-se a dificuldades na coordenação motora fina, seletividade alimentar e desregulação comportamental.",
        "Iniciou acompanhamento para promover maior independência nas atividades de vida diária e ampliar o repertório de brincar.",
        "Apresenta diagnóstico de Transtorno do Desenvolvimento da Coordenação (TDC), com desafios significativos no planejamento motor.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Melhorar a modulação sensorial e as respostas adaptativas ao ambiente.",
        "Desenvolver habilidades de práxis e planejamento motor.",
        "Aumentar a independência em AVDs, como vestir-se e alimentar-se.",
        "Aprimorar a coordenação motora fina para atividades escolares e de lazer.",
        "Ampliar o repertório de brincar funcional e simbólico.",
        "Desenvolver habilidades de integração viso-motora para atividades como escrita e recorte.",
        "Promover o uso de estratégias de autorregulação para manter um nível de alerta ótimo.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Sessões com abordagem de Integração Sensorial de Ayres em ambiente com equipamentos adequados.",
        "Implementação e orientação de uma 'dieta sensorial' para casa e escola.",
        "Análise de tarefas e treino graduado para as AVDs.",
        "Atividades de coordenação viso-motora e destreza manual.",
        "Uso terapêutico do brincar para desenvolver habilidades sociais e cognitivas.",
        "Atividades com foco em propriocepção e feedback vestibular para melhorar a consciência corporal.",
        "Treino de caligrafia e uso de adaptações para o lápis.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu em seu desempenho ocupacional?",
      options: [
        "Apresentou melhora na capacidade de autorregulação, utilizando estratégias sensoriais para se acalmar.",
        "Demonstrou maior tolerância a estímulos táteis, participando de atividades com diferentes texturas.",
        "Conquistou maior independência na tarefa de vestir-se, realizando [n] etapas de forma autônoma.",
        "A preensão do lápis tornou-se mais funcional, melhorando a qualidade de seus desenhos/escrita.",
        "Engajou-se em brincadeiras simbólicas por períodos mais longos.",
        "Melhorou o planejamento motor, conseguindo executar sequências de movimento de 3 ou mais passos.",
        "O tempo de permanência em atividades de mesa aumentou, demonstrando maior capacidade de atenção sustentada.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade da intervenção para aprimorar o planejamento motor e a independência nas AIVDs.",
        "Sugere-se adaptações no mobiliário escolar para favorecer a postura e a atenção.",
        "Orientação à família sobre como graduar as tarefas em casa para promover a autonomia.",
        "Encaminhamento para avaliação oftalmológica/optométrica para investigar aspectos visuais.",
        "Manter a 'dieta sensorial' atualizada e alinhada com as necessidades do paciente.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "O paciente obteve ganhos significativos em seu desempenho ocupacional, resultando em maior participação e qualidade de vida.",
        "A intervenção focada na integração sensorial foi fundamental para a melhora da regulação e do engajamento do paciente.",
        "O progresso observado indica um bom prognóstico para a aquisição de novas habilidades funcionais.",
        "Conclui-se que a terapia ocupacional tem sido essencial para fornecer as bases sensoriais e motoras para outras aprendizagens.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações ocupacionais relevantes a adicionar?",
      options: [
        "Paciente apresenta um perfil sensorial misto, com hipersensibilidade auditiva e busca por estímulos vestibulares.",
        "A dispraxia (dificuldade no planejamento motor) é um fator significativo que impacta a aprendizagem de novas tarefas.",
        "O brincar é predominantemente exploratório e repetitivo, com dificuldades na ideação.",
        "A participação ativa da família na implementação das estratégias tem sido um diferencial na evolução do caso.",
        "Apresenta dificuldades na integração bilateral, ou seja, no uso coordenado de ambos os lados do corpo.",
      ],
      allowCustom: true,
    },
  },
  "Psicopedagogia": {
    informacoesBasicas: {
      prompt: "Qual o contexto de aprendizagem inicial do paciente?",
      options: [
        "Paciente encaminhado para avaliação psicopedagógica devido a dificuldades no processo de alfabetização e raciocínio lógico-matemático.",
        "A queixa escolar refere-se à desatenção, baixa organização com os materiais e dificuldade em seguir as instruções em sala de aula.",
        "Iniciou acompanhamento para desenvolver estratégias de aprendizagem e trabalhar as funções executivas.",
        "Apresenta diagnóstico de Dislexia, com necessidade de intervenção específica.",
        "Demonstra altas habilidades em [área], porém com desempenho acadêmico geral abaixo do esperado.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Desenvolver a consciência fonológica e a relação fonema-grafema.",
        "Aprimorar a compreensão leitora em diferentes níveis (literal, inferencial).",
        "Trabalhar a resolução de problemas matemáticos e o senso numérico.",
        "Estimular as funções executivas, com foco em planejamento, organização e memória de trabalho.",
        "Promover a autonomia e a metacognição no processo de aprendizagem.",
        "Melhorar a produção textual, abordando coesão e coerência.",
        "Desenvolver o vínculo positivo com a aprendizagem e a autoestima acadêmica.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Intervenção baseada em jogos estruturados para o desenvolvimento de habilidades acadêmicas.",
        "Utilização de métodos multissensoriais para a alfabetização (ex: método fônico-articulatório).",
        "Mediação cognitiva para a resolução de problemas, seguindo o modelo de Feuerstein.",
        "Treino de estratégias de organização e planejamento de tarefas (ex: uso de checklists, mapas mentais).",
        "Uso de softwares e aplicativos educacionais como ferramentas de apoio.",
        "Trabalho com diferentes gêneros textuais para ampliar a competência leitora e escritora.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu em seu processo de aprendizagem?",
      options: [
        "Apresentou avanços significativos na decodificação de palavras e na fluência leitora.",
        "Demonstrou maior capacidade de organizar suas ideias para a produção de textos escritos.",
        "Conseguiu aplicar estratégias para resolver problemas matemáticos de [tipo].",
        "Mostrou-se mais organizado com seus materiais e na execução das tarefas propostas.",
        "Houve melhora na atenção sustentada durante as atividades.",
        "Desenvolveu maior habilidade para fazer inferências e compreender informações implícitas em textos.",
        "Passou a demonstrar mais iniciativa e menos ansiedade diante de desafios acadêmicos.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade do acompanhamento psicopedagógico para consolidar as estratégias aprendidas.",
        "Sugere-se a implementação de um Plano de Ensino Individualizado (PEI) na escola.",
        "Articulação com os professores para o uso de adaptações curriculares e avaliativas.",
        "Encaminhamento para avaliação neuropsicológica para um mapeamento cognitivo detalhado.",
        "Incentivar a leitura de materiais de interesse do paciente para fortalecer o hábito e a fluência.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "A intervenção psicopedagógica tem sido crucial para superar as barreiras de aprendizagem do paciente.",
        "O paciente demonstrou grande potencial de aprendizagem ao receber o suporte e as estratégias adequadas.",
        "Observa-se uma melhora na autoestima e na percepção do paciente sobre si mesmo como aprendiz.",
        "Conclui-se que as dificuldades apresentadas não se devem à falta de capacidade, mas sim à necessidade de métodos de ensino diferenciados.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações psicopedagógicas relevantes a adicionar?",
      options: [
        "O estilo de aprendizagem do paciente é predominantemente visual.",
        "Apresenta um pensamento rígido (baixa flexibilidade cognitiva), o que dificulta a correção de erros.",
        "O hiperfoco em [tema] tem sido utilizado como uma porta de entrada para conteúdos acadêmicos.",
        "Fatores emocionais, como a ansiedade de desempenho, impactam significativamente seu rendimento.",
        "A memória de trabalho é uma área de fragilidade, exigindo o uso de suportes externos.",
      ],
      allowCustom: true,
    },
  },
  "Fisioterapia": {
    informacoesBasicas: {
      prompt: "Qual o contexto motor inicial do paciente?",
      options: [
        "Paciente encaminhado para fisioterapia devido a hipotonia muscular generalizada e atraso no desenvolvimento motor.",
        "A queixa principal refere-se à marcha atípica (na ponta dos pés) e quedas frequentes.",
        "Iniciou acompanhamento para avaliação e intervenção postural e de coordenação motora.",
        "Apresenta diagnóstico de Paralisia Cerebral, com hemiparesia/diparesia/tetraparesia espástica.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Promover o aumento do tônus muscular e da força, principalmente em tronco (core).",
        "Adequar o padrão da marcha, estimulando o contato total do pé com o solo.",
        "Melhorar o equilíbrio estático e dinâmico e as reações de proteção.",
        "Aprimorar a coordenação motora ampla e o planejamento motor.",
        "Realizar orientações posturais para as atividades diárias.",
        "Manter e/ou aumentar a amplitude de movimento (ADM) das articulações.",
        "Inibir padrões de movimento anormais e facilitar movimentos mais funcionais.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Realização de cinesioterapia com exercícios terapêuticos para fortalecimento e alongamento.",
        "Treino de marcha em diferentes superfícies e com obstáculos.",
        "Utilização de circuitos motores para trabalhar a coordenação e o equilíbrio.",
        "Exercícios de propriocepção e estimulação vestibular.",
        "Técnicas de terapia manual para mobilização articular e de tecidos moles.",
        "Intervenção baseada no Conceito Neuroevolutivo Bobath.",
        "Uso de bandagens elásticas (Kinesio Taping) para estímulo sensorial e proprioceptivo.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu em seu desenvolvimento motor?",
      options: [
        "Observou-se um aumento da força em musculatura abdominal e paravertebral, resultando em melhor controle postural.",
        "Houve uma diminuição na frequência da marcha na ponta dos pés, com maior tempo de contato do calcanhar no solo.",
        "Apresentou melhora no equilíbrio, conseguindo permanecer em apoio unipodal por mais tempo.",
        "As quedas tornaram-se menos frequentes, com reações de proteção mais eficazes.",
        "Demonstrou maior agilidade e coordenação na execução dos circuitos motores.",
        "Houve ganho na amplitude de movimento de [articulação].",
        "Conseguiu realizar transferências (ex: de sentado para em pé) com maior independência.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade do tratamento fisioterapêutico para automatização do padrão de marcha correto.",
        "Sugere-se a prática de atividades como natação ou equoterapia para fortalecimento global e estímulo sensorial.",
        "Encaminhamento para avaliação com ortopedista para investigar possível encurtamento do tendão de Aquiles.",
        "Orientação à família sobre calçados adequados e exercícios para realizar em casa.",
        "Avaliação para possível indicação de órteses para auxiliar no alinhamento dos membros inferiores.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "A intervenção fisioterapêutica tem proporcionado ganhos motores funcionais importantes para o paciente.",
        "O paciente respondeu bem aos estímulos propostos, demonstrando boa evolução no controle motor e postural.",
        "O tratamento tem sido fundamental para prevenir futuras alterações musculoesqueléticas e promover um desenvolvimento motor mais harmonioso.",
        "Conclui-se que a fisioterapia é essencial para a manutenção da funcionalidade e prevenção de deformidades.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações fisioterapêuticas relevantes a adicionar?",
      options: [
        "Paciente apresenta frouxidão ligamentar, o que contribui para a instabilidade articular.",
        "A hipotonia muscular é mais acentuada em tronco do que em membros.",
        "A busca por estímulos proprioceptivos (pressão profunda) e vestibulares (movimento) é intensa durante as sessões.",
        "Apresenta baixa resistência à fadiga em atividades motoras contínuas.",
        "A espasticidade em [músculo] é um fator que limita a amplitude de movimento.",
      ],
      allowCustom: true,
    },
  },
  "Nutrição": {
    informacoesBasicas: {
      prompt: "Qual o contexto nutricional e alimentar inicial do paciente?",
      options: [
        "Paciente encaminhado para acompanhamento nutricional devido à seletividade alimentar severa e baixo peso.",
        "A queixa principal da família refere-se a comportamentos alimentares restritivos e recusa em experimentar novos alimentos.",
        "Iniciou acompanhamento para manejo de sintomas gastrointestinais (constipação/diarreia) e adequação nutricional.",
        "Apresenta diagnóstico de Alergia à Proteína do Leite de Vaca (APLV), necessitando de dieta de exclusão.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Ampliar o repertório alimentar, com foco na aceitação de novos grupos de alimentos.",
        "Melhorar a aceitação de diferentes texturas, cores e apresentações de alimentos.",
        "Adequar a ingestão de macro e micronutrientes para garantir crescimento e desenvolvimento saudáveis.",
        "Manejar os sintomas gastrointestinais através de estratégias dietéticas.",
        "Promover um comportamento alimentar mais flexível e um ambiente de refeição positivo.",
        "Realizar a orientação da dieta de exclusão, garantindo as substituições adequadas para evitar déficits nutricionais.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Aplicação da abordagem hierárquica de exposição aos alimentos (ver, tocar, cheirar, provar).",
        "Realização de atividades de exploração sensorial com os alimentos.",
        "Orientação nutricional para a família, com estratégias para manejo da seletividade em casa.",
        "Planejamento de cardápio individualizado e receitas adaptadas.",
        "Prescrição de suplementação nutricional, quando necessário.",
        "Educação nutricional sobre leitura de rótulos para identificação de alérgenos.",
        "Culinária terapêutica para aumentar o contato e a familiaridade com os alimentos.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu em seu comportamento alimentar e estado nutricional?",
      options: [
        "Houve a inclusão de [n] novos alimentos no repertório alimentar do paciente.",
        "Paciente passou a tolerar a presença de alimentos recusados no prato sem desregulação.",
        "Apresentou melhora significativa no quadro de constipação com o aumento da ingestão de fibras e água.",
        "Observou-se uma melhora no comportamento durante as refeições, com redução de recusas e comportamentos de fuga.",
        "Houve ganho de peso/altura adequado para a idade, conforme demonstrado na curva de crescimento.",
        "A família demonstrou boa adesão à dieta de exclusão, com remissão dos sintomas alérgicos.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade do acompanhamento nutricional para progressiva ampliação do cardápio.",
        "Sugere-se a realização de exames bioquímicos para monitorar possíveis deficiências de micronutrientes.",
        "Encaminhamento para gastropediatra para investigação aprofundada dos sintomas gastrointestinais.",
        "Manter a família engajada na oferta consistente e sem pressão dos alimentos.",
        "Encaminhamento para terapia ocupacional para trabalhar a hipersensibilidade oral.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "A intervenção nutricional tem sido efetiva para a melhora do comportamento alimentar e do estado nutricional do paciente.",
        "O paciente demonstra capacidade de ampliar seu repertório alimentar em um ambiente terapêutico seguro e com estratégias adequadas.",
        "O manejo da seletividade alimentar tem impactado positivamente a saúde geral e a dinâmica familiar.",
        "A adequação da dieta foi fundamental para o controle dos sintomas e a melhora da qualidade de vida.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações nutricionais relevantes a adicionar?",
      options: [
        "A seletividade alimentar do paciente é fortemente influenciada por características sensoriais, principalmente textura e cor.",
        "Apresenta rituais durante a alimentação, como a necessidade de separar todos os alimentos no prato.",
        "A ingestão hídrica é baixa, sendo um ponto de atenção contínuo.",
        "Há suspeita de alergias/intolerâncias alimentares que precisam ser investigadas.",
        "O paciente demonstra maior aceitação de alimentos com marcas específicas, indicando rigidez e neofobia alimentar.",
      ],
      allowCustom: true,
    },
  },
  "Musicoterapia": {
    informacoesBasicas: {
      prompt: "Qual o contexto inicial do paciente para a Musicoterapia?",
      options: [
        "Paciente encaminhado para Musicoterapia com o objetivo de ampliar os canais de comunicação e promover a interação social.",
        "A demanda principal refere-se à necessidade de trabalhar a regulação emocional e a expressão de sentimentos.",
        "Iniciou acompanhamento para estimulação do desenvolvimento global através de experiências sonoro-musicais.",
        "Busca-se, através da musicoterapia, um canal alternativo de expressão, dado os desafios na comunicação verbal.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Fomentar a intenção comunicativa e a reciprocidade na interação.",
        "Promover a expressão e a modulação de afetos através da música.",
        "Desenvolver a atenção compartilhada e o contato visual em um contexto musical.",
        "Estimular a consciência corporal e o planejamento motor através do ritmo e do movimento.",
        "Ampliar o repertório de respostas adaptativas a estímulos sonoros.",
        "Trabalhar a percepção e a discriminação auditiva.",
        "Facilitar a organização do pensamento e da narrativa através da composição de canções.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Sessões baseadas na improvisação musical clínica para facilitar o diálogo sonoro.",
        "Utilização de canções estruturadas para trabalhar a previsibilidade e a participação.",
        "Atividades de recreação musical para o desenvolvimento de habilidades sociais.",
        "Audição musical receptiva para fins de regulação e relaxamento.",
        "Composição conjunta de canções para trabalhar a narrativa e a expressão de ideias.",
        "Jogos musicais de imitação e resposta para trabalhar a troca de turnos.",
        "Exploração de instrumentos com diferentes timbres e texturas para estimulação sensorial.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu através da experiência musicoterápica?",
      options: [
        "Houve um aumento na frequência e na duração do contato visual durante as interações musicais.",
        "Paciente passou a iniciar interações sonoras, demonstrando maior intencionalidade comunicativa.",
        "Demonstrou capacidade de usar os sons para expressar diferentes emoções, como alegria e frustração.",
        "Apresentou melhora na coordenação motora e na capacidade de seguir um ritmo proposto.",
        "Utilizou a música como uma ferramenta para se regular em momentos de agitação.",
        "Aumentou seu tempo de atenção sustentada em atividades musicais compartilhadas.",
        "Passou a aceitar e a participar de trocas sonoras (dar e receber), demonstrando maior reciprocidade.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade do processo musicoterapêutico para aprofundar o vínculo e os canais de comunicação.",
        "Sugere-se o uso de músicas específicas em casa para auxiliar nas transições e na rotina.",
        "Articulação com a equipe multidisciplinar para compartilhar as percepções sobre a comunicação não-verbal do paciente.",
        "Incentivar a exploração de instrumentos musicais como forma de lazer e expressão.",
        "Explorar a participação em grupos musicais como forma de generalizar as habilidades sociais.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "A Musicoterapia tem se mostrado um espaço potente para o desenvolvimento da comunicação e da expressão do paciente.",
        "O vínculo estabelecido no setting terapêutico musical tem permitido ao paciente explorar novas formas de ser e de se relacionar.",
        "O paciente responde de forma muito positiva ao setting sonoro, demonstrando grande potencial de desenvolvimento através da música.",
        "Conclui-se que a intervenção facilitou a expressão de conteúdos internos que não encontravam via de expressão na linguagem verbal.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações musicoterápicas relevantes a adicionar?",
      options: [
        "O paciente possui um ISO (Identidade Sonora) com preferência por sons de frequência grave e ritmo constante.",
        "Apresenta hipersensibilidade auditiva a sons agudos e inesperados.",
        "Demonstra uma memória musical excepcional, recordando melodias e letras com facilidade.",
        "A interação é mais rica e fluida no contexto não-verbal da improvisação do que na comunicação verbal.",
        "O ritmo musical atua como um importante organizador externo para o comportamento motor do paciente.",
      ],
      allowCustom: true,
    },
  },
  "Psicomotricidade": {
    informacoesBasicas: {
      prompt: "Qual o contexto psicomotor inicial do paciente?",
      options: [
        "Paciente encaminhado para Psicomotricidade devido a agitação motora, dificuldades de coordenação e de consciência corporal.",
        "A queixa principal refere-se à inibição psicomotora, baixo tônus muscular e dificuldades na interação corporal com pares.",
        "Iniciou acompanhamento para trabalhar a organização espacial e temporal e a regulação tônico-emocional.",
        "Apresenta dispraxia, com impacto significativo na aprendizagem de novas habilidades motoras e na autoestima.",
      ],
      allowCustom: true,
    },
    objetivosTerapeuticos: {
      prompt: "Quais foram os principais objetivos terapêuticos para o período?",
      options: [
        "Promover a consciência e a organização do esquema corporal.",
        "Adequar o tônus muscular e desenvolver o diálogo tônico.",
        "Aprimorar a coordenação motora global e fina, e o equilíbrio.",
        "Desenvolver a noção de espaço e tempo.",
        "Facilitar a expressão de emoções através do corpo e do movimento.",
        "Trabalhar a definição da lateralidade.",
        "Melhorar o planejamento motor e a capacidade de sequenciar ações.",
      ],
      allowCustom: true,
    },
    atividadesRealizadas: {
      prompt: "Quais atividades e abordagens foram utilizadas?",
      options: [
        "Sessões com foco no jogo simbólico e na expressividade motora.",
        "Utilização de circuitos psicomotores para trabalhar equilíbrio, agilidade e planejamento.",
        "Atividades de relaxamento e de percepção corporal.",
        "Jogos de construção e atividades grafomotoras para aprimorar a motricidade fina.",
        "Brincadeiras que envolvem o reconhecimento e o respeito aos limites corporais (seus e do outro).",
        "Atividades rítmicas para trabalhar a organização temporal.",
        "Jogos de imitação e espelho para desenvolver o esquema corporal.",
      ],
      allowCustom: true,
    },
    evolucaoPaciente: {
      prompt: "Como o paciente evoluiu em seu desenvolvimento psicomotor?",
      options: [
        "Apresentou melhora na consciência corporal, nomeando e localizando partes do corpo com mais precisão.",
        "Demonstrou maior regulação tônica, com menos agitação e maior capacidade de se acalmar.",
        "Houve uma evolução na coordenação motora global, visível em atividades como pular e correr.",
        "Conseguiu se organizar melhor no espaço, respeitando os limites das atividades.",
        "Passou a utilizar o corpo de forma mais expressiva e funcional no brincar.",
        "O equilíbrio estático e dinâmico mostrou-se mais seguro, com menos quedas.",
        "Apresentou avanços na dissociação de movimentos e na coordenação óculo-manual.",
      ],
      allowCustom: true,
    },
    encaminhamentosRecomendacoes: {
      prompt: "Quais são as recomendações e próximos passos?",
      options: [
        "Recomenda-se a continuidade da terapia psicomotora para consolidar a imagem corporal e a organização espaço-temporal.",
        "Sugere-se a prática de esportes que favoreçam a consciência corporal e a coordenação, como natação ou artes marciais.",
        "Orientação à família e à escola sobre a importância de permitir a exploração corporal em ambientes seguros.",
        "Encaminhamento para Terapia Ocupacional para avaliação de aspectos sensoriais específicos.",
        "Incentivar brincadeiras ao ar livre que desafiem o corpo de forma global.",
      ],
      allowCustom: true,
    },
    conclusao: {
      prompt: "Qual a conclusão profissional sobre o período?",
      options: [
        "A intervenção psicomotora tem sido fundamental para a integração do paciente com seu próprio corpo e com o mundo.",
        "O paciente tem se beneficiado do espaço terapêutico para construir uma imagem corporal mais positiva e funcional.",
        "O desenvolvimento psicomotor tem impactado positivamente a autoestima e a disponibilidade do paciente para a aprendizagem e a socialização.",
        "Conclui-se que o trabalho com a base psicomotora tem fornecido os alicerces para o desenvolvimento de habilidades mais complexas.",
      ],
      allowCustom: true,
    },
    observacoesComplementares: {
      prompt: "Há observações psicomotoras relevantes a adicionar?",
      options: [
        "O paciente apresenta um diálogo tônico caracterizado por hipertonia defensiva ao contato inicial.",
        "A lateralidade ainda se encontra em fase de definição, com uso ambivalente das mãos.",
        "Apresenta sincinesias (movimentos parasitas) em atividades que exigem coordenação fina.",
        "A relação com os objetos é mais de exploração sensorial do que de uso simbólico.",
        "Demonstra insegurança gravitacional, com medo de atividades que envolvam altura ou perda do contato com o solo.",
      ],
      allowCustom: true,
    },
  },
  "Padrão": {
    informacoesBasicas: { prompt: "Contexto inicial", options: [], allowCustom: true },
    objetivosTerapeuticos: { prompt: "Objetivos", options: [], allowCustom: true },
    atividadesRealizadas: { prompt: "Atividades", options: [], allowCustom: true },
    evolucaoPaciente: { prompt: "Evolução", options: [], allowCustom: true },
    encaminhamentosRecomendacoes: { prompt: "Recomendações", options: [], allowCustom: true },
    conclusao: { prompt: "Conclusão", options: [], allowCustom: true },
    observacoesComplementares: { prompt: "Observações", options: [], allowCustom: true },
  }
};

const reportSections = [
  { id: "informacoesBasicas", title: "1. Informações Básicas" },
  { id: "objetivosTerapeuticos", title: "2. Objetivos Terapêuticos" },
  { id: "atividadesRealizadas", title: "3. Atividades Realizadas" },
  { id: "evolucaoPaciente", title: "4. Evolução do Paciente" },
  { id: "encaminhamentosRecomendacoes", title: "5. Encaminhamentos e Recomendações" },
  { id: "conclusao", title: "6. Conclusão" },
  { id: "observacoesComplementares", title: "7. Observações Complementares" },
];

export interface ReportWizardData {
  patientId: string;
  patientName: string;
  startDate: string;
  endDate: string;
  content: Record<string, string>;
}

interface ReportWizardProps {
  specialty: string;
  profileData: ProfileData;
  onSaveReport: (data: ReportWizardData) => void;
  patients: Patient[];
}

export const ReportWizard = ({ specialty, profileData, onSaveReport, patients }: ReportWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selected: string[], custom: string }>>({});
  const [reportContent, setReportContent] = useState<Record<string, string>>({});
  const [isOrganizing, setIsOrganizing] = useState(false);

  const currentQuiz = reportQuizData[specialty] || reportQuizData["Padrão"];
  const totalSteps = reportSections.length + 2; // Initial step + 7 sections + final step = 9 steps (0-8)

  useEffect(() => {
    const newReportContent: Record<string, string> = {};
    reportSections.forEach(section => {
      const answers = quizAnswers[section.id];
      if (answers) {
        const selectedText = answers.selected.map(s => `- ${s}`).join('\n');
        const fullText = [selectedText, answers.custom].filter(Boolean).join('\n\n');
        newReportContent[section.id] = fullText;
      } else {
        newReportContent[section.id] = "";
      }
    });
    setReportContent(newReportContent);
  }, [quizAnswers]);

  const handleAnswerChange = (sectionId: string, value: string, isCustom: boolean) => {
    setQuizAnswers(prev => {
      const current = prev[sectionId] || { selected: [], custom: "" };
      if (isCustom) {
        return { ...prev, [sectionId]: { ...current, custom: value } };
      } else {
        const newSelected = current.selected.includes(value)
          ? current.selected.filter(item => item !== value)
          : [...current.selected, value];
        return { ...prev, [sectionId]: { ...current, selected: newSelected } };
      }
    });
  };

  const handleFileChange = (file: File | null, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente para salvar o relatório.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";
    onSaveReport({
      patientId: selectedPatientId,
      patientName: patientName,
      startDate: startDate,
      endDate: endDate,
      content: reportContent,
    });
  };

  const handleOrganizeWithAI = async () => {
    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente primeiro.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";

    setIsOrganizing(true);
    const toastId = toast.loading("Organizando relatório com IA...");

    try {
      const organizedContent = await organizeWithAI(
        specialty,
        reportContent,
        patientName,
        startDate,
        endDate
      );

      const newQuizAnswers: Record<string, { selected: string[], custom: string }> = {};
      for (const sectionId in organizedContent) {
        newQuizAnswers[sectionId] = {
          selected: [],
          custom: organizedContent[sectionId],
        };
      }
      setQuizAnswers(newQuizAnswers);

      toast.success("Relatório organizado com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao organizar com IA:", error);
      toast.error("Ocorreu um erro ao organizar o relatório.", { id: toastId });
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente para gerar o relatório.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";
    toast.info("Gerando PDF do relatório...");

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 0;

    // --- Colors ---
    const primaryColor = '#17494D'; // Dark Teal
    const textColor = '#333333';
    const lightTextColor = '#777777';
    const sectionBgColor = '#F8F9FA';
    const headerTextColor = '#FFFFFF';

    // --- Helper function for page breaks ---
    const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // --- Header ---
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    y = 10;

    if (logo) {
      try {
        const imgProps = doc.getImageProperties(logo);
        const logoHeight = 15;
        const logoWidth = (imgProps.width * logoHeight) / imgProps.height;
        doc.addImage(logo, 'PNG', margin, y, logoWidth, logoHeight);
      } catch (e) { console.error("Erro ao adicionar logo:", e); }
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(headerTextColor);
    doc.text(profileData.name, pageWidth - margin, y + 3, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.text(profileData.specialty, pageWidth - margin, y + 8, { align: 'right' });
    if (profileData.crp) {
      doc.text(profileData.crp, pageWidth - margin, y + 13, { align: 'right' });
    }
    y = 40;

    // --- Title ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Relatório de Acompanhamento", pageWidth / 2, y, { align: 'center' });
    y += 15;

    // --- Patient Info Section ---
    doc.setFillColor(sectionBgColor);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 20, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text("PACIENTE", margin + 5, y + 7);
    doc.text("PERÍODO", margin + 100, y + 7);

    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text(patientName, margin + 5, y + 14);
    const period = (startDate && endDate) 
        ? `${new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
        : "Não especificado";
    doc.text(period, margin + 100, y + 14);
    y += 30;

    // --- Body ---
    reportSections.forEach(section => {
      const content = reportContent[section.id];
      if (content && content.trim()) {
        const titleLines = doc.splitTextToSize(section.title.toUpperCase(), pageWidth - margin * 2);
        const contentLines = doc.splitTextToSize(content, pageWidth - margin * 2 - 5); // Indent content
        const heightNeeded = (titleLines.length * 8) + (contentLines.length * 5) + 10;
        
        checkPageBreak(heightNeeded);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);
        doc.text(contentLines, margin + 5, y);
        y += contentLines.length * 5 + 10;
      }
    });

    // --- Footer (Signature and Stamp) ---
    const footerHeight = 50;
    checkPageBreak(footerHeight + 20); // Extra space before footer
    y = pageHeight - margin - footerHeight;

    if (signature) {
        try {
            const sigProps = doc.getImageProperties(signature);
            const sigHeight = 20;
            const sigWidth = (sigProps.width * sigHeight) / sigProps.height;
            const sigX = (pageWidth / 2) - (sigWidth / 2);
            doc.addImage(signature, 'PNG', sigX, y, sigWidth, sigHeight);
        } catch(e) { console.error("Erro ao adicionar assinatura:", e); }
    }

    doc.setDrawColor(textColor);
    doc.line(pageWidth / 2 - 40, y + 22, pageWidth / 2 + 40, y + 22);
    doc.setFontSize(10);
    doc.text(profileData.name, pageWidth / 2, y + 28, { align: 'center' });
    if (profileData.crp) {
        doc.text(profileData.crp, pageWidth / 2, y + 33, { align: 'center' });
    }

    if (stamp) {
        try {
            const stampProps = doc.getImageProperties(stamp);
            const stampSize = 25;
            doc.addImage(stamp, 'PNG', pageWidth - margin - stampSize - 5, y, stampSize, stampSize);
        } catch(e) { console.error("Erro ao adicionar carimbo:", e); }
    }

    // --- Page numbers ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(lightTextColor);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
        doc.text(
            `Gerado por MultiTea em ${new Date().toLocaleDateString('pt-BR')}`,
            margin,
            pageHeight - 10
        );
    }

    doc.save(`Relatorio_${specialty}_${patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  const renderStepContent = () => {
    if (currentStep === 0) { // Initial data step
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Dados Iniciais do Relatório</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      );
    }

    if (currentStep > 0 && currentStep <= reportSections.length) {
      const section = reportSections[currentStep - 1];
      const quizSection = currentQuiz[section.id];
      const answers = quizAnswers[section.id] || { selected: [], custom: "" };

      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{section.title}</h3>
          <p className="text-muted-foreground">{quizSection.prompt}</p>
          <div className="space-y-2">
            {quizSection.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Checkbox
                  id={`${section.id}-${index}`}
                  checked={answers.selected.includes(option)}
                  onCheckedChange={() => handleAnswerChange(section.id, option, false)}
                />
                <Label htmlFor={`${section.id}-${index}`} className="font-normal cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
          {quizSection.allowCustom && (
            <div className="space-y-2 pt-4">
              <Label htmlFor={`${section.id}-custom`}>Observações Adicionais para esta Seção:</Label>
              <Textarea
                id={`${section.id}-custom`}
                placeholder="Adicione informações personalizadas aqui..."
                value={answers.custom}
                onChange={(e) => handleAnswerChange(section.id, e.target.value, true)}
                rows={4}
              />
            </div>
          )}
        </div>
      );
    }

    if (currentStep === totalSteps - 1) { // Final review step
      return (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">8. Revisão Final e Personalização</h3>
          
          <div className="space-y-4">
            <Label className="font-medium">Identidade Visual do Relatório</Label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { id: 'logo', state: logo, setter: setLogo, label: 'Logo Digital' },
                { id: 'assinatura', state: signature, setter: setSignature, label: 'Assinatura Digital' },
                { id: 'carimbo', state: stamp, setter: setStamp, label: 'Carimbo Digital' }
              ].map(item => (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={item.id}>{item.label}</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-lg h-16">
                    <Input id={item.id} type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, item.setter)} />
                    <div className="w-24 h-full flex items-center justify-center bg-muted rounded-md overflow-hidden relative group">
                      {item.state ? (
                        <>
                          <img src={item.state} alt={`${item.id} preview`} className="h-full w-full object-contain" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => item.setter(null)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Preview</span>
                      )}
                    </div>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => document.getElementById(item.id)?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> {item.state ? 'Alterar' : 'Enviar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="font-medium">Ações Finais</Label>
            <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
              <Button variant="outline" onClick={handleOrganizeWithAI} disabled={isOrganizing}>
                {isOrganizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                {isOrganizing ? 'Organizando...' : 'Organizar com IA'}
              </Button>
              <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar Relatório
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" /> Gerar PDF
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistente de Relatório Técnico</CardTitle>
        <CardDescription>Siga os passos para criar um relatório profissional de forma guiada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={(currentStep / (totalSteps - 1)) * 100} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-4 border rounded-lg bg-background">
            {renderStepContent()}
          </div>
          <div className="hidden lg:block p-4 border rounded-lg bg-muted/40">
            <h3 className="font-semibold text-lg mb-4">Preview do Relatório</h3>
            <div className="space-y-4 text-sm prose prose-sm max-w-none">
              {reportSections.map(section => (
                reportContent[section.id] && (
                  <div key={section.id}>
                    <h4 className="font-bold">{section.title}</h4>
                    <p className="whitespace-pre-wrap">{reportContent[section.id]}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>
          <Button onClick={() => setCurrentStep(p => p + 1)} disabled={currentStep === totalSteps - 1}>
            Próximo <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};