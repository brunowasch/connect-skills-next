import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

interface RegisterCompany {
    nome: string;
    descricao: string;
    usuario_id: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: RegisterCompany = await request.json();
        const { nome, descricao, usuario_id } = body;

        if (!nome || !descricao || !usuario_id) {
            return NextResponse.json(
                { error: "Dados da empresa ausentes." },
                { status: 400 }
            );
        }

        const company = await prisma.empresa.update({
            where: {
                usuario_id,
            },
            data: {
                nome_empresa: nome,
                descricao,
            }
        });



        return NextResponse.json(company, { status: 200 });
    } catch (error) {
        console.error("Erro ao registrar empresa:", error);
        return NextResponse.json(
            { error: "Erro ao registrar empresa." },
            { status: 500 }
        );
    }
}