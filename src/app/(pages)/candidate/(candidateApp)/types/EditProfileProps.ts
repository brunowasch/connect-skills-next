export interface EditProfileProps {
    initialData: {
        nome: string;
        sobrenome?: string;
        cidade?: string;
        estado?: string;
        pais?: string;
        ddd?: string;
        numero?: string;
        descricao?: string;
        fotoPerfil?: string;
        links: { id?: string, label?: string, url: string, ordem?: number }[];
        anexos: any[];
    };
}