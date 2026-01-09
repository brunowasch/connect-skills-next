import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Usuário não autenticado" },
                { status: 401 }
            );
        }

        const candidate = await prisma.candidato.findUnique({
            where: {
                usuario_id: userId
            },
            select: {
                nome: true,
                sobrenome: true,
                foto_perfil: true,
                pais: true,
                estado: true,
                cidade: true,
                descricao: true,
                telefone: true,
                data_nascimento: true,
            }
        });

        if (!candidate) {
            return NextResponse.json(
                { error: "Candidato não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("Erro ao buscar informações do candidato:", error);
        return NextResponse.json(
            { error: "Erro ao buscar informações do candidato" },
            { status: 500 }
        );
    }
}