import { Header, Footer } from "@/src/app/_components/Layout/index"
import { RegisterCompany } from "@/src/app/(pages)/company/(register)/register/_components/Register"
import { cookies } from "next/headers"
import { prisma } from "@/src/lib/prisma"

export default async function CompanyName() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    let defaultName = "";

    if (userId) {
        const user = await prisma.empresa.findUnique({
            where: { usuario_id: userId }
        });
        if (user && user.nome_empresa) {
            defaultName = user.nome_empresa;
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex grow items-center justify-center">
                <RegisterCompany initialName={defaultName} />
            </main>
            <Footer />
        </div>
    )
}