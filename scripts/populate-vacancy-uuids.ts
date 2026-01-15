import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

async function populateVagaUUIDs() {
    try {
        console.log('Iniciando população de UUIDs para vagas...');

        // Buscar todas as vagas sem UUID
        const vagasSemUUID = await prisma.vaga.findMany({
            where: {
                uuid: null
            },
            select: {
                id: true
            }
        });

        console.log(`Encontradas ${vagasSemUUID.length} vagas sem UUID.`);

        // Atualizar cada vaga com um UUID único
        for (const vaga of vagasSemUUID) {
            await prisma.vaga.update({
                where: { id: vaga.id },
                data: { uuid: randomUUID() }
            });
        }

        console.log(`${vagasSemUUID.length} vagas atualizadas com sucesso!`);

        // Verificar
        const totalComUUID = await prisma.vaga.count({
            where: {
                uuid: { not: null }
            }
        });

        console.log(`Total de vagas com UUID: ${totalComUUID}`);

    } catch (error) {
        console.error('Erro ao popular UUIDs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateVagaUUIDs();
