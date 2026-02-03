import { Header, Hero, Carousel, About, ClientsSection, CTA, Contact } from "@/src/app/_components/Home/index"
import { Footer } from "@/src/app/_components/Layout/index"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("time_user_id")?.value;

  if (userId) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { tipo: true }
    });

    if (user) {
      if (user.tipo.toLowerCase() === 'candidato') {
        redirect("/candidate/dashboard");
      } else {
        redirect("/company/dashboard");
      }
    }
  }

  return (
    <>
      <Header />
      <main className="pt-[8vh]">
        <Carousel />
        <Hero />
        <About />
        <ClientsSection />
        <CTA />
        <Contact />
        <Footer />
      </main>
    </>
  );
}