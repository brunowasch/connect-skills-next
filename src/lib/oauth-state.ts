import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const OAUTH_STATE_COOKIE = "oauth_state";

export interface OAuthStatePayload {
    tipo: string;
    origin: string;
    nonce: string;
}

function secret(): string {
    const value = process.env.SECRET_SESSION || process.env.JWT_SECRET;
    if (!value) throw new Error("SECRET_SESSION (ou JWT_SECRET) não configurado.");
    return value;
}

function sign(value: string): string {
    return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createOAuthState(tipo: string, origin: string): { state: string; nonce: string } {
    const nonce = randomBytes(16).toString("base64url");
    const payload: OAuthStatePayload = { tipo, origin, nonce };
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
    return { state: `${encoded}.${sign(encoded)}`, nonce };
}

export function verifyOAuthState(
    state: string | null | undefined,
    cookieNonce: string | null | undefined
): OAuthStatePayload | null {
    if (!state || !cookieNonce) return null;

    const separator = state.lastIndexOf(".");
    if (separator <= 0) return null;

    const encoded = state.slice(0, separator);
    const provided = Buffer.from(state.slice(separator + 1));
    const expected = Buffer.from(sign(encoded));

    if (provided.length !== expected.length) return null;
    if (!timingSafeEqual(provided, expected)) return null;

    let payload: OAuthStatePayload;
    try {
        payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    } catch {
        return null;
    }

    const a = Buffer.from(payload.nonce ?? "");
    const b = Buffer.from(cookieNonce);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return payload;
}

export function oauthStateCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 10,
    };
}
