import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { syncUserWithMentorConnect } from "@/src/lib/mentorconnect-sync";


export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const body = await req.json();
        const { mentorId, disponibilidadeId } = body;

        if (!mentorId || !disponibilidadeId) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const candidato = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
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

        const slot = await prisma.mentor_disponibilidade.findUnique({
            where: { id: disponibilidadeId }
        });

        if (!slot) {
            return NextResponse.json({ error: "Disponibilidade não encontrada." }, { status: 404 });
        }

        const existingInterview = await (prisma as any).entrevista_mentor.findFirst({
            where: {
                disponibilidade_id: disponibilidadeId,
                status: {
                    in: ["PENDENTE_CANDIDATO", "CONFIRMADA", "CONCLUIDA"]
                }
            }
        });

        if (existingInterview) {
            return NextResponse.json({ error: "Este horário já está reservado." }, { status: 400 });
        }

        // Generate meeting link
        let linkReuniao = null;
        if (process.env.MENTORCONNECT_URL) {
            try {
                // Ensure the mentor is synced in mentorship-connections before creating the meeting
                // This prevents 404 if the mentor hasn't been synced yet
                await syncUserWithMentorConnect(mentor.usuario_id);

                const reqMc = await fetch(`${process.env.MENTORCONNECT_URL}/api/meetings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuario_id: mentor.usuario_id,
                        titulo: `Mentoria: ${candidato.nome || "Candidato"} ${candidato.sobrenome || ""} - ${mentor.nome || "Mentor"} ${mentor.sobrenome || ""}`.trim()
                    })
                });

                if (reqMc.ok) {
                    const data = await reqMc.json();
                    linkReuniao = data.link || null;
                } else {
                    console.error("Falha ao gerar reunião no MC:", await reqMc.text());
                }
            } catch (err) {
                console.error("Erro na comunicação com MENTORCONNECT_URL:", err);
            }
        }

        const interview = await prisma.entrevista_mentor.create({
            data: {
                id: randomUUID(),

                candidato_id: candidato.id,
                mentor_id: mentorId,
                disponibilidade_id: disponibilidadeId,
                status: "CONFIRMADA",
                data: slot.data,
                hora_inicio: slot.hora_inicio,
                hora_fim: slot.hora_fim,
                link_reuniao: linkReuniao,
                mentor_notificado: true
            }
        });

        const mentorFullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim() || "Mentor";
        const candidateFullName = `${candidato.nome || ""} ${candidato.sobrenome || ""}`.trim() || "Candidato";
        const [year, month, day] = slot.data.split("-");
        const formattedDate = `${day}/${month}/${year}`;

        // Create notification for Candidate
        await prisma.notificacao.create({
            data: {
                id: randomUUID(),
                usuario_id: candidato.usuario.id,
                tipo: "ENTREVISTA_CONFIRMADA",
                titulo: "Mentoria Agendada com Sucesso",
                mensagem: `Sua mentoria com o mentor "${mentorFullName}" foi agendada para o dia ${formattedDate} às ${slot.hora_inicio}–${slot.hora_fim}.`,
                dados: JSON.stringify({ entrevistaId: interview.id })
            }
        });

        // Create notification for Mentor
        await prisma.notificacao.create({
            data: {
                id: randomUUID(),
                usuario_id: mentor.usuario.id,
                tipo: "ENTREVISTA_CONFIRMADA",
                titulo: "Nova Mentoria Agendada",
                mensagem: `O candidato "${candidateFullName}" agendou uma mentoria com você para o dia ${formattedDate} às ${slot.hora_inicio}–${slot.hora_fim}.`,
                dados: JSON.stringify({ entrevistaId: interview.id })
            }
        });

        return NextResponse.json({ success: true, entrevistaId: interview.id });
    } catch (error) {
        console.error("Erro na API POST /api/candidate/mentorships/book:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
