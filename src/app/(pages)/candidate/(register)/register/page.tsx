import { Header, Footer } from "@/src/app/_components/Layout";
import { RegisterCandidateName } from "@/src/app/(pages)/candidate/(register)/register/_components/Register";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export default async function CandidateFullName() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("time_user_id")?.value;

  let defaultName = "";
  let defaultSurname = "";

  if (userId) {
    const user = await prisma.candidato.findUnique({
      where: { usuario_id: userId }
    });
    if (user) {
      defaultName = user.nome || "";
      defaultSurname = user.sobrenome || "";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex grow items-center justify-center">
        <RegisterCandidateName initialName={defaultName} initialSurname={defaultSurname} />
      </main>
      <Footer />
    </div>
  );
}
