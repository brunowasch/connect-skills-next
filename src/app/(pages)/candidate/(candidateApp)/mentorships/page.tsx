import React from 'react';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import CandidateMentorshipsClient from './_components/CandidateMentorshipsClient';

export default async function CandidateMentorshipsPage() {
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
        };
    }));

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <CandidateMentorshipsClient mentorships={mentorshipData} />
            </div>
        </main>
    );
}