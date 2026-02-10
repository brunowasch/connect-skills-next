import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        // 1. Find all vacancies for this company
        const vacancies = await prisma.vaga.findMany({
            where: { empresa_id: company.id },
            select: { id: true }
        });

        const vacancyIds = vacancies.map(v => v.id);

        if (vacancyIds.length === 0) {
             return NextResponse.json({ success: true });
        }

        // 2. Find all applications
        const applications = await prisma.vaga_avaliacao.findMany({
            where: { vaga_id: { in: vacancyIds } }
        });

        // 3. Mark all relevant notifications as deleted
        for (const app of applications) {
            let breakdown: any = {};
            try {
                breakdown = app.breakdown ? JSON.parse(app.breakdown as string) : {};
            } catch (e) {
                breakdown = {};
            }

            if (!breakdown.company_notifications) {
                breakdown.company_notifications = {};
            }

            // Mark new_candidate as deleted
            if (!breakdown.company_notifications.new_candidate) breakdown.company_notifications.new_candidate = {};
            breakdown.company_notifications.new_candidate.deleted = true;

             // Mark video_received as deleted
            if (!breakdown.company_notifications.video_received) breakdown.company_notifications.video_received = {};
            breakdown.company_notifications.video_received.deleted = true;

            await prisma.vaga_avaliacao.update({
                where: { id: app.id },
                data: {
                    breakdown: JSON.stringify(breakdown)
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error clearing company notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
