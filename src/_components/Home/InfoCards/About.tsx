import { FeatureCard } from "./FeatureCards";

import {
  HiIdentification,
  HiUsers,
  HiShieldCheck,
  HiOutlineChip,
} from "react-icons/hi";

export function About() {
  return (
    <section id="about" className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="h-full rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                Por que usar o Connect Skills?
              </h2>
              <p className="text-gray-600">
                Mais agilidade para encontrar vagas compatíveis, destacar suas
                soft skills e se posicionar no mercado com segurança.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="lg:col-span-8 cursor-pointer">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureCard
                icon={<HiIdentification />}
                title="Perfil personalizado"
                text="Mostre suas experiências, habilidades e interesses de forma detalhada."
              />
              <FeatureCard
                icon={<HiUsers />}
                title="Conexão rápida"
                text="Encontre empresas e talentos compatíveis."
              />
              <FeatureCard
                icon={<HiShieldCheck />}
                title="Soft skills"
                text="Foco em compatibilidade real."
              />

              <FeatureCard
                icon={<HiOutlineChip />}
                title="IA treinada"
                text="Conecta candidatos e empresas às vagas ideais."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}