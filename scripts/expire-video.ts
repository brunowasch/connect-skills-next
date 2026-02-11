import { prisma } from '../src/lib/prisma';

async function expireLatestVideo() {
    try {
        const vacancy = await prisma.vaga.findFirst({
            where: {
                cargo: {
                    contains: '' // Type vacancy name here
                }
            }
        });

        if (!vacancy) {
            console.log('Vaga não encontrada');
            return;
        }

        console.log(`Vaga encontrada: ${vacancy.cargo}`);

        const applications = await prisma.vaga_avaliacao.findMany({
            where: {
                vaga_id: vacancy.id,
                breakdown: {
                    contains: '"status":"submitted"'
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (applications.length === 0) {
            console.log('Nenhum vídeo submetido encontrado para esta vaga');
            return;
        }

        console.log(`\nEncontrados ${applications.length} vídeo(s) submetido(s):\n`);

        for (const app of applications) {
            const breakdown = typeof app.breakdown === 'string'
                ? JSON.parse(app.breakdown)
                : app.breakdown;

            const candidato = await prisma.candidato.findUnique({
                where: { id: app.candidato_id },
                select: { nome: true, sobrenome: true }
            });

            const candidateName = candidato
                ? `${candidato.nome || ''} ${candidato.sobrenome || ''}`.trim()
                : 'Desconhecido';

            const submittedAt = breakdown.video?.submittedAt;
            const hasFeedback = breakdown.feedback?.status;

            console.log(`- ${candidateName}`);
            console.log(`Submetido em: ${submittedAt}`);
            console.log(`Feedback: ${hasFeedback || 'Pendente'}`);
            console.log('');
        }

        const targetApp = applications.find(app => {
            const breakdown = typeof app.breakdown === 'string'
                ? JSON.parse(app.breakdown)
                : app.breakdown;
            return !breakdown.feedback?.status;
        });

        if (!targetApp) {
            console.log('Todos os vídeos já têm feedback');
            return;
        }

        const targetCandidato = await prisma.candidato.findUnique({
            where: { id: targetApp.candidato_id },
            select: { nome: true, sobrenome: true }
        });

        const candidateName = targetCandidato
            ? `${targetCandidato.nome || ''} ${targetCandidato.sobrenome || ''}`.trim()
            : 'Desconhecido';

        console.log(`Selecionado vídeo de: ${candidateName}\n`);

        const breakdown = typeof targetApp.breakdown === 'string'
            ? JSON.parse(targetApp.breakdown)
            : targetApp.breakdown;

        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        breakdown.video.submittedAt = eightDaysAgo.toISOString();

        await prisma.vaga_avaliacao.update({
            where: { id: targetApp.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        console.log('Data de submissão alterada com sucesso!');
        console.log(`Nova data: ${eightDaysAgo.toISOString()}`);
        console.log(`Expira em: ${new Date(eightDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()}`);
        console.log('\nO vídeo agora está EXPIRADO e deve acionar o bloqueio da empresa!');
        console.log('\nFaça logout e login novamente para ver o banner de avaliação pendente.');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

expireLatestVideo();
