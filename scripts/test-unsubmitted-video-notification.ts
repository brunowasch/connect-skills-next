import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("=== Setup Teste: Notificação de Vídeo Não Enviado no Prazo ===");

    const VAGA_NOME = '';

    let vagaFiltro: any = {};
    if (VAGA_NOME) {
        const vagaBuscada = await prisma.vaga.findFirst({
            where: { cargo: { contains: VAGA_NOME } }
        });
        if (!vagaBuscada) {
            console.log(`Vaga contendo '${VAGA_NOME}' não encontrada.`);
            return;
        }
        vagaFiltro = { vaga_id: vagaBuscada.id };
    }

    const apps = await prisma.vaga_avaliacao.findMany({
        where: {
            ...vagaFiltro,
            breakdown: {
                contains: 'requested'
            }
        }
    });

    const app = apps.find(a => {
        if (!a.breakdown) return false;
        try {
            const parsed = JSON.parse(a.breakdown as string);
            return parsed?.video?.status === 'requested';
        } catch (e) {
            return false;
        }
    });

    if (!app) {
        console.log("Nenhuma aplicação encontrada com vídeo solicitado ('requested')" + (VAGA_NOME ? ` para a vaga '${VAGA_NOME}'` : '') + ".");
        console.log("Por favor, solicite um vídeo de um candidato pela plataforma primeiro.");
        return;
    }

    const breakdown = app.breakdown ? JSON.parse(app.breakdown as string) : {};

    const pastDate = new Date();
    pastDate.setSeconds(pastDate.getSeconds() - 10);

    breakdown.video.deadline = pastDate.toISOString();

    if (breakdown.company_notifications?.video_expired_unsubmitted) {
        breakdown.company_notifications.video_expired_unsubmitted.deleted = false;
        breakdown.company_notifications.video_expired_unsubmitted.read = false;
    }

    await prisma.vaga_avaliacao.update({
        where: { id: app.id },
        data: {
            breakdown: JSON.stringify(breakdown)
        }
    });

    const vaga = await prisma.vaga.findUnique({
        where: { id: app.vaga_id },
        select: { cargo: true }
    });

    const candidato = await prisma.candidato.findUnique({
        where: { id: app.candidato_id },
        select: { nome: true }
    });

    console.log(`Aplicação ID: ${app.id}`);
    console.log(`Vaga: ${vaga?.cargo}`);
    console.log(`Candidato: ${candidato?.nome}`);
    console.log(`Status do vídeo mantido como: 'requested'`);
    console.log(`Prazo (deadline) alterado para: ${pastDate.toLocaleString()}`);
    console.log(`\nAgora você pode acessar o painel da empresa associada a esta vaga e verificar se a notificação 'Vídeo Não Enviado no Prazo' aparece no dropdown de notificações.`);

    console.log("\n[TESTE] Disparando Endpoint de Cron de Emails...");
    try {
        const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/cron/video-expiration`);
        const data = await response.json();
        console.log("Resultado da Cron:", data);
    } catch (err) {
        console.error("Falha ao chamar a cron route localmente:", err?.toString());
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
