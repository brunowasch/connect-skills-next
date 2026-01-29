import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditAreas } from "./_components/EditAreas";

export default async function EditAreasPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        include: {
            candidato_area: {
                include: {
                    area_interesse: true
                }
            }
        }
    });

    if (!candidate) {
        redirect("/login");
    }

    const initialAreas = candidate.candidato_area.map((ca: any) => ca.area_interesse.nome || '');

    return <EditAreas initialAreas={initialAreas} />;
}
