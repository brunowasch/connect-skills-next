import { prisma } from '../src/lib/prisma';

async function debugVideoStatus() {
    try {
        console.log('DIAGNÓSTICO DE VÍDEOS NO SISTEMA\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const applications = await prisma.vaga_avaliacao.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        if (applications.length === 0) {
            console.log('Nenhuma aplicação encontrada no sistema.\n');
            return;
        }

        console.log(`Total de aplicações: ${applications.length}\n`);

        let videosSubmitted = 0;
        let videosWithFeedback = 0;
        let videosRequested = 0;
        let noVideo = 0;

        for (const app of applications) {
            // Buscar candidato separadamente
            const candidato = await prisma.candidato.findUnique({
                where: { id: app.candidato_id },
                select: { id: true, nome: true, sobrenome: true }
            });

            // Buscar vaga separadamente
            const vaga = await prisma.vaga.findUnique({
                where: { id: app.vaga_id },
                select: { id: true, cargo: true }
            });

            const candidateName = candidato 
                ? `${candidato.nome || ''} ${candidato.sobrenome || ''}`.trim()
                : 'Desconhecido';
            
            console.log(`\n┌─ Candidato: ${candidateName}`);
            console.log(`│  ID: ${app.candidato_id}`);
            console.log(`│  Vaga: ${vaga?.cargo || 'N/A'}`);
            console.log(`│`);

            let breakdown: any = {};
            try {
                if (app.breakdown) {
                    breakdown = typeof app.breakdown === 'string' 
                        ? JSON.parse(app.breakdown) 
                        : app.breakdown;
                }
            } catch (e) {
                console.log(`│Erro ao parsear breakdown`);
            }

            // Análise do vídeo
            if (breakdown.video) {
                const video = breakdown.video;
                console.log(`│STATUS DO VÍDEO: ${video.status || 'INDEFINIDO'}`);
                
                if (video.status === 'requested') {
                    videosRequested++;
                    console.log(`│ Solicitado em: ${video.requestedAt || 'N/A'}`);
                    console.log(`│ Prazo: ${video.deadline || 'N/A'}`);
                }
                
                if (video.status === 'submitted') {
                    console.log(`│ Enviado em: ${video.submittedAt || 'N/A'}`);
                    console.log(`│ Expira em: ${video.expiresAt || 'N/A'}`);
                    console.log(`│ URL: ${video.url ? 'Presente' : 'Ausente'}`);
                    console.log(`│ FileID: ${video.fileId ? 'Presente' : 'Ausente'}`);
                    
                    if (video.expiresAt) {
                        const expiresAt = new Date(video.expiresAt);
                        const now = new Date();
                        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (daysRemaining > 0) {
                            console.log(`│ Expira em ${daysRemaining} dia(s)`);
                        } else {
                            console.log(`│ EXPIRADO há ${Math.abs(daysRemaining)} dia(s)`);
                        }
                    }
                    
                    if (video.videoRemoved) {
                        console.log(`│ Vídeo foi removido`);
                    }
                    
                    videosSubmitted++;
                }
            } else {
                noVideo++;
                console.log(`│Vídeo: Não solicitado`);
            }

            // Análise do feedback
            if (breakdown.feedback) {
                videosWithFeedback++;
                const feedback = breakdown.feedback;
                console.log(`│`);
                console.log(`│FEEDBACK: ${feedback.status || 'N/A'}`);
                console.log(`│     ├─ Enviado em: ${feedback.sentAt || 'N/A'}`);
                console.log(`│     └─ Justificativa: ${feedback.justification || 'N/A'}`);
            } else {
                console.log(`│`);
                console.log(`│ Feedback:PENDENTE`);
            }

            console.log(`└─────────────────────────────────────────`);
        }

        console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`RESUMO:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`Total de aplicações: ${applications.length}`);
        console.log(`Vídeos solicitados: ${videosRequested}`);
        console.log(`Vídeos enviados: ${videosSubmitted}`);
        console.log(`Vídeos com feedback: ${videosWithFeedback}`);
        console.log(`Sem vídeo: ${noVideo}`);
        
        const videosSubmittedWithoutFeedback = applications.filter(app => {
            const breakdown = typeof app.breakdown === 'string' ? JSON.parse(app.breakdown) : app.breakdown;
            return breakdown?.video?.status === 'submitted' && !breakdown?.feedback?.status;
        }).length;

        console.log(`\n Vídeos submetidos SEM feedback: ${videosSubmittedWithoutFeedback}`);

        if (videosSubmittedWithoutFeedback > 0) {
            console.log(`\n PRONTO PARA TESTAR!`);
            console.log(` Execute um dos scripts:`);
            console.log(`• npx tsx scripts/test-video-expiration-scenario-a.ts`);
            console.log(`• npx tsx scripts/test-video-expiration-scenario-b.ts`);
        } else {
            console.log(`\n PROBLEMA IDENTIFICADO:`);
            if (videosSubmitted === 0) {
                console.log(`Nenhum vídeo foi enviado ainda.`);
                console.log(`Por favor, envie um vídeo através da interface.`);
            } else if (videosSubmitted === videosWithFeedback) {
                console.log(`Todos os vídeos já têm feedback.`);
                console.log(`Solicite e envie um novo vídeo para testar.`);
            }
        }

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugVideoStatus();
