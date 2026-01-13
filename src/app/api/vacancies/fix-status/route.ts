import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";

// This endpoint adds 'Ativa' status to all vacancies that don't have a status yet
export async function POST() {
    try {
        // Get all vacancy IDs
        const allVacancies = await prisma.vaga.findMany({
            select: { id: true }
        });

        const vacancyIds = allVacancies.map(v => v.id);

        // Get vacancies that already have status
        const existingStatuses = await prisma.vaga_status.findMany({
            where: { vaga_id: { in: vacancyIds } },
            select: { vaga_id: true },
            distinct: ['vaga_id']
        });

        const vacanciesWithStatus = new Set(existingStatuses.map(s => s.vaga_id));

        // Find vacancies without status
        const vacanciesWithoutStatus = vacancyIds.filter(id => !vacanciesWithStatus.has(id));

        if (vacanciesWithoutStatus.length === 0) {
            return NextResponse.json({
                message: "All vacancies already have status",
                count: 0
            });
        }

        // Create 'Ativa' status for all vacancies without status
        await prisma.vaga_status.createMany({
            data: vacanciesWithoutStatus.map(vagaId => ({
                id: randomUUID(),
                vaga_id: vagaId,
                situacao: 'Ativa'
            }))
        });

        return NextResponse.json({
            message: "Status created successfully",
            count: vacanciesWithoutStatus.length,
            vacancyIds: vacanciesWithoutStatus
        });
    } catch (e) {
        console.error("Error creating statuses:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
