import {Header, Hero, Carousel, About, ClientsSection, CTA, Contact} from "@/src/_components/Home/index"
import { Footer } from "@/src/_components/Layout/index"

export default function Home() {
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