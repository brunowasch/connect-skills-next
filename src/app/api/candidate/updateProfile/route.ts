import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const { nome, sobrenome, localidade, ddd, numero, descricao, links, fotoPerfil } = data;

        // Processar localidade (separar cidade e estado se possível)
        let cidade = "";
        let estado = "";
        if (localidade && localidade.includes(",")) {
            const parts = localidade.split(",");
            cidade = parts[0].trim();
            estado = parts[1].trim();
        } else {
            cidade = localidade;
        }

        const telefone = `${ddd}${numero}`.replace(/\D/g, "");

        // Atualizar candidato
        await prisma.candidato.update({
            where: { usuario_id: userId },
            data: {
                nome,
                sobrenome,
                cidade,
                estado,
                telefone,
                descricao,
                foto_perfil: fotoPerfil
            }
        });


        // Atualizar links
        // Primeiro remove os antigos (estratégia simples)
        await prisma.candidato_link.deleteMany({
            where: { candidato: { usuario_id: userId } }
        });

        // Pega o ID do candidato
        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (candidate && links && links.length > 0) {
            const linksToInsert = links
                .filter((l: any) => l.url.trim() !== "")
                .map((l: any, index: number) => ({
                    id: crypto.randomUUID(),
                    candidato_id: candidate.id,
                    label: "Link", // Ou extrair o domínio como label
                    url: l.url,
                    ordem: index
                }));

            if (linksToInsert.length > 0) {
                await prisma.candidato_link.createMany({
                    data: linksToInsert
                });
            }
        }

        revalidatePath("/pages/candidate/candidateApp/dashboard", "page");
        revalidatePath("/pages/candidate/candidateApp/profile", "page");

        return NextResponse.json({ message: "Perfil atualizado com sucesso" });
    } catch (error: any) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json({ error: "Erro interno ao atualizar perfil" }, { status: 500 });
    }
}
