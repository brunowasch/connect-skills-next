import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: {
                vaga_favorita: {
                    select: { vaga_id: true }
                }
            }
        });

        if (!candidate) {
            return NextResponse.json([]);
        }

        const favoriteIds = candidate.vaga_favorita.map(f => f.vaga_id);
        return NextResponse.json(favoriteIds);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!candidate) {
            return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        const { vagaId } = await request.json();

        if (!vagaId) {
            return NextResponse.json({ error: "Missing vagaId" }, { status: 400 });
        }

        // Check if already favorited
        const existing = await prisma.vaga_favorita.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vagaId,
                    candidato_id: candidate.id
                }
            }
        });

        if (existing) {
            // Remove from favorites
            await prisma.vaga_favorita.delete({
                where: {
                    id: existing.id
                }
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Add to favorites
            await prisma.vaga_favorita.create({
                data: {
                    id: randomUUID(),
                    vaga_id: vagaId,
                    candidato_id: candidate.id
                }
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
