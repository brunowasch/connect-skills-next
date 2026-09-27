import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { formatOnsiteAddress } from "@/src/lib/onsite-slot";
import ConfirmOnsiteInterviewClient from "./_components/ConfirmOnsiteInterviewClient";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ConfirmOnsiteInterviewPage({ params }: Props) {
    const { id } = await params;

    const entrevista = await prisma.entrevista_presencial.findUnique({
        where: { id },
        include: { slot: true }
    });

    if (entrevista?.status === "CONFIRMADA" || entrevista?.status === "CONCLUIDA") {
        redirect(`/candidate/interviews/onsite/${id}/details`);
    }

    let vagaTitle = "a vaga";
    let companyName = "Empresa";
    let companyPhoto: string | null = null;
    let formattedDate = "";
    let horaInicio = "";
    let address: { line1: string; line2: string } | null = null;

    if (entrevista) {
        const vaga = await prisma.vaga.findUnique({ where: { id: entrevista.vaga_id } });
        const empresa = await prisma.empresa.findUnique({ where: { id: entrevista.empresa_id } });

        vagaTitle = vaga?.cargo || "a vaga";
        companyName = empresa?.nome_empresa || "Empresa";
        companyPhoto = empresa?.foto_perfil || null;

        const parts = entrevista.slot.data.split("-");
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        horaInicio = entrevista.slot.hora_inicio;
        address = formatOnsiteAddress(entrevista);
    }

    return (
        <ConfirmOnsiteInterviewClient
            entrevistaId={id}
            status={entrevista?.status || "NOT_FOUND"}
            vagaTitle={vagaTitle}
            companyName={companyName}
            companyPhoto={companyPhoto}
            date={formattedDate}
            horaInicio={horaInicio}
            address={address}
        />
    );
}
