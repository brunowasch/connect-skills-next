import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando limpeza de arquivos .mp4 indevidos do perfil...");
    const files = await prisma.candidato_arquivo.deleteMany({
        where: {
            nome: {
                contains: '.mp4'
            }
        }
    });
    console.log(`Foram deletados ${files.count} arquivos de vídeos que estavam no perfil.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
