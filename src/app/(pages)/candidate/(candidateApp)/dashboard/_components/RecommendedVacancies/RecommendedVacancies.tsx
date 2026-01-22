"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Stars, MapPin, Banknote, Eye, Building2 } from 'lucide-react';
import { RecommendedVacancyProps } from '@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy';
import { useTranslation } from "react-i18next";

export function RecommendedVacancies({ vacanciesRecommended }: RecommendedVacancyProps) {
  const { t, i18n } = useTranslation();
  const typeMap = {
    Presencial: t("Presencial"),
    Home_Office: t("Home Office"),
    H_brido: t("Híbrido"),
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Stars className="text-amber-400" size={20} />
          {t("dashboard_recommended_title")}
        </h2>
        <Link
          href="/candidate/vacancies"
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100 transition-colors"
        >
          {t("view_all")}
        </Link>
      </div>

      {vacanciesRecommended.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center">
          <p className="text-slate-500 text-sm mb-4">
            {t("dashboard_history_empty_recom")}
          </p>
          <Link
            href="/candidate/profile"
            className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-blue-700 transition-shadow"
          >
            {t("select_areas")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vacanciesRecommended.slice(0, 3).map((vacancy) => (
            <div key={vacancy.id} className="group border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex gap-4 items-start">
                {/* Logo da Empresa */}
                <Link href={`/viewer/vacancy/${vacancy.uuid}`} className="relative flex-shrink-0">
                  <div className="w-16 h-16 relative rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-gray-50">
                    {vacancy.empresa?.foto_perfil ? (
                      <Image
                        src={vacancy.empresa.foto_perfil}
                        alt="Logo"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Building2 size={32} className="text-gray-400" />
                    )}
                  </div>
                </Link>

                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {vacancy.empresa?.nome_empresa || vacancy.empresa?.nome || 'Empresa'}
                  </h3>

                  <p className="text-xs text-slate-500 leading-tight">
                    {[vacancy.empresa?.cidade, vacancy.empresa?.estado].filter(Boolean).join(', ') || t("location_not_informed")}
                  </p>

                  <div className="mt-2 font-bold text-slate-700 text-sm">{vacancy.cargo}</div>

                  {/* Badges de Info */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                      <MapPin size={12} />
                      {typeMap[vacancy.tipo_local_trabalho] || t("not_defined")}
                    </span>

                    {vacancy.salario && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-[10px] font-bold text-green-700 uppercase">
                        <Banknote size={12} />
                        {new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
                          style: 'currency',
                          currency: vacancy.moeda || 'BRL'
                        }).format(vacancy.salario)}
                      </span>
                    )}
                  </div>

                  {/* Áreas de Atuação */}
                  {vacancy.vaga_area && vacancy.vaga_area.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {vacancy.vaga_area.map((rel, idx) => (
                        <span key={idx} className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md font-medium">
                          {rel.area_interesse?.nome || rel.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/viewer/vacancy/${vacancy.uuid}`}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Eye size={16} />
                  {t("view_details")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}