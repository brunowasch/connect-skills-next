export interface CompanyProfileProps {
    company: {
        nome_empresa?: string | null;
        foto_perfil?: string | null;
        telefone?: string | null;
        cidade?: string | null;
        estado?: string | null;
        pais?: string | null;
    };
}