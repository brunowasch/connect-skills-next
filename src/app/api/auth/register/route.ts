import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/auth/hash";
import { randomUUID } from "crypto";

interface RegisterRequest {
  email: string;
  senha: string;
  tipo: "CANDIDATO" | "EMPRESA";
}

export async function POST(req: Request) {
  try {
    const body: RegisterRequest = await req.json();
    const { email, senha, tipo } = body;

    // 1. Validação básica de campos obrigatórios
    if (!email || !senha || !tipo) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes." },
        { status: 400 }
      );
    }

    // 2. Verificação de existência do usuário
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já cadastrado." },
        { status: 409 }
      );
    }

    // 3. Preparação de IDs
    const userId = randomUUID();
    const userUuid = randomUUID();
    const hashedPassword = await hashPassword(senha);

    // 4. Transação: Usuário + Perfil Base
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          id: userId,
          uuid: userUuid,
          email,
          senha: hashedPassword,
          tipo,
        },
      });

      if (tipo === "CANDIDATO") {
        await tx.candidato.create({
          data: {
            id: randomUUID(),
            uuid: randomUUID(),
            usuario_id: userId,
          },
        });
      } else if (tipo === "EMPRESA") {
        await tx.empresa.create({
          data: {
            id: randomUUID(),
            uuid: randomUUID(),
            usuario_id: userId,
            nome_empresa: "",
            descricao: "",
          },
        });
      }

      return user;
    });

    // 5. Retorno de sucesso
    const response = NextResponse.json(
      {
        id: createdUser.id,
        email: createdUser.email,
        tipo: createdUser.tipo,
        redirectTo: tipo.toLocaleLowerCase() === 'candidato' ? "/candidate/register" : "/company/register"
      },
      { status: 201 }
    );

    // 6. Cookies de autenticação
    response.cookies.set("time_user_id", createdUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/"
    })

    return response;

  } catch (err) {
    console.error("Erro no POST /api/auth/register:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
