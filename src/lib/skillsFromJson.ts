/**
 * Carrega skills e soft skills a partir dos arquivos JSON locais,
 * buscando os IDs correspondentes no banco de dados.
 *
 * Dessa forma o JSON é a fonte da verdade para exibição/ordenação,
 * enquanto o banco mantém os IDs necessários para as relações.
 */
import { prisma } from "@/src/lib/prisma";
import skillsJson from "@/src/data/skills.json";
import softSkillsJson from "@/src/data/softSkills.json";

export async function getAreasFromJson(): Promise<{ id: number; nome: string }[]> {
    const names = skillsJson.Skills as string[];

    // Busca todos os registros cujos nomes estão no JSON
    const dbRecords = await prisma.area_interesse.findMany({
        where: { nome: { in: names } },
        select: { id: true, nome: true },
    });

    // Cria mapa nome → id para lookup rápido
    const nameToId = new Map<string, number>(
        dbRecords.map((r) => [r.nome as string, r.id])
    );

    // Retorna na mesma ordem do JSON, filtrando os que existem no banco
    return names
        .filter((name) => nameToId.has(name))
        .map((name) => ({ id: nameToId.get(name)!, nome: name }));
}

export async function getSoftSkillsFromJson(): Promise<{ id: number; nome: string }[]> {
    const names = softSkillsJson.softSkills as string[];

    const dbRecords = await prisma.soft_skill.findMany({
        where: { nome: { in: names } },
        select: { id: true, nome: true },
    });

    const nameToId = new Map<string, number>(
        dbRecords.map((r) => [r.nome, r.id])
    );

    return names
        .filter((name) => nameToId.has(name))
        .map((name) => ({ id: nameToId.get(name)!, nome: name }));
}
