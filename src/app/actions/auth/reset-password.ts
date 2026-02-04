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
            return { success: true, message: "recovery_code_sent_if_exists" };
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
            return { success: false, error: "error_generating_code" };
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
            return { success: false, error: "error_sending_email" };
        }

        return { success: true, message: "code_sent_success" };

    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        return { success: false, error: "internal_server_error" };
    }
}

export async function verifyResetCode(email: string, code: string) {
    try {
        if (!email || !code) return { success: false, error: "email_code_required" };

        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return { success: false, error: "email_invalid" };

        const resetToken = await prisma.password_reset_token.findFirst({
            where: {
                token: code,
                usuario_id: user.id
            }
        });

        if (!resetToken) {
            return { success: false, error: "invalid_code" };
        }

        if (new Date() > resetToken.expires_at) {
            return { success: false, error: "code_expired" };
        }

        return { success: true, message: "code_valid" };
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return { success: false, error: "error_verifying_code" };
    }
}

export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return { success: false, error: "user_not_found" };

        const resetToken = await prisma.password_reset_token.findFirst({
            where: {
                token: code,
                usuario_id: user.id
            }
        });

        if (!resetToken) {
            return { success: false, error: "invalid_or_expired_code" };
        }

        if (new Date() > resetToken.expires_at) {
            await prisma.password_reset_token.delete({ where: { id: resetToken.id } });
            return { success: false, error: "code_expired_new" };
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.usuario.update({
            where: { id: user.id },
            data: { senha: hashedPassword },
        });

        await prisma.password_reset_token.delete({
            where: { id: resetToken.id },
        });

        return { success: true, message: "password_reset_success" };

    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return { success: false, error: "password_reset_error" };
    }
}
