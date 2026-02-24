import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
    console.log("Check-application API route hit at", new Date().toISOString());
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid") || "";
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const vacancy = await prisma.vaga.findUnique({
            where: { uuid: uuid },
            select: { id: true }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
        }

        const id = vacancy.id;

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!candidate) {
            return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: id,
                    candidato_id: candidate.id
                }
            }
        });

        return NextResponse.json({ applied: !!application });

    } catch (error) {
        console.error("Error checking application (uuid:", uuid, "):", error);
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
