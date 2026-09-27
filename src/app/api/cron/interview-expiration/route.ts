import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendInterviewExpiredToCompanyEmail } from "@/src/lib/mail";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    try {
        console.log("[CRON] Iniciando verificação de convites de mentoria expirados...");

        const EXPIRATION_HOURS = 3 * 24;
        const expirationThreshold = new Date(Date.now() - EXPIRATION_HOURS * 60 * 60 * 1000);

        const expiredInterviews = await prisma.entrevista_mentor.findMany({
            where: {
                status: "PENDENTE_CANDIDATO",
                criado_em: {
                    lt: expirationThreshold,
                },
            },
        });

        if (expiredInterviews.length === 0) {
            console.log("[CRON] Nenhum convite de mentoria expirado encontrado.");
            return NextResponse.json({ success: true, processed: 0 });
        }

        let processedCount = 0;

        for (const interview of expiredInterviews) {
            try {
                await prisma.entrevista_mentor.update({
                    where: { id: interview.id },
                    data: { status: "EXPIRADA" },
                });

                const vaga = interview.vaga_id
                    ? await prisma.vaga.findUnique({
                        where: { id: interview.vaga_id },
                        select: { cargo: true, uuid: true, empresa_id: true },
                    })
                    : null;

                const candidato = await prisma.candidato.findUnique({
                    where: { id: interview.candidato_id },
                    select: { nome: true, sobrenome: true, usuario_id: true },
                });

                if (!vaga || !candidato) continue;

                const candidateName = `${candidato.nome || ""} ${candidato.sobrenome || ""}`.trim() || "Candidato";

                const empresa = await prisma.empresa.findUnique({
                    where: { id: vaga.empresa_id },
                    include: { usuario: { select: { id: true, email: true } } },
                });

                if (empresa?.usuario) {
                    await prisma.notificacao.create({
                        data: {
                            id: randomUUID(),
                            usuario_id: empresa.usuario.id,
                            tipo: "MENTORIA_EXPIRADA",
                            titulo: "Convite de Mentoria Expirado",
                            mensagem: `O candidato ${candidateName} não respondeu ao convite de mentoria para a vaga "${vaga.cargo}" dentro do prazo de 3 dias. O convite foi marcado como expirado.`,
                            dados: JSON.stringify({
                                entrevistaId: interview.id,
                                vagaId: interview.vaga_id,
                                candidatoId: interview.candidato_id,
                                candidateName: candidateName,
                                vacancyTitle: vaga.cargo,
                            }),
                        },
                    });

                    try {
                        const vacancyLink = `${process.env.APP_URL}/company/vacancies/${vaga.uuid || vaga.empresa_id}/ranking`;
                        await sendInterviewExpiredToCompanyEmail(
                            empresa.usuario.email,
                            empresa.nome_empresa,
                            candidateName,
                            vaga.cargo,
                            vacancyLink,
                        );
                    } catch (emailErr) {
                        console.error(`[CRON] Falha ao enviar email para empresa (entrevista ${interview.id}):`, emailErr);
                    }
                }

                await (prisma as any).notificacao.updateMany({
                    where: {
                        usuario_id: candidato.usuario_id,
                        tipo: "ENTREVISTA_AGENDADA",
                        dados: { contains: interview.id },
                    },
                    data: { lida: true },
                });

                processedCount++;
                console.log(`[CRON] Entrevista ${interview.id} marcada como EXPIRADA.`);
            } catch (err) {
                console.error(`[CRON] Erro ao processar entrevista ${interview.id}:`, err);
            }
        }

        console.log(`[CRON] Concluído. Expiradas: ${processedCount} de ${expiredInterviews.length}`);
        return NextResponse.json({ success: true, processed: processedCount });
    } catch (error) {
        console.error("[CRON] Erro ao verificar convites expirados:", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}