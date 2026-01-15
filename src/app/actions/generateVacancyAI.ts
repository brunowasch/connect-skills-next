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
        throw new Error("IA_GEN_DESC não está definido.");
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Error:", errorText);
            throw new Error(`Erro ao gerar descrição da vaga: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Erro em generateVacancyAI:", error);
        throw error;
    }
}
