import { prisma } from "@/src/lib/prisma";
import { formatOnsiteAddress } from "@/src/lib/onsite-slot";
import OnsiteInterviewDetailsClient from "./_components/OnsiteInterviewDetailsClient";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function OnsiteInterviewDetailsPage({ params }: Props) {
    const { id } = await params;

    const entrevista = await prisma.entrevista_presencial.findUnique({
        where: { id },
        include: { slot: true }
    });

    let vagaTitle = "a vaga";
    let companyName = "Empresa";
    let companyPhoto: string | null = null;
    let formattedDate = "";
    let horaInicio = "";
    let address: { line1: string; line2: string } | null = null;
    let codigo = "";

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
        codigo = (entrevista as any).codigo_participacao || "";
    }

    return (
        <OnsiteInterviewDetailsClient
            entrevistaId={id}
            status={entrevista?.status || "NOT_FOUND"}
            vagaTitle={vagaTitle}
            companyName={companyName}
            companyPhoto={companyPhoto}
            date={formattedDate}
            horaInicio={horaInicio}
            address={address}
            codigo={codigo}
            candidatoCompareceu={(entrevista as any)?.candidato_compareceu || false}
        />
    );
}
