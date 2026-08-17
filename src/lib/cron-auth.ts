import { timingSafeEqual } from "crypto";

export function isAuthorizedCronRequest(req: Request): boolean {
    const expected = process.env.CRON_SECRET;
    if (!expected) return false;

    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const provided = bearer ?? req.headers.get("x-cron-secret");

    if (!provided) return false;

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;

    return timingSafeEqual(a, b);
}
