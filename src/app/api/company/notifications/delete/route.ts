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

        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        // Buscar empresa
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

        const parts = notificationId.split('_');
        const applicationId = parts.pop();
        const type = parts.join('_');

        if (!applicationId) {
             return NextResponse.json(
                { error: "Invalid notification ID" },
                { status: 400 }
            );
        }

        const application = await prisma.vaga_avaliacao.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
             return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        const vaga = await prisma.vaga.findUnique({
            where: { id: application.vaga_id }
        });

        if (!vaga || vaga.empresa_id !== company.id) {
             return NextResponse.json(
                { error: "Application not found or unauthorized" },
                { status: 404 }
            );
        }

        let breakdown: any = {};
        try {
            breakdown = application.breakdown ? JSON.parse(application.breakdown as string) : {};
        } catch (e) {
            breakdown = {};
        }

        if (!breakdown.company_notifications) {
            breakdown.company_notifications = {};
        }

        if (type === 'new_candidate') {
            if (!breakdown.company_notifications.new_candidate) breakdown.company_notifications.new_candidate = {};
            breakdown.company_notifications.new_candidate.deleted = true;
        } else if (type === 'video_received') {
             if (!breakdown.company_notifications.video_received) breakdown.company_notifications.video_received = {};
            breakdown.company_notifications.video_received.deleted = true;
        } else if (type === 'video_expired_unsubmitted') {
             if (!breakdown.company_notifications.video_expired_unsubmitted) breakdown.company_notifications.video_expired_unsubmitted = {};
            breakdown.company_notifications.video_expired_unsubmitted.deleted = true;
        }

        await prisma.vaga_avaliacao.update({
            where: { id: application.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting company notification:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
