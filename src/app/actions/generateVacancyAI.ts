'use server'

const API_URL = process.env.IA_GEN_DESC;

interface GenerateVacancyRequest {
    shortDesc: string;
    skills: string[];
    softSkills: string[];
}

export interface GenerateVacancyResponse {
    jobTitle: string;
    shortDesciption: string;
    longDescription: string;
    bestCandidate: string;
    questions: string[];
    requiredSkills: string[];
    behaviouralSkills: string[];
}

export async function generateVacancyAI(data: GenerateVacancyRequest): Promise<GenerateVacancyResponse> {
    if (!API_URL) {
        throw new Error("A URL da IA (IA_GEN_DESC) não está configurada nas variáveis de ambiente.");
    }

    console.log(`[AI] Iniciando geração de vaga. Contexto: "${data.shortDesc}". Total de skills enviadas: ${data.skills.length + data.softSkills.length}`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na API de IA:", errorText);
            throw new Error(`A IA retornou um erro (${response.status}): ${response.statusText}`);
        }

        const result = await response.json();

        const formattedResult: GenerateVacancyResponse = {
            jobTitle: result.jobTitle || "",
            shortDesciption: result.shortDesciption || result.shortDescription || "",
            longDescription: result.longDescription || "",
            bestCandidate: result.bestCandidate || "",
            questions: Array.isArray(result.questions) ? result.questions : [],
            requiredSkills: Array.isArray(result.requiredSkills) ? result.requiredSkills : [],
            behaviouralSkills: Array.isArray(result.behaviouralSkills) ? result.behaviouralSkills : []
        };

        console.log(`[AI] Resposta da IA recebida com sucesso para o cargo: ${formattedResult.jobTitle}`);
        return formattedResult;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error("[AI] Erro: Timeout excedido (60s).");
            throw new Error("A IA demorou muito para responder (limite de 60s). Verifique se o servidor de IA está operando normalmente.");
        }

        if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            console.error("[AI] Erro: Falha na conexão.", error);
            throw new Error("Não foi possível conectar ao servidor de IA em 159.203.185.226:4000. O serviço pode estar offline.");
        }

        console.error("[AI] Erro Inesperado:", error);
        throw error;
    }
}
