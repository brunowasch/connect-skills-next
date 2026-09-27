import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendMentorFeedbackToCompanyEmail } from "@/src/lib/mail";
import { isAuthorizedSyncRequest } from "@/src/lib/sync-auth";

export async function POST(req: NextRequest) {
    if (!isAuthorizedSyncRequest(req)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entrevistaId, feedback_comportamental, feedback_tecnico, feedback_geral, nota_comportamental, nota_tecnica, nota_geral } = body as {
            entrevistaId?: string;
            feedback_comportamental?: string;
            feedback_tecnico?: string;
            feedback_geral?: string;
            nota_comportamental?: number;
            nota_tecnica?: number;
            nota_geral?: number;
        };

        if (!entrevistaId) {
            return NextResponse.json({ error: "entrevistaId é obrigatório." }, { status: 400 });
        }
        if (!feedback_comportamental?.trim()) {
            return NextResponse.json({ error: "Feedback Comportamental é obrigatório." }, { status: 400 });
        }
        if (nota_comportamental === undefined || nota_comportamental < 0 || nota_comportamental > 100) {
            return NextResponse.json({ error: "Nota Comportamental deve ser entre 0 e 100." }, { status: 400 });
        }
        if (!feedback_tecnico?.trim()) {
            return NextResponse.json({ error: "Feedback Técnico é obrigatório." }, { status: 400 });
        }
        if (nota_tecnica === undefined || nota_tecnica < 0 || nota_tecnica > 100) {
            return NextResponse.json({ error: "Nota Técnica deve ser entre 0 e 100." }, { status: 400 });
        }
        if (!feedback_geral?.trim()) {
            return NextResponse.json({ error: "Feedback Geral é obrigatório." }, { status: 400 });
        }
        if (nota_geral === undefined || nota_geral < 0 || nota_geral > 100) {
            return NextResponse.json({ error: "Nota Geral deve ser entre 0 e 100." }, { status: 400 });
        }

        const entrevista = await (prisma as any).entrevista_mentor.findUnique({
            where: { id: entrevistaId }
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        }

        const candidato = await prisma.candidato.findUnique({ where: { id: entrevista.candidato_id } });
        const mentor = await prisma.mentor.findUnique({ where: { id: entrevista.mentor_id } });
        
        let empresa = null;
        const vaga = entrevista.vaga_id
            ? await prisma.vaga.findUnique({ where: { id: entrevista.vaga_id } })
            : null;
        if (vaga) {
            empresa = await prisma.empresa.findUnique({
                where: { id: vaga.empresa_id },
                include: { usuario: true }
            });
        }

        await (prisma as any).entrevista_mentor.update({
            where: { id: entrevistaId },
            data: {
                feedback_comportamental: feedback_comportamental.trim(),
                feedback_tecnico: feedback_tecnico.trim(),
                feedback_geral: feedback_geral.trim(),
                nota_comportamental,
                nota_tecnica,
                nota_geral,
                feedback_enviado_em: new Date(),
                status: "CONCLUIDA" // Ensure the status is updated to CONCLUIDA when feedback is saved!
            },
        });

        const mentorName = [mentor?.nome, mentor?.sobrenome].filter(Boolean).join(" ") || "Mentor";
        const candidateName = [candidato?.nome, candidato?.sobrenome].filter(Boolean).join(" ") || "Candidato";

        // Create notification for Candidate
        if (candidato?.usuario_id) {
            await prisma.notificacao.create({
                data: {
                    id: crypto.randomUUID(),
                    usuario_id: candidato.usuario_id,
                    tipo: "FEEDBACK_DISPONIVEL",
                    titulo: vaga ? "Avaliação da Entrevista Técnica Disponível" : "Avaliação da Mentoria Disponível",
                    mensagem: vaga 
                        ? `A avaliação da sua entrevista com o mentor ${mentorName} para a vaga "${vaga.cargo}" já está disponível. Confira seu feedback!`
                        : `Sua avaliação da sessão de mentoria com o mentor ${mentorName} já está disponível. Confira seu feedback!`,
                    dados: JSON.stringify({ entrevistaId })
                }
            });
        }

        // Create notification for Company (if vacancy interview)
        if (vaga && empresa?.usuario?.id) {
            await prisma.notificacao.create({
                data: {
                    id: crypto.randomUUID(),
                    usuario_id: empresa.usuario.id,
                    tipo: "FEEDBACK_DISPONIVEL",
                    titulo: "Resultado de Entrevista Disponível",
                    mensagem: `O mentor ${mentorName} enviou a avaliação do candidato ${candidateName} para a vaga "${vaga.cargo}".`,
                    dados: JSON.stringify({ 
                        entrevistaId, 
                        vagaId: entrevista.vaga_id, 
                        candidatoId: entrevista.candidato_id 
                    })
                }
            });
        }

        // Enviar email para a empresa
        if (empresa?.usuario?.email) {
            const companyEmail = empresa.usuario.email;
            const companyName = empresa.nome_empresa || "Empresa";
            const vacancyTitle = vaga?.cargo || "Vaga";
            
            const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const vacancyLink = `${appUrl}/company/vacancies/${vaga?.uuid}/ranking`;

            await sendMentorFeedbackToCompanyEmail(
                companyEmail,
                companyName,
                candidateName,
                mentorName,
                vacancyTitle,
                vacancyLink
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST /api/mentor/interview/feedback] Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
