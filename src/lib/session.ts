import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/src/lib/prisma";

export const SESSION_COOKIE = "time_user_id";

export type UserType = "CANDIDATO" | "EMPRESA" | "MENTOR";

function getSessionSecret(): string {
    const secret = process.env.SECRET_SESSION || process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "SECRET_SESSION (ou JWT_SECRET) não configurado: impossível assinar a sessão."
        );
    }
    return secret;
}

function sign(value: string): string {
    return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionValue(userId: string): string {
    return `${userId}.${sign(userId)}`;
}

export function parseSessionValue(raw: string | undefined | null): string | null {
    if (!raw) return null;

    const separator = raw.lastIndexOf(".");
    if (separator <= 0) return null;

    const userId = raw.slice(0, separator);
    const providedSignature = raw.slice(separator + 1);
    const expectedSignature = sign(userId);

    const provided = Buffer.from(providedSignature);
    const expected = Buffer.from(expectedSignature);

    if (provided.length !== expected.length) return null;
    if (!timingSafeEqual(provided, expected)) return null;

    return userId;
}

export function sessionCookieOptions(maxAgeSeconds?: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        ...(maxAgeSeconds !== undefined ? { maxAge: maxAgeSeconds } : {}),
    };
}

export async function getSessionUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    return parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getSessionUser() {
    const userId = await getSessionUserId();
    if (!userId) return null;

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true, email: true, tipo: true },
    });

    return user;
}

export class UnauthorizedError extends Error {
    status = 401;
    constructor(message = "Não autorizado.") {
        super(message);
    }
}

export class ForbiddenError extends Error {
    status = 403;
    constructor(message = "Acesso negado.") {
        super(message);
    }
}

export async function requireUser(tipo?: UserType) {
    const user = await getSessionUser();
    if (!user) throw new UnauthorizedError();
    if (tipo && user.tipo.toUpperCase() !== tipo) throw new ForbiddenError();
    return user;
}

export async function requireCandidato() {
    const user = await requireUser();
    const candidato = await prisma.candidato.findUnique({
        where: { usuario_id: user.id },
        select: { id: true, usuario_id: true, nome: true, sobrenome: true },
    });
    if (!candidato) throw new ForbiddenError("Candidato não encontrado.");
    return { user, candidato };
}

export async function requireEmpresa() {
    const user = await requireUser();
    const empresa = await prisma.empresa.findUnique({
        where: { usuario_id: user.id },
        select: { id: true, usuario_id: true, nome_empresa: true },
    });
    if (!empresa) throw new ForbiddenError("Empresa não encontrada.");
    return { user, empresa };
}

export async function requireMentor() {
    const user = await requireUser();
    const mentor = await prisma.mentor.findUnique({
        where: { usuario_id: user.id },
        select: { id: true, usuario_id: true, nome: true, sobrenome: true },
    });
    if (!mentor) throw new ForbiddenError("Mentor não encontrado.");
    return { user, mentor };
}
