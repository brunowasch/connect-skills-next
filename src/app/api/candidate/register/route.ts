import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

import { cookies } from "next/headers";

interface RegisterCandidate {
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  usuario_id?: string;
  consentimento_parental?: boolean;
}

export async function POST(req: Request) {
  try {
    const body: RegisterCandidate = await req.json();
    const { nome, sobrenome, data_nascimento, usuario_id, consentimento_parental } = body;

    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get("time_user_id")?.value;

    const finalUserId = userIdFromCookie || usuario_id;

    // 1. Validação básica de campos obrigatórios
    if (!nome || !data_nascimento || !finalUserId) {
      return NextResponse.json(
        { error: "Dados do candidato ausentes: nome, data_nascimento ou usuario_id." },
        { status: 400 }
      );
    }

    // 2. Validação de Idade Server-Side
    const birthDate = new Date(data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Bloqueia se for menor de 16 anos
    if (age < 16) {
      return NextResponse.json(
        { error: "Você precisa ter pelo menos 16 anos para se cadastrar." },
        { status: 400 }
      );
    }

    // Valida consentimento parental para menores entre 16 e 18 anos
    if (age >= 16 && age < 18) {
      if (!consentimento_parental) {
        return NextResponse.json(
          { error: "É necessário confirmar o consentimento do responsável legal." },
          { status: 400 }
        );
      }
    }

    // 3. Criação do candidato
    const result = await prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      const candidate = await tx.candidato.update({
        where: { usuario_id: finalUserId },
        data: {
          nome,
          sobrenome,
          data_nascimento: birthDate,
          consentimento_parental: (age < 18) ? (consentimento_parental ?? false) : false,
        },
      });

      return candidate;
    });

    // 4. Retorno de sucesso
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar candidato." },
      { status: 500 }
    );
  }
}
