
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                candidato: true,
                empresa: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            if (user.tipo === "CANDIDATO" && user.candidato) {
                const candidatoId = user.candidato.id;

                // Delete candidate relations
                await tx.candidato_area.deleteMany({ where: { candidato_id: candidatoId } });
                await tx.candidato_arquivo.deleteMany({ where: { candidato_id: candidatoId } });
                await tx.candidato_link.deleteMany({ where: { candidato_id: candidatoId } });
                await tx.vaga_favorita.deleteMany({ where: { candidato_id: candidatoId } });
                await tx.vaga_avaliacao.deleteMany({ where: { candidato_id: candidatoId } });

                // Delete candidate
                await tx.candidato.delete({ where: { id: candidatoId } });
            } else if (user.tipo === "EMPRESA" && user.empresa) {
                const empresaId = user.empresa.id;

                // Delete company relations
                await tx.vaga.deleteMany({ where: { empresa_id: empresaId } });
                await tx.empresa_arquivo.deleteMany({ where: { empresa_id: empresaId } });
                await tx.empresa_link.deleteMany({ where: { empresa_id: empresaId } });

                // Delete company
                await tx.empresa.delete({ where: { id: empresaId } });
            }

            // Delete authentication tokens if any
            try {
                await (tx as any).verification_token.deleteMany({ where: { usuario_id: userId } });
            } catch (e) {
                // Ignore if table doesn't exist
            }

            // Delete user
            await tx.usuario.delete({ where: { id: userId } });
        });

        // Clear auth cookie
        cookieStore.delete("time_user_id");

        return NextResponse.json({ message: "Conta excluída com sucesso" });
    } catch (error: any) {
        console.error("Erro ao excluir conta:", error);
        return NextResponse.json({ error: "Erro ao excluir conta." }, { status: 500 });
    }
}
