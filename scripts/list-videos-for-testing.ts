import { prisma } from '../src/lib/prisma';

async function listVideosForTesting() {
    try {
        console.log('VIDEOS DISPONIVEIS PARA TESTE\n');
        console.log('----------------------------------------\n');

        const applications = await prisma.vaga_avaliacao.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        const videosForTesting = [];

        for (const app of applications) {
            let breakdown: any = {};
            try {
                if (app.breakdown) {
                    breakdown = typeof app.breakdown === 'string' 
                        ? JSON.parse(app.breakdown) 
                        : app.breakdown;
                }
            } catch (e) {
                continue;
            }

            // Verificar se tem vídeo submetido sem feedback
            if (breakdown?.video?.status === 'submitted' && !breakdown?.feedback?.status) {
                const candidato = await prisma.candidato.findUnique({
                    where: { id: app.candidato_id },
                    select: { nome: true, sobrenome: true }
                });

                const vaga = await prisma.vaga.findUnique({
                    where: { id: app.vaga_id },
                    select: { cargo: true }
                });

                const candidateName = candidato 
                    ? `${candidato.nome || ''} ${candidato.sobrenome || ''}`.trim()
                    : 'Desconhecido';

                videosForTesting.push({
                    candidato_id: app.candidato_id,
                    candidato_nome: candidateName,
                    vaga_id: app.vaga_id,
                    vaga_cargo: vaga?.cargo || 'N/A',
                    video: breakdown.video
                });
            }
        }

        if (videosForTesting.length === 0) {
            console.log('Nenhum video disponivel para teste.\n');
            console.log('   Motivos possiveis:');
            console.log('   1. Nenhum video foi enviado');
            console.log('   2. Todos os videos ja tem feedback\n');
            return;
        }

        console.log(`Encontrados ${videosForTesting.length} video(s) disponivel(is) para teste:\n`);

        for (let i = 0; i < videosForTesting.length; i++) {
            const v = videosForTesting[i];
            console.log(`\n${i + 1}. Candidato: ${v.candidato_nome}`);
            console.log(`ID: ${v.candidato_id}`);
            console.log(`Vaga: ${v.vaga_cargo}`);
            console.log(`Vaga ID: ${v.vaga_id}`);
            console.log(`Status do vídeo: ${v.video.status}`);
            console.log(`Enviado em: ${v.video.submittedAt || 'N/A'}`);
            console.log(`Expira em: ${v.video.expiresAt || 'N/A'}`);
            
            if (v.video.expiresAt) {
                const expiresAt = new Date(v.video.expiresAt);
                const now = new Date();
                const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysRemaining > 0) {
                    console.log(`Expira em ${daysRemaining} dia(s)`);
                } else {
                    console.log(`EXPIRADO ha ${Math.abs(daysRemaining)} dia(s)`);
                }
            }
        }


        console.log(`\n----------------------------------------\n`);
        console.log('PROXIMOS PASSOS:\n');
        console.log('Execute um dos scripts de teste:');
        console.log('• Cenario A (dentro do prazo): npx tsx scripts/test-video-expiration-scenario-a.ts');
        console.log('• Cenario B (fora do prazo): npx tsx scripts/test-video-expiration-scenario-b.ts\n');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listVideosForTesting();
