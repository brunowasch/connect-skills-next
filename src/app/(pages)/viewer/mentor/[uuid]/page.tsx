import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { PublicMentorProfile } from "./_components/PublicMentorProfile";

export default async function MentorPublicProfilePage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    const mentor = await prisma.mentor.findUnique({
        where: { uuid },
        include: {
            mentor_area: {
                include: { area_interesse: true }
            },
            mentor_link: {
                orderBy: { ordem: "asc" }
            },
            mentor_arquivo: {
                orderBy: { criadoEm: "desc" }
            },
            mentor_disponibilidade: {
                orderBy: [{ data: "asc" }, { hora_inicio: "asc" }]
            },
        }
    });

    if (!mentor) {
        notFound();
    }

    const localidade = mentor.cidade && mentor.estado
        ? `${mentor.cidade} - ${mentor.estado}, ${mentor.pais || "Brasil"}`
        : mentor.cidade || mentor.estado || null;

    const now = new Date();
    const slots = ((mentor as any).mentor_disponibilidade || [])
        .filter((slot: any) => {
            if (slot.status === "CONCLUIDA") return false;
            try {
                const [year, month, day] = slot.data.split("-").map(Number);
                const [h, m] = slot.hora_fim.split(":").map(Number);
                const slotEnd = new Date(year, month - 1, day, h, m, 0);
                return slotEnd > now;
            } catch { return true; }
        })
        .map((slot: any) => ({
            id: slot.id,
            data: slot.data,
            hora_inicio: slot.hora_inicio,
            hora_fim: slot.hora_fim,
            tipo: slot.tipo || null,
            status: slot.status || null,
        }));

    const mentorSerialized = JSON.parse(JSON.stringify(mentor));

    return (
        <div className="container mx-auto px-4 py-8">
            <PublicMentorProfile
                mentor={mentorSerialized}
                localidade={localidade}
                slots={slots}
            />
        </div>
    );
}
