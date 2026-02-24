import { prisma } from '../src/lib/prisma';

async function setScenarioA() {
    try {
        console.log('Configurando Cenário A: Vídeo DENTRO do prazo (Revisão 5 - Busca Global)...\n');

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
                
                if (vacancy?.cargo?.toLowerCase().includes('full-stack') || vacancy?.cargo?.toLowerCase().includes('fullstack')) {
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

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const expiresAt = new Date(twoDaysAgo);
        expiresAt.setDate(expiresAt.getDate() + 7); 

        breakdown.video.submittedAt = twoDaysAgo.toISOString();
        breakdown.video.expiresAt = expiresAt.toISOString();

        await prisma.vaga_avaliacao.update({
            where: { id: targetApp.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        console.log(`\nCenário A configurado para a vaga: ${vacancy.cargo}`);
        console.log(`Participante ID: ${targetApp.candidato_id}`);
        console.log(`O vídeo foi "enviado" em: ${twoDaysAgo.toISOString()}`);
        console.log(`Expira originalmente em: ${expiresAt.toISOString()} (Daqui a 5 dias)`);
        console.log('\nAÇÃO NECESSÁRIA: Vá até o painel da empresa e AVALIE este candidato.');
        console.log('RESULTADO ESPERADO: O prazo de expiração deve ser estendido por +7 dias a partir de AGORA.');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setScenarioA();