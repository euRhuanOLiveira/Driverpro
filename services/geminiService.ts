
import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um assistente especializado em análise financeira para motoristas de aplicativo.

Você NÃO recebe dados brutos.
Você recebe apenas:
- insights calculados
- métricas consolidadas
- rankings médios da cidade e do estado

Regras obrigatórias:
- Nunca invente números.
- Nunca estime valores não fornecidos.
- Use apenas os dados recebidos.
- Seja claro, direto e prático.
- Fale como um consultor experiente, não como professor.
- Bloqueio: Não preveja ganhos futuros ("Se você trabalhar X horas, ganhará Y").
- Bloqueio: Não sugira que o motorista faça jornadas exaustivas (ex: "faça 12 horas").
- Bloqueio: Não afirme que o melhor dia "sempre é sexta". Interprete o passado.

Objetivo:
Ajudar o motorista a ganhar mais dinheiro, trabalhar melhor e entender seus próprios dados.

SQL calcula. IA explica. Motorista decide.
`;

export async function askAssistant(question: string, data: AppData) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Payload consolidado conforme PASSO 3
  const contextPayload = {
    motorista: {
      id_99: data.profile.driver_id_99,
      cidade: data.profile.city_name,
      veiculo: data.profile.vehicle_type
    },
    insights_consolidados: data.insights.map(i => ({
      tipo: i.insight_type,
      titulo: i.insight_title,
      descricao: i.insight_description,
      valor: i.metric_value,
      unidade: i.metric_unit
    })),
    rankings_cidade: {
      cidade: data.city_rankings.city_name,
      media_por_hora: data.city_rankings.avg_net_per_hour,
      media_por_corrida: data.city_rankings.avg_net_per_trip,
      media_por_km: data.city_rankings.avg_net_per_km
    },
    metricas_diarias_recentes: data.daily_metrics.slice(0, 10).map(m => ({
      data: m.date,
      total_ganho: m.total_net,
      media_hora: m.avg_net_per_hour,
      media_corrida: m.avg_net_per_trip
    }))
  };

  const prompt = `
DADOS PARA ANÁLISE (JSON):
${JSON.stringify(contextPayload, null, 2)}

PERGUNTA DO MOTORISTA:
"${question}"

Instrução adicional: Responda de forma curta (até 5 linhas quando apropriado), acionável e humana.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Garantindo respostas objetivas e consistentes
        topP: 0.8,
      },
    });

    return response.text || "Desculpe, não consegui processar sua solicitação agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      // Caso ocorra erro de chave/entidade, poderíamos disparar o seletor de chave se estivéssemos usando Veo/Imagem, 
      // mas para texto básico mantemos o tratamento padrão.
    }
    return "Ocorreu um erro ao consultar o assistente. Verifique sua conexão ou dados.";
  }
}
