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
        }
    });

    if (!mentor) {
        notFound();
    }

    const localidade = mentor.cidade && mentor.estado
        ? `${mentor.cidade} - ${mentor.estado}, ${mentor.pais || "Brasil"}`
        : mentor.cidade || mentor.estado || null;

    const mentorSerialized = JSON.parse(JSON.stringify(mentor));

    return (
        <div className="container mx-auto px-4 py-8">
            <PublicMentorProfile
                mentor={mentorSerialized}
                localidade={localidade}
            />
        </div>
    );
}
