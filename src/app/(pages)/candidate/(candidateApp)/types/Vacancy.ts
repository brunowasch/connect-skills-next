export interface Vacancy {
    id: string;
    uuid?: string | null;
    cargo: string;
    tipo_local_trabalho: 'Presencial' | 'Home_Office' | 'H_brido';
    salario?: number;
    moeda?: string;
    empresa?: {
        id: string;
        nome_empresa?: string;
        nome?: string;
        foto_perfil?: string;
        cidade?: string;
        estado?: string;
        pais?: string;
    };
    vaga_area?: Array<{
        area_interesse?: { nome: string };
        nome?: string;
    }>;
    descricao?: string;
    opcao?: string | null;
    created_at?: string;
    vinculo_empregaticio?: 'Estagio' | 'CLT_Tempo_Integral' | 'CLT_Meio_Periodo' | 'Trainee' | 'Aprendiz' | 'PJ' | 'Freelancer_Autonomo' | 'Temporario';
    isNear?: boolean;
    score?: number;
    isFavorited?: boolean;
}

export interface RecommendedVacancyProps {
    vacanciesRecommended: Vacancy[];
}