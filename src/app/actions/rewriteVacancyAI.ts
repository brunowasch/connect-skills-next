'use server'

const API_URL = process.env.REWRITE_VACANCY_AI;

interface RewriteVacancyRequest {
    old_text: string;
    req_changes: string;
    language?: string;
}

interface RewriteVacancyResponse {
    new_text: string;
}

export async function rewriteVacancyAI(data: RewriteVacancyRequest): Promise<RewriteVacancyResponse> {
    if (!API_URL) {
        throw new Error("A URL da IA de reescrita não está configurada nas variáveis de ambiente.");
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

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
            throw new Error(`A IA retornou um erro (${response.status}): ${response.statusText}`);
        }

        const result = await response.json();

        return {
            new_text: result.new_text || ""
        };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error("A IA demorou muito para responder (limite de 60s).");
        }

        throw error;
    }
}
