import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendVideoExpiredCandidateEmail, sendVideoExpiredCompanyEmail } from "@/src/lib/mail";

export async function GET(req: Request) {

    try {
        console.log("[CRON] Iniciando verificação de vídeos expirados...");

        // Buscamos candidaturas onde o status do vídeo é "requested"
        const applications = await prisma.vaga_avaliacao.findMany({
            where: {
                breakdown: {
                    contains: '"status":"requested"'
                }
            }
        });

        if (applications.length === 0) {
            return NextResponse.json({ success: true, processed: 0 });
        }

        // Buscando Candidatos
        const candidateIds = [...new Set(applications.map(app => app.candidato_id))];
        const candidates = await prisma.candidato.findMany({
            where: { id: { in: candidateIds } },
            include: { usuario: true }
        });
        const candidateMap = new Map(candidates.map(c => [c.id, c]));

        // Buscando Vagas
        const vacancyIds = [...new Set(applications.map(app => app.vaga_id))];
        const vacancies = await prisma.vaga.findMany({
            where: { id: { in: vacancyIds } }
        });
        const vacancyMap = new Map(vacancies.map(v => [v.id, v]));

        // Buscando Empresas das Vagas
        const companyIds = [...new Set(vacancies.map(v => v.empresa_id))];
        const companies = await prisma.empresa.findMany({
            where: { id: { in: companyIds } },
            include: { usuario: true }
        });
        const companyMap = new Map(companies.map(c => [c.id, c]));

        let processedCount = 0;

        for (const app of applications) {
            if (!app.breakdown) continue;

            const candidato = candidateMap.get(app.candidato_id);
            const vaga = vacancyMap.get(app.vaga_id);
            const empresa = vaga ? companyMap.get(vaga.empresa_id) : undefined;

            if (!candidato || !vaga || !empresa) continue;

            let breakdown: any = {};
            try {
                breakdown = typeof app.breakdown === 'string' ? JSON.parse(app.breakdown) : app.breakdown;
            } catch (e) {
                continue;
            }

            // Verifica se o vídeo está 'requested' e se já passou da deadline
            if (breakdown?.video?.status === 'requested' && breakdown?.video?.deadline) {
                const deadlineDate = new Date(breakdown.video.deadline);
                const isExpired = new Date() > deadlineDate;

                // Checa se os emails já foram enviados
                const emailSentStatus = breakdown?.video?.expiredEmailSent === true;

                if (isExpired && !emailSentStatus) {
                    const candidateName = `${candidato.nome || ''} ${candidato.sobrenome || ''}`.trim() || 'Candidato';
                    const companyName = empresa.nome_empresa || 'Empresa';
                    const vacancyTitle = vaga.cargo;
                    const candidateEmail = candidato.usuario?.email;
                    const companyEmail = empresa.usuario?.email;
                    
                    const platformLink = `${process.env.APP_URL}/company/vacancies/${vaga.uuid || vaga.id}/ranking`;

                    if (candidateEmail) {
                        await sendVideoExpiredCandidateEmail(candidateEmail, candidateName, vacancyTitle);
                    }
                    if (companyEmail) {
                        await sendVideoExpiredCompanyEmail(companyEmail, companyName, candidateName, vacancyTitle, platformLink);
                    }

                    breakdown.video.expiredEmailSent = true;
                    
                    if (!breakdown.company_notifications) breakdown.company_notifications = {};
                    if (!breakdown.company_notifications.video_expired_unsubmitted) {
                        breakdown.company_notifications.video_expired_unsubmitted = { read: false, deleted: false };
                    }
                    
                    await prisma.vaga_avaliacao.update({
                        where: { id: app.id },
                        data: {
                            breakdown: JSON.stringify(breakdown)
                        }
                    });

                    processedCount++;
                    console.log(`[CRON] Emails enviados e registro atualizado para o app_id ${app.id}`);
                }
            }
        }

        console.log(`[CRON] Verificação concluída. Processados: ${processedCount}`);
        return NextResponse.json({ success: true, processed: processedCount });

    } catch (error) {
        console.error("[CRON] Erro ao verificar vídeos expirados:", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}
