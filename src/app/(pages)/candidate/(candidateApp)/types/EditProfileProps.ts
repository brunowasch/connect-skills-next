export interface EditProfileProps {
    initialData: {
        nome: string;
        sobrenome?: string;
        localidade?: string;
        ddd?: string;
        numero?: string;
        descricao?: string;
        fotoPerfil?: string;
        links: { url: string }[];
        anexos: any[];
    };
}