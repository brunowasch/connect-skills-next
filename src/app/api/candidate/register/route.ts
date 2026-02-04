import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

import { cookies } from "next/headers";

interface RegisterCandidate {
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  usuario_id?: string; 
}

export async function POST(req: Request) {
  try {
    const body: RegisterCandidate = await req.json();
    const { nome, sobrenome, data_nascimento, usuario_id } = body;

    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get("time_user_id")?.value;

    const finalUserId = userIdFromCookie || usuario_id;

    // 1. Validação básica de campos obrigatórios
    if (!nome || !sobrenome || !data_nascimento || !finalUserId) {
      return NextResponse.json(
        { error: "Dados do candidato ausentes: nome, sobrenome, data_nascimento ou usuario_id." },
        { status: 400 }
      );
    }

    // 2. Criação do candidato
    const result = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidato.update({
        where: { usuario_id: finalUserId },
        data: {
          nome,
          sobrenome,
          data_nascimento: new Date(data_nascimento),
        },
      });

      return candidate;
    });



    // 3. Retorno de sucesso
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar candidato." },
      { status: 500 }
    );
  }
}
