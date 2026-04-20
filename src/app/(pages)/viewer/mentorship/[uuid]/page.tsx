import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import MentorshipDetailsClient from "./_components/MentorshipDetailsClient";

export default async function MentorshipDetailsPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

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

    const interview = await prisma.entrevista_mentor.findFirst({
        where: {
            id: uuid,
            candidato_id: candidate.id
        }
    });

    if (!interview) {
        notFound();
    }

    const vaga = await prisma.vaga.findUnique({
        where: { id: interview.vaga_id },
        select: { cargo: true, empresa_id: true, descricao: true, tipo_local_trabalho: true, vinculo_empregaticio: true }
    });

    let empresaData = null;
    if (vaga?.empresa_id) {
        empresaData = await prisma.empresa.findUnique({
            where: { id: vaga.empresa_id },
            select: { nome_empresa: true, foto_perfil: true, cidade: true, estado: true, uuid: true }
        });
    }

    let mentorData = null;
    if (interview.mentor_id) {
        mentorData = await prisma.mentor.findUnique({
            where: { id: interview.mentor_id },
            select: { nome: true, sobrenome: true, foto_perfil: true, bio: true }
        });
    }

    const mentorshipData = {
        id: interview.id,
        status: interview.status,
        data: interview.data,
        hora_inicio: interview.hora_inicio,
        hora_fim: interview.hora_fim,
        link_reuniao: interview.link_reuniao,
        criado_em: interview.criado_em.toISOString(),
        vaga: vaga ? {
            cargo: vaga.cargo,
            descricao: vaga.descricao,
            tipo_local_trabalho: vaga.tipo_local_trabalho,
            vinculo_empregaticio: vaga.vinculo_empregaticio
        } : null,
        empresa: empresaData ? {
            nome_empresa: empresaData.nome_empresa,
            foto_perfil: empresaData.foto_perfil,
            cidade: empresaData.cidade,
            estado: empresaData.estado,
            uuid: empresaData.uuid
        } : null,
        mentor: mentorData ? {
            nome: mentorData.nome,
            sobrenome: mentorData.sobrenome,
            foto_perfil: mentorData.foto_perfil,
            bio: mentorData.bio
        } : null
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
            <MentorshipDetailsClient mentorship={mentorshipData} />
        </main>
    );
}
