"use server";

import { prisma } from "@/src/lib/prisma";
import { sendPasswordResetCodeEmail } from "@/src/lib/mail";
import { hashPassword } from "@/src/lib/auth/hash";
import { generateVerificationCode } from "@/src/lib/code-generator";

export async function requestPasswordReset(email: string) {
    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: true, message: "Se o e-mail estiver cadastrado, você receberá um código de recuperação." };
        }
        
        await prisma.password_reset_token.deleteMany({
            where: { usuario_id: user.id }
        });

        let code = generateVerificationCode(6);
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 3) {
            const existing = await prisma.password_reset_token.findUnique({ where: { token: code } });
            if (!existing) {
                isUnique = true;
            } else {
                code = generateVerificationCode(6);
                attempts++;
            }
        }

        if (!isUnique) {
             return { success: false, error: "Erro ao gerar código. Tente novamente." };
        }

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);    

        await prisma.password_reset_token.create({
            data: {
                token: code,
                usuario_id: user.id,
                expires_at: expiresAt,
            },
        });

        const emailSent = await sendPasswordResetCodeEmail(email, code);

        if (!emailSent) {
            return { success: false, error: "Erro ao enviar e-mail. Tente novamente mais tarde." };
        }

        return { success: true, message: "Código enviado com sucesso!" };

    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function verifyResetCode(email: string, code: string) {
    try {
        if (!email || !code) return { success: false, error: "Email e código são obrigatórios." };

        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return { success: false, error: "Email inválido." };

        const resetToken = await prisma.password_reset_token.findFirst({
            where: {
                token: code,
                usuario_id: user.id
            }
        });

        if (!resetToken) {
            return { success: false, error: "Código inválido." };
        }

        if (new Date() > resetToken.expires_at) {
            return { success: false, error: "Código expirado." };
        }

        return { success: true, message: "Código válido." };
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return { success: false, error: "Erro ao verificar código." };
    }
}

export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return { success: false, error: "Usuário não encontrado." };

        const resetToken = await prisma.password_reset_token.findFirst({
            where: { 
                token: code,
                usuario_id: user.id
            }
        });

        if (!resetToken) {
            return { success: false, error: "Código inválido ou expirado." };
        }

        if (new Date() > resetToken.expires_at) {
            await prisma.password_reset_token.delete({ where: { id: resetToken.id } }); 
            return { success: false, error: "Código expirado. Solicite um novo." };
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.usuario.update({
            where: { id: user.id },
            data: { senha: hashedPassword },
        });

        await prisma.password_reset_token.delete({
            where: { id: resetToken.id },
        });

        return { success: true, message: "Senha redefinida com sucesso!" };

    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return { success: false, error: "Erro ao redefinir senha." };
    }
}
