"use client";

import { ClientLogoCard } from "./ClientLogoCard";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export function ClientsSection() {
  const { t } = useTranslation();

  return (
    <>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-2 text-2xl font-semibold">
                  {t("clients_title")}
                </h2>

                <p className="mb-4 text-gray-600">
                  {t("clients_desc")}
                </p>

                <hr className="my-4" />

                <p className="mb-1 font-semibold text-gray-800">
                  {t("clients_want_to_be")}
                </p>

                <a
                  href="https://wa.me/5551992179330"
                  target="_blank"
                  className="flex items-center gap-2 font-semibold text-green-600 hover:underline"
                >
                  <FaWhatsapp className="text-xl" />
                  +55 51 99217-9330
                </a>
              </div>
            </div>

            {/* Clientes */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap justify-center gap-6">
                <ClientLogoCard
                  name="Folk Uniformes"
                  image="/img/clients/FOLK.png"
                />

                <ClientLogoCard
                  name="Stadyo"
                  image="/img/clients/STADYO.jpeg"
                />

                <ClientLogoCard
                  name="Plant.a.Buck"
                  image="/img/clients/Plant.a.Buck.jpeg"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
