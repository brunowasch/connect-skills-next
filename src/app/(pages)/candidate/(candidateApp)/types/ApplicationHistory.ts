export interface Application {
    id: string;
    cargo?: string;
    tipo_local_trabalho?: string;
    salario?: number;
    moeda?: string;
    empresa?: {
        id: string;
        nome_empresa?: string;
        foto_perfil?: string;
        cidade?: string;
        estado?: string;
        pais?: string;
    };
    vaga_area?: Array<{
        area_interesse: {
            nome: string;
        };
    }>;
    created_at?: Date;
}

export interface ApplicationHistoryProps {
    historicoAplicacoes: Application[];
}
