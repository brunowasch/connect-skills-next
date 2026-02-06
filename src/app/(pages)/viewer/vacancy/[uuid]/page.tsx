import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { VacancyDetails } from "@/src/app/(pages)/viewer/vacancy/[uuid]/_components/VacancyDetails";

import { redirect } from "next/navigation";

export default async function VacancyDetailsPage({ params, searchParams }: { params: Promise<{ uuid: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { uuid } = await params;
    const { action } = await searchParams;

    // Buscar a vaga por UUID
    const vacancy = await prisma.vaga.findUnique({
        where: { uuid },
    });

    if (!vacancy) {
        notFound();
    }

    // Buscar informações da empresa
    const companyData = await prisma.empresa.findUnique({
        where: { id: vacancy.empresa_id },
        select: {
            nome_empresa: true,
            uuid: true,
            foto_perfil: true,
            cidade: true,
            estado: true,
            pais: true,
            descricao: true,
        }
    });

    const company = companyData ? {
        ...companyData,
        uuid: companyData.uuid ?? ""
    } : null;

    // Buscar áreas de interesse
    const vagaAreas = await prisma.vaga_area.findMany({
        where: { vaga_id: vacancy.id },
        select: { area_interesse_id: true }
    });

    const areaIds = vagaAreas.map(va => va.area_interesse_id);
    const areas = areaIds.length > 0 ? await prisma.area_interesse.findMany({
        where: { id: { in: areaIds } }
    }) : [];

    // Buscar soft skills
    const vagaSoftSkills = await prisma.vaga_soft_skill.findMany({
        where: { vaga_id: vacancy.id },
        select: { soft_skill_id: true }
    });

    const softSkillIds = vagaSoftSkills.map(vss => vss.soft_skill_id);
    const softSkills = softSkillIds.length > 0 ? await prisma.soft_skill.findMany({
        where: { id: { in: softSkillIds } }
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

    // Obter usuário logado para verificar permissões
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;


    let userType: string | undefined;
    let isOwner = false;

    if (userId) {
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                tipo: true,
                empresa: { select: { id: true } }
            }
        });

        if (user) {
            userType = user.tipo;
            const normalizedTipo = user.tipo.toUpperCase();
            if (normalizedTipo === "EMPRESA" && user.empresa?.id === vacancy.empresa_id) {
                isOwner = true;
            }
        }
    }

    // Se a ação for upload_video, verificar se o usuário está logado E se é candidato.
    if (action === 'upload_video') {
         if (!userId || (userId && userType?.toUpperCase() !== 'CANDIDATO')) {
            const redirectUrl = `/viewer/vacancy/${uuid}?action=upload_video`;
            redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
         }
    }

    // Verificar se o candidato já se candidatou
    let hasApplied = false;
    let applicationResponses: any = null;
    let applicationBreakdown: any = null;
    if (userId && userType?.toUpperCase() === 'CANDIDATO') {
        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (candidate) {
            const application = await prisma.vaga_avaliacao.findUnique({
                where: {
                    vaga_id_candidato_id: {
                        vaga_id: vacancy.id,
                        candidato_id: candidate.id
                    }
                },
                select: { resposta: true, breakdown: true }
            });
            hasApplied = !!application;
            if (application?.resposta) {
                try {
                    applicationResponses = JSON.parse(application.resposta);
                } catch (e) {
                    console.error("Erro ao fazer parse das respostas");
                }
            }
            if (application?.breakdown) {
                try {
                    applicationBreakdown = JSON.parse(application.breakdown);
                } catch (e) { 
                    // ignore
                }
            }
        }
    }

    // Montar o objeto de vaga com todos os relacionamentos
    // Serializar para evitar erro de Decimal e Date não-POJO
    const vacancyWithRelations = JSON.parse(JSON.stringify({
        ...vacancy,
        salario: vacancy.salario ? Number(vacancy.salario) : null,
        vaga_area: areas.map(area => ({
            area_interesse: {
                id: area.id,
                nome: area.nome
            }
        })),
        vaga_soft_skill: softSkills.map(ss => ({
            soft_skill: {
                id: ss.id,
                nome: ss.nome
            }
        })),
        vaga_arquivo: files,
        vaga_link: links
    }));

    return (
        <VacancyDetails
            vacancy={vacancyWithRelations}
            company={company}
            isActive={isActive}
            applicationCount={applicationCount}
            userType={userType}
            isOwner={isOwner}
            userId={userId}
            hasApplied={hasApplied}
            applicationResponses={applicationResponses}
            applicationBreakdown={applicationBreakdown}
        />
    );
}
