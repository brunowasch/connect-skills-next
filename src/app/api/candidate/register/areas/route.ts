import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

import { cookies } from "next/headers";

interface RegisterArea {
    id: number;
    nome: string;
    usuario_id?: string;
}

export async function POST(req: Request) {
    try {
        const body: RegisterArea = await req.json();
        const { nome, usuario_id } = body;

        const cookieStore = await cookies();
        const userIdFromCookie = cookieStore.get("time_user_id")?.value;
        const finalUserId = userIdFromCookie || usuario_id;

        // 1. Validação
        if (!nome || !finalUserId) {
            return NextResponse.json(
                { error: "Dados inválidos. 'nome' e 'usuario_id' são obrigatórios." },
                { status: 400 }
            );
        }

        // 2. Buscar o Candidato
        const candidato = await prisma.candidato.findUnique({
            where: { usuario_id: finalUserId as any },
        });

        if (!candidato) {
            return NextResponse.json(
                { error: "Candidato não encontrado." },
                { status: 404 }
            );
        }

        // 3. Buscar ou Criar a Área de Interesse
        const areaInteresse = await prisma.area_interesse.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });

        // 4. Criar vínculo (Candidato > Área)
        const result = await prisma.candidato_area.create({
            data: {
                candidato_id: candidato.id,
                area_interesse_id: areaInteresse.id,
            },
        });

        // 5. Retorno de sucesso
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Erro ao registrar área:", error);
        // Verificar se é erro de duplicidade (código P2002)
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ message: "Área já vinculada a este candidato." }, { status: 200 });
        }
        return NextResponse.json(
            { error: "Erro ao processar solicitação." },
            { status: 500 }
        );
    }
}
