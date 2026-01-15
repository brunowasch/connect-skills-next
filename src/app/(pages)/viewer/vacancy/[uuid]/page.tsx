import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { VacancyDetails } from "@/src/app/(pages)/viewer/vacancy/[uuid]/_components/VacancyDetails";

export default async function VacancyDetailsPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    // Buscar a vaga por UUID
    const vacancy = await prisma.vaga.findUnique({
        where: { uuid },
    });

    if (!vacancy) {
        notFound();
    }

    // Buscar informações da empresa
    const company = await prisma.empresa.findUnique({
        where: { id: vacancy.empresa_id },
        select: {
            nome_empresa: true,
            foto_perfil: true,
            cidade: true,
            estado: true,
            pais: true,
            descricao: true,
        }
    });

    // Buscar áreas de interesse
    const vagaAreas = await prisma.$queryRaw<Array<{ area_interesse_id: number }>>`
        SELECT area_interesse_id FROM vaga_area WHERE vaga_id = ${vacancy.id}
    `;

    const areaIds = vagaAreas.map(va => va.area_interesse_id);
    const areas = areaIds.length > 0 ? await prisma.area_interesse.findMany({
        where: { id: { in: areaIds } }
    }) : [];

    // Buscar arquivos
    const files = await prisma.vaga_arquivo.findMany({
        where: { vaga_id: vacancy.id }
    });

    // Buscar links
    const links = await prisma.vaga_link.findMany({
        where: { vaga_id: vacancy.id },
        orderBy: { ordem: 'asc' }
    });

    // Buscar status da vaga
    const status = await prisma.vaga_status.findFirst({
        where: { vaga_id: vacancy.id },
        orderBy: { criado_em: 'desc' }
    });

    // Contar candidaturas
    const applicationCount = await prisma.vaga_avaliacao.count({
        where: { vaga_id: vacancy.id }
    });

    const rawStatus = status ? status.situacao.toUpperCase() : 'ATIVA';
    const isActive = !['INATIVA', 'FECHADA', 'ENCERRADA'].includes(rawStatus);

    // Montar o objeto de vaga com todos os relacionamentos
    const vacancyWithRelations = {
        ...vacancy,
        vaga_area: areas.map(area => ({
            area_interesse: {
                id: area.id,
                nome: area.nome
            }
        })),
        vaga_arquivo: files,
        vaga_link: links
    };

    return (
        <VacancyDetails
            vacancy={vacancyWithRelations}
            company={company}
            isActive={isActive}
            applicationCount={applicationCount}
        />
    );
}
