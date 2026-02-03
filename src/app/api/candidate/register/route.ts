import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

interface RegisterCandidate {
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  usuario_id: string;
}

export async function POST(req: Request) {
  try {
    const body: RegisterCandidate = await req.json();
    const { nome, sobrenome, data_nascimento, usuario_id } = body;

    // 1. Validação básica de campos obrigatórios
    if (!nome || !sobrenome || !data_nascimento || !usuario_id) {
      return NextResponse.json(
        { error: "Dados do candidato ausentes." },
        { status: 400 }
      );
    }

    // 2. Criação do candidato
    const result = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidato.update({
        where: { usuario_id: usuario_id },
        data: {
          id: crypto.randomUUID(),
          usuario_id,
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
