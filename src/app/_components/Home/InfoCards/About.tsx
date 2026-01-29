"use client";

import { FeatureCard } from "./FeatureCards";
import { useTranslation } from "react-i18next";

import {
  HiIdentification,
  HiUsers,
  HiShieldCheck,
  HiOutlineChip,
} from "react-icons/hi";

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="h-full rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                {t("about_why")}
              </h2>
              <p className="text-gray-600">
                {t("about_desc")}
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="lg:col-span-8 cursor-pointer">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureCard
                icon={<HiIdentification />}
                title={t("about_card1_title")}
                text={t("about_card1_text")}
              />
              <FeatureCard
                icon={<HiUsers />}
                title={t("about_card2_title")}
                text={t("about_card2_text")}
              />
              <FeatureCard
                icon={<HiShieldCheck />}
                title={t("about_card3_title")}
                text={t("about_card3_text")}
              />

              <FeatureCard
                icon={<HiOutlineChip />}
                title={t("about_card4_title")}
                text={t("about_card4_text")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}