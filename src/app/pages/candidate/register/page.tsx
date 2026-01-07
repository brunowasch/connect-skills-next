import { Header, Footer } from "@/src/_components/Layout";
import { RegisterCandidateName } from "@/src/_components/Candidates/Register/Register";

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
