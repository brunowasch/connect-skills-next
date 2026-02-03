
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateVerificationCode } from "@/src/lib/code-generator";
import { sendVerificationEmail } from "@/src/lib/mail";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "register_error_missing_fields" },
                { status: 400 }
            );
        }

        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.email_verificado) {
            return NextResponse.json(
                { error: "Email already verified" },
                { status: 400 }
            );
        }

        // Gera novo token
        const verificationToken = generateVerificationCode();

        // Salva novo token no banco
        // Usamos (prisma as any) para evitar erro de tipo caso o client não esteja atualizado

        // Vamos remover os antigos para não poluir o banco
        await (prisma as any).verification_token.deleteMany({
            where: { usuario_id: user.id }
        });

        await (prisma as any).verification_token.create({
            data: {
                id: randomUUID(),
                token: verificationToken,
                usuario_id: user.id,
                expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
            },
        });

        const emailSent = await sendVerificationEmail(user.email, verificationToken);

        if (!emailSent) {
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Code resent successfully" });

    } catch (error) {
        console.error("Error resending code:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
