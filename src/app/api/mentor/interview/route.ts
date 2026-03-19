import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendInterviewScheduledEmail, sendInterviewConfirmedToMentorEmail } from "@/src/lib/mail";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { vagaId, candidatoId, mentorId, disponibilidadeId } = body;

        if (!vagaId || !candidatoId || !mentorId || !disponibilidadeId) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const slot = await prisma.mentor_disponibilidade.findUnique({
            where: { id: disponibilidadeId }
        });

        if (!slot) {
            return NextResponse.json({ error: "Disponibilidade não encontrada." }, { status: 404 });
        }

        const vaga = await prisma.vaga.findUnique({ where: { id: vagaId } });
        if (!vaga) {
            return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });
        }

        const candidato = await prisma.candidato.findUnique({
            where: { id: candidatoId },
            include: { usuario: { select: { id: true, email: true } } }
        });
        if (!candidato || !candidato.usuario) {
            return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
        }

        const mentor = await prisma.mentor.findUnique({
            where: { id: mentorId },
            include: { usuario: { select: { id: true, email: true } } }
        });
        if (!mentor || !mentor.usuario) {
            return NextResponse.json({ error: "Mentor não encontrado." }, { status: 404 });
        }

        const interview = await prisma.entrevista_mentor.create({
            data: {
                id: randomUUID(),
                vaga_id: vagaId,
                candidato_id: candidatoId,
                mentor_id: mentorId,
                disponibilidade_id: disponibilidadeId,
                status: "PENDENTE_CANDIDATO",
                data: slot.data,
                hora_inicio: slot.hora_inicio,
                hora_fim: slot.hora_fim,
            }
        });

        const mentorFullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim() || "Mentor";
        const candidateFullName = `${candidato.nome || ""} ${candidato.sobrenome || ""}`.trim() || "Candidato";
        const [dayStr, monthStr, yearStr] = slot.data.split("-").reverse();
        const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;

        // Fetch company name for notification
        const company = await prisma.empresa.findUnique({
            where: { id: vaga.empresa_id },
            select: { nome_empresa: true }
        });

        await prisma.notificacao.create({
            data: {
                id: randomUUID(),
                usuario_id: candidato.usuario.id,
                tipo: "ENTREVISTA_AGENDADA",
                titulo: "Entrevista Agendada",
                mensagem: `A empresa "${company?.nome_empresa || "uma empresa"}" agendou uma entrevista para você para a vaga de "${vaga.cargo}". Data: ${formattedDate}, ${slot.hora_inicio}–${slot.hora_fim}. Confirme sua presença!`,
                dados: JSON.stringify({ entrevistaId: interview.id, vagaId, mentorId })
            }
        });

        try {
            const confirmLink = `${process.env.APP_URL}/candidate/interviews/${interview.id}/confirm`;
            await sendInterviewScheduledEmail(
                candidato.usuario.email,
                candidateFullName,
                mentorFullName,
                vaga.cargo,
                formattedDate,
                slot.hora_inicio,
                slot.hora_fim,
                confirmLink
            );
        } catch (emailErr) {
            console.error("Warning: failed to send email, but interview was created:", emailErr);
        }

        return NextResponse.json({ success: true, entrevistaId: interview.id });
    } catch (error) {
        console.error("Erro na API POST /api/mentor/interview:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { entrevistaId, action } = body;

        if (!entrevistaId || !action) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const interview = await prisma.entrevista_mentor.findUnique({
            where: { id: entrevistaId }
        });

        if (!interview) {
            return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        }

        if (action === "CONFIRM") {
            if (interview.status === "CONFIRMADA") {
                return NextResponse.json({ error: "Você já confirmou esta entrevista." }, { status: 400 });
            }
            if (interview.status === "CANCELADA") {
                return NextResponse.json({ error: "Esta entrevista foi recusada e não pode mais ser confirmada." }, { status: 400 });
            }

            await prisma.entrevista_mentor.update({
                where: { id: entrevistaId },
                data: {
                    status: "CONFIRMADA",
                    mentor_notificado: true
                }
            });

            const vaga = await prisma.vaga.findUnique({ where: { id: interview.vaga_id } });
            const candidato = await prisma.candidato.findUnique({
                where: { id: interview.candidato_id },
                include: { usuario: { select: { id: true, email: true } } }
            });
            const mentor = await prisma.mentor.findUnique({
                where: { id: interview.mentor_id },
                include: { usuario: { select: { id: true, email: true } } }
            });

            if (!vaga || !candidato || !mentor || !candidato.usuario || !mentor.usuario) {
                return NextResponse.json({ error: "Dados relacionados não encontrados." }, { status: 404 });
            }

            const mentorFullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim() || "Mentor";
            const candidateFullName = `${candidato.nome || ""} ${candidato.sobrenome || ""}`.trim() || "Candidato";
            const [dayStr, monthStr, yearStr] = interview.data.split("-").reverse();
            const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;

            await prisma.notificacao.create({
                data: {
                    id: randomUUID(),
                    usuario_id: mentor.usuario.id,
                    tipo: "ENTREVISTA_CONFIRMADA",
                    titulo: "Entrevista Confirmada pelo Candidato",
                    mensagem: `O candidato ${candidateFullName} confirmou presença na entrevista para a vaga "${vaga.cargo}". Data: ${formattedDate}, ${interview.hora_inicio}–${interview.hora_fim}.`,
                    dados: JSON.stringify({ entrevistaId, vagaId: interview.vaga_id, candidatoId: interview.candidato_id })
                }
            });

            await prisma.notificacao.create({
                data: {
                    id: randomUUID(),
                    usuario_id: candidato.usuario.id,
                    tipo: "ENTREVISTA_CONFIRMADA",
                    titulo: "Presença Confirmada com Sucesso",
                    mensagem: `Sua presença na entrevista com o mentor ${mentorFullName} para a vaga "${vaga.cargo}" foi confirmada. Data: ${formattedDate}, ${interview.hora_inicio}–${interview.hora_fim}.`,
                    dados: JSON.stringify({ entrevistaId, vagaId: interview.vaga_id })
                }
            });

            try {
                await sendInterviewConfirmedToMentorEmail(
                    mentor.usuario.email,
                    mentorFullName,
                    candidateFullName,
                    vaga.cargo,
                    formattedDate,
                    interview.hora_inicio,
                    interview.hora_fim
                );
            } catch (emailErr) {
                console.error("Warning: failed to send email to mentor:", emailErr);
            }

            // Invalidate/Mark as read original invitation notification
            await (prisma as any).notificacao.updateMany({
                where: {
                    usuario_id: candidato.usuario.id,
                    tipo: "ENTREVISTA_AGENDADA",
                    dados: { contains: entrevistaId }
                },
                data: { lida: true }
            });

            return NextResponse.json({ success: true, status: "CONFIRMADA" });

        } else if (action === "CANCEL") {
            if (interview.status === "CANCELADA") {
                return NextResponse.json({ error: "Você já recusou esta entrevista." }, { status: 400 });
            }
            if (interview.status === "CONFIRMADA") {
                return NextResponse.json({ error: "Esta entrevista já foi confirmada e não pode ser recusada." }, { status: 400 });
            }

            const updated = await prisma.entrevista_mentor.update({
                where: { id: entrevistaId },
                data: { status: "CANCELADA" }
            });

            // Notify company about the cancellation
            const vaga = await prisma.vaga.findUnique({ where: { id: updated.vaga_id } });
            const candidate = await prisma.candidato.findUnique({ where: { id: updated.candidato_id } });

            if (vaga && candidate) {
                // Find company user
                const company = await prisma.empresa.findUnique({
                    where: { id: vaga.empresa_id },
                    select: { usuario_id: true }
                });

                if (company) {
                    await prisma.notificacao.create({
                        data: {
                            id: randomUUID(),
                            usuario_id: company.usuario_id,
                            tipo: "ENTREVISTA_RECUSADA",
                            titulo: "Entrevista Recusada pelo Candidato",
                            mensagem: `O candidato ${candidate.nome || "Candidato"} recusou o convite de entrevista para a vaga "${vaga.cargo}".`,
                            dados: JSON.stringify({ entrevistaId, candidatoId: updated.candidato_id })
                        }
                    });
                }

                // Invalidate/Mark as read original invitation notification
                await (prisma as any).notificacao.updateMany({
                    where: {
                        usuario_id: candidate.usuario_id,
                        tipo: "ENTREVISTA_AGENDADA",
                        dados: { contains: entrevistaId }
                    },
                    data: { lida: true }
                });
            }

            return NextResponse.json({ success: true, status: "CANCELADA" });
        }

        return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    } catch (error) {
        console.error("Erro na API PATCH /api/mentor/interview:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
