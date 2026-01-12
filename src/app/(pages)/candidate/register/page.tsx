import { Header, Footer } from "@/src/app/_components/Layout";
import { RegisterCandidateName } from "@/src/app/(pages)/candidate/register/_components/Register";

export default function CandidateFullName() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex grow items-center justify-center">
        <RegisterCandidateName />
      </main>
      <Footer />
    </div>
  );
}
