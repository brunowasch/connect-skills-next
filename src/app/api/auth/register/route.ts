import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/auth/hash";
import { randomUUID } from "crypto";
import { validateEmailFormat, validateEmailDomain } from "@/src/lib/email-validation";
import { sendVerificationEmail } from "@/src/lib/mail";
import { generateVerificationCode } from "@/src/lib/code-generator";

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
        { error: "register_error_missing_fields" },
        { status: 400 }
      );
    }

    // 1.1 Modificação: Validação de formato e existência do email
    if (!validateEmailFormat(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido." },
        { status: 400 }
      );
    }

    // Validação de domínio (MX records)
    const domainValid = await validateEmailDomain(email);
    if (!domainValid) {
      return NextResponse.json(
        { error: "Domínio de email inexistente ou inválido." },
        { status: 400 }
      );
    }

    // 2. Verificação de existência do usuário
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
      include: {
        candidato: {
          include: {
            candidato_area: true
          }
        },
        empresa: true
      }
    });

    if (existingUser) {
      const isCandidateComplete = existingUser.candidato && existingUser.candidato.nome && existingUser.candidato.candidato_area.length > 0;
      const isCompanyComplete = existingUser.empresa && existingUser.empresa.nome_empresa && existingUser.empresa.nome_empresa !== "";
      const isRegistrationComplete = isCandidateComplete || isCompanyComplete;

      if (isRegistrationComplete) {
        return NextResponse.json(
          { error: "register_error_user_exists" },
          { status: 409 }
        );
      } else {
        // Usuário existe mas cadastro não foi completado. Permitimos sobrescrever.
        // Primeiramente limpamos os dados antigos para evitar conflitos ou dados parciais.
        try {
          await prisma.verification_token.deleteMany({
            where: { usuario_id: existingUser.id }
          });

          // Tentamos deletar registros dependentes se existirem
          try {
            await prisma.candidato.delete({ where: { usuario_id: existingUser.id } });
          } catch { }

          try {
            await prisma.empresa.delete({ where: { usuario_id: existingUser.id } });
          } catch { }

          // Deletamos o usuário antigo
          await prisma.usuario.delete({ where: { id: existingUser.id } });

        } catch (cleanupError) {
          console.error("Erro ao limpar usuário incompleto:", cleanupError);
          // Se falhar a limpeza, provavelmente falhará a criação, mas deixamos fluir
        }
      }
    }

    // 3. Preparação de IDs
    const userId = randomUUID();
    const userUuid = randomUUID();
    const hashedPassword = await hashPassword(senha);
    const verificationToken = generateVerificationCode();

    // 4. Transação: Usuário + Perfil Base + Token de Verificação
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          id: userId,
          uuid: userUuid,
          email,
          senha: hashedPassword,
          tipo,
          email_verificado: false,
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

      // Criar token de verificação
      // Usamos any para evitar erro de tipo se o prisma client não estiver atualizado com o modelo
      await (tx as any).verification_token.create({
        data: {
          id: randomUUID(),
          token: verificationToken,
          usuario_id: userId,
          expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        },
      });

      return user;
    });

    // 5. Enviar email de verificação
    const emailSent = await sendVerificationEmail(createdUser.email, verificationToken);

    if (!emailSent) {
      console.error("Falha ao enviar email de verificação para:", createdUser.email);
      // Não falhamos o registro, mas avisamos (ou poderíamos reverter a transação, mas vou manter para permitir reenvio)
    }

    // 6. Retorno de sucesso (alterado para indicar necessidade de verificação)
    const response = NextResponse.json(
      {
        id: createdUser.id,
        email: createdUser.email,
        tipo: createdUser.tipo,
        requiresVerification: true,
        message: "Cadastro realizado com sucesso. Verifique seu email para ativar a conta.",
        redirectTo: "/verify-email-sent" // Nova página sugerida
      },
      { status: 201 }
    );

    // NOTA: NÃO logamos o usuário automaticamente (não setamos o cookie)
    // porque ele precisa verificar o email primeiro.

    return response;

  } catch (err) {
    console.error("Erro no POST /api/auth/register:", err);
    return NextResponse.json(
      { error: "register_error_internal" },
      { status: 500 }
    );
  }
}
