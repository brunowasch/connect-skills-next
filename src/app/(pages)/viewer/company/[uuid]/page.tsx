import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { PublicCompanyProfile } from "./_components/PublicCompanyProfile";

export default async function CompanyPublicProfilePage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    const company = await prisma.empresa.findUnique({
        where: { uuid },
        include: {
            usuario: {
                select: {
                    email: true
                }
            },
            empresa_arquivo: {
                orderBy: {
                    criadoEm: 'desc'
                }
            },
            empresa_link: {
                orderBy: {
                    ordem: 'asc'
                }
            }
        }
    });

    if (!company) {
        notFound();
    }

    const localidade = company.cidade && company.estado
        ? `${company.cidade} - ${company.estado}, ${company.pais || 'Brasil'}`
        : company.cidade || company.estado || 'Localidade não informada';

    const rawTelefone = company.telefone || '';
    let ddi = '';
    let ddd = '';
    let numero = '';

    if (rawTelefone.includes('|')) {
        const parts = rawTelefone.split('|');
        ddi = parts[0].replace('+', '');
        ddd = parts[1] || '';
        numero = parts[2] || '';
    } else {
        const cleanTelefone = rawTelefone.replace(/\D/g, '');
        if (cleanTelefone.length >= 12 && cleanTelefone.startsWith('55')) {
            ddi = '55';
            ddd = cleanTelefone.substring(2, 4);
            numero = cleanTelefone.substring(4);
        } else if (cleanTelefone.length >= 10) {
            const numLen = cleanTelefone.length >= 11 ? 9 : 8;
            numero = cleanTelefone.slice(-numLen);
            ddd = cleanTelefone.slice(-numLen - 2, -numLen);
            ddi = cleanTelefone.slice(0, -numLen - 2);
        } else {
            numero = rawTelefone;
        }
    }

    if (numero.length === 9) {
        numero = `${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
        numero = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }

    const contato = { ddi, ddd, numero };

    const anexos = company.empresa_arquivo.map((a: any) => ({
        id: a.id,
        nome: a.nome,
        url: a.url,
        mime: a.mime,
        tamanho: a.tamanho,
        criadoEm: a.criadoEm.toISOString(),
    }));

    const links = company.empresa_link.map((l: any) => ({
        id: l.id,
        label: l.label,
        url: l.url,
        ordem: l.ordem
    }));

    // Fetch Active Vacancies
    const allVacancies = await prisma.vaga.findMany({
        where: { empresa_id: company.id },
        select: {
            id: true,
            uuid: true,
            cargo: true,
            tipo_local_trabalho: true,
            created_at: true,
            vinculo_empregaticio: true,
            opcao: true,
        },
        orderBy: { created_at: 'desc' },
    });

    const vacancyIds = allVacancies.map(v => v.id);
    const statuses = await prisma.vaga_status.findMany({
        where: { vaga_id: { in: vacancyIds } },
        orderBy: { criado_em: 'desc' }
    });

    // Filter active only
    const activeVacancies = allVacancies.filter(v => {
        const statusRecord = statuses.find(s => s.vaga_id === v.id);
        const rawStatus = statusRecord ? statusRecord.situacao.toUpperCase() : 'ATIVA';
        return !['INATIVA', 'FECHADA', 'ENCERRADA'].includes(rawStatus);
    });

    const activeVacancyIds = activeVacancies.map(v => v.id);
    const vagaAreas = await prisma.vaga_area.findMany({
        where: { vaga_id: { in: activeVacancyIds } },
        select: {
            vaga_id: true,
            area_interesse_id: true
        }
    });

    const areaIds = Array.from(new Set(vagaAreas.map(va => va.area_interesse_id)));
    const areas = await prisma.area_interesse.findMany({
        where: { id: { in: areaIds } },
        select: { id: true, nome: true }
    });

    const areaMap = new Map(areas.map(a => [a.id, a.nome]));

    const vacanciesSerialized = activeVacancies.map(v => {
        const tags = vagaAreas
            .filter(va => va.vaga_id === v.id)
            .map(va => areaMap.get(va.area_interesse_id))
            .filter(Boolean) as string[];

        return {
            id: v.id,
            uuid: v.uuid || '',
            cargo: v.cargo,
            tipo_local_trabalho: String(v.tipo_local_trabalho),
            vinculo_empregaticio: v.vinculo_empregaticio ? String(v.vinculo_empregaticio) : '',
            created_at: v.created_at.toISOString(),
            tags: tags,
        };
    });

    // Serialize object to avoid server component errors
    const companySerialized = JSON.parse(JSON.stringify(company));

    return (
        <div className="container mx-auto px-4 py-8">
            <PublicCompanyProfile
                company={companySerialized}
                fotoPerfil={company.foto_perfil || undefined}
                localidade={localidade}
                contato={contato}
                email={company.usuario?.email}
                anexos={anexos}
                links={links}
                vagas={vacanciesSerialized}
            />
        </div>
    );
}
