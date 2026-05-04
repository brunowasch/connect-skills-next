import React from 'react';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import CandidateInterviewsClient from './_components/CandidateInterviewsClient';

export default async function CandidateInterviewsPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId }
    });

    if (!candidate) {
        redirect("/login");
    }

    const interviews = await prisma.entrevista_mentor.findMany({
        where: {
            candidato_id: candidate.id,
        },
        orderBy: [{ data: 'desc' }, { hora_inicio: 'desc' }]
    });

    const mentorshipData = await Promise.all(interviews.map(async (interview: any) => {
        const vaga = await prisma.vaga.findUnique({
            where: { id: interview.vaga_id },
            select: { cargo: true, empresa_id: true }
        });

        let empresaData = null;
        if (vaga?.empresa_id) {
            empresaData = await prisma.empresa.findUnique({
                where: { id: vaga.empresa_id },
                select: { nome_empresa: true, foto_perfil: true }
            });
        }

        let mentorData = null;
        if (interview.mentor_id) {
            mentorData = await prisma.mentor.findUnique({
                where: { id: interview.mentor_id },
                select: { nome: true, sobrenome: true, foto_perfil: true }
            });
        }

        return {
            id: interview.id,
            status: interview.status,
            cargo: vaga?.cargo || "Mentoria",
            empresa: {
                nome_empresa: empresaData?.nome_empresa || "Empresa",
                foto_perfil: empresaData?.foto_perfil || null
            },
            mentor: mentorData ? {
                nome: mentorData.nome,
                sobrenome: mentorData.sobrenome,
                foto_perfil: mentorData.foto_perfil
            } : null,
            data: interview.data,
            hora_inicio: interview.hora_inicio,
            hora_fim: interview.hora_fim,
            link_reuniao: interview.link_reuniao,
            criado_em: interview.criado_em.toISOString(),
            type: 'online' as const,
            nota_comportamental: interview.nota_comportamental ?? null,
            nota_tecnica: interview.nota_tecnica ?? null,
            nota_geral: interview.nota_geral ?? null,
            feedback_comportamental: interview.feedback_comportamental ?? null,
            feedback_tecnico: interview.feedback_tecnico ?? null,
            feedback_geral: interview.feedback_geral ?? null,
            feedback_enviado_em: interview.feedback_enviado_em
                ? interview.feedback_enviado_em.toISOString()
                : null,
        };
    }));

    const onsiteInterviews = await (prisma as any).entrevista_presencial.findMany({
        where: {
            candidato_id: candidate.id,
        },
        include: {
            slot: true,
        }
    });

    const onsiteData = await Promise.all(onsiteInterviews.map(async (interview: any) => {
        const vaga = await prisma.vaga.findUnique({
            where: { id: interview.vaga_id },
            select: { cargo: true, empresa_id: true }
        });

        let empresaData = null;
        if (vaga?.empresa_id) {
            empresaData = await prisma.empresa.findUnique({
                where: { id: vaga.empresa_id },
                select: { nome_empresa: true, foto_perfil: true }
            });
        }

        return {
            id: interview.id,
            status: interview.status,
            cargo: vaga?.cargo || "Entrevista Presencial",
            empresa: {
                nome_empresa: empresaData?.nome_empresa || "Empresa",
                foto_perfil: empresaData?.foto_perfil || null
            },
            mentor: null,
            data: interview.slot?.data || "",
            hora_inicio: interview.slot?.hora_inicio || "",
            hora_fim: null,
            link_reuniao: null,
            criado_em: interview.criado_em.toISOString(),
            candidato_compareceu: !!interview.candidato_compareceu,
            type: 'presencial' as const,
            nota_comportamental: null,
            nota_tecnica: null,
            nota_geral: null,
            feedback_comportamental: null,
            feedback_tecnico: null,
            feedback_geral: null,
            feedback_enviado_em: null,
        };
    }));

    const allInterviews = [...mentorshipData, ...onsiteData].sort((a, b) => {
        const dateA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
        const dateB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
        return dateB - dateA;
    });

    const mentorshipReviews = mentorshipData.filter(
        (m) =>
            m.nota_geral !== null ||
            m.nota_comportamental !== null ||
            m.nota_tecnica !== null
    );

    const candidateInfo = await prisma.candidato.findUnique({
        where: { id: candidate.id },
        select: { nome: true, sobrenome: true, foto_perfil: true }
    });

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <CandidateInterviewsClient
                    interviews={allInterviews}
                    mentorshipReviews={mentorshipReviews}
                    candidateName={
                        [candidateInfo?.nome, candidateInfo?.sobrenome]
                            .filter(Boolean)
                            .join(" ") || "Candidato"
                    }
                />
            </div>
        </main>
    );
}