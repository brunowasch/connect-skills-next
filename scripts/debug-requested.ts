import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("=== Resetando flags para novo teste ===");

    // Reseta apps sem deadline (não tinham quando foram criados)
    const apps = await prisma.vaga_avaliacao.findMany({
        where: {
            breakdown: {
                contains: '"status":"requested"'
            }
        }
    });

    for (const app of apps) {
        if (!app.breakdown) continue;
        const bd = JSON.parse(app.breakdown as string);
        if (bd?.video?.status !== 'requested') continue;

        let changed = false;

        // Reseta flag de email já enviado
        if (bd?.video?.expiredEmailSent) {
            bd.video.expiredEmailSent = false;
            changed = true;
        }

        // Se não tem deadline, define o deadline no passado (vencido)
        if (!bd?.video?.deadline) {
            const past = new Date();
            past.setSeconds(past.getSeconds() - 10);
            bd.video.deadline = past.toISOString();
            changed = true;
        } else {
            // Se tem deadline mas já foi enviado, coloca no passado
            const past = new Date();
            past.setSeconds(past.getSeconds() - 10);
            bd.video.deadline = past.toISOString();
            changed = true;
        }

        if (changed) {
            await prisma.vaga_avaliacao.update({
                where: { id: app.id },
                data: { breakdown: JSON.stringify(bd) }
            });
            const candidato = await prisma.candidato.findUnique({where: {id: app.candidato_id}, select: {nome: true}});
            console.log(`Resetado: App ${app.id} - Candidato: ${candidato?.nome}`);
        }
    }

    console.log("\nPronto! Agora chame: curl http://localhost:3000/api/cron/video-expiration");
}

main().catch(console.error).finally(() => prisma.$disconnect());
