export interface HeroProps {
    candidato: {
        nome?: string | null;
        sobrenome?: string | null;
        foto_perfil?: string | null;
        pais?: string | null;
        estado?: string | null;
        cidade?: string | null;
        descricao?: string | null;
        telefone?: string | null;
        data_nascimento?: string | Date | null;
    };
}