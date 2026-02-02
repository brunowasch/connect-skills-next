"use client";

import { useTranslation } from "react-i18next";
import { CompanyProfile } from "./CompanyProfile";

interface CompanyProfilePageContentProps {
    company: any;
    localidade: string;
    contato: any;
    perfilShareUrl?: string;
}

export function CompanyProfilePageContent({ company, localidade, contato, perfilShareUrl }: CompanyProfilePageContentProps) {
    const { t } = useTranslation();

    return (
        <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('company_profile_title')}</h1>
            <p className="text-gray-500 mb-8">
                {t('company_profile_desc')}
            </p>
            <CompanyProfile
                company={company}
                fotoPerfil={company.foto_perfil || undefined}
                localidade={localidade}
                contato={contato}
                email={company.usuario?.email}
                perfilShareUrl={perfilShareUrl}
                anexos={company.empresa_arquivo.map((a: any) => ({
                    id: a.id,
                    nome: a.nome,
                    mime: a.mime || '',
                    tamanho: a.tamanho || 0,
                    url: a.url,
                    criadoEm: a.criadoEm.toISOString(),
                }))}
                links={company.empresa_link.map((l: any) => ({
                    id: l.id,
                    label: l.label,
                    url: l.url,
                    ordem: l.ordem
                }))}
            />
        </div>
    );
}
