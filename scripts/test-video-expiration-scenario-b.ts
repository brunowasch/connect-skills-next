import { prisma } from '../src/lib/prisma';

async function setScenarioB() {
    try {
        console.log('Configurando Cenário B: Vídeo FORA do prazo (Revisão 4 - Busca Global)...\n');

        const applications = await prisma.vaga_avaliacao.findMany();

        let targetApp = null;
        let breakdown = null;
        let vacancy = null;

        for (const app of applications) {
            const b = typeof app.breakdown === 'string' ? JSON.parse(app.breakdown) : app.breakdown;
            if (b?.video?.status === 'submitted' && !b?.feedback?.status) {
                targetApp = app;
                breakdown = b;
                
                // Buscar a vaga correspondente
                vacancy = await prisma.vaga.findUnique({
                    where: { id: app.vaga_id }
                });

                if (vacancy?.cargo === 'Desenvolvedor Mobile') {
                    targetApp = app;
                    breakdown = b;
                    break;
                }
            }
        }

        if (!targetApp || !vacancy) {
            console.log('Nenhuma aplicação com vídeo pendente de avaliação encontrada.');
            console.log('Por favor, submeta um vídeo em alguma vaga primeiro.\n');
            return;
        }

        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        const expiresAt = new Date(eightDaysAgo);
        expiresAt.setDate(expiresAt.getDate() + 7);

        breakdown.video.submittedAt = eightDaysAgo.toISOString();
        breakdown.video.expiresAt = expiresAt.toISOString();

        await prisma.vaga_avaliacao.update({
            where: { id: targetApp.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        console.log(`\nCenário B configurado para a vaga: ${vacancy.cargo}`);
        console.log(`Participante ID: ${targetApp.candidato_id}`);
        console.log(`O vídeo foi "enviado" em: ${eightDaysAgo.toISOString()}`);
        console.log(`EXPIRADO em: ${expiresAt.toISOString()} (Há 1 dia atrás)`);
        console.log('\nAÇÃO NECESSÁRIA: Vá até o painel da empresa e AVALIE este candidato.');
        console.log('RESULTADO ESPERADO: O vídeo deve ser removido (indisponível na área do candidato) e a análise mantida.');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setScenarioB();
