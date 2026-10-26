"use client";

import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

// Banners em WebP: 1920px para desktop e 960px para telas pequenas
const slides = [1, 2, 3, 4, 5, 6].map((n) => ({
  desktop: `/img/carousel/${n}.webp`,
  mobile: `/img/carousel/${n}-sm.webp`,
  altKey: `lp_slide_${n}_alt`,
}));

const SLIDE_DURATION = 6000;

export function Carousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const timeout = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timeout);
  }, [current, paused, next]);

  return (
    <section id="showcase" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("lp_showcase_kicker")} title={t("lp_showcase_title")} />

        <Reveal delay={120} className="mt-12">
          <div
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-brand-surface"
            role="region"
            aria-roledescription="carousel"
            aria-label={t("lp_showcase_kicker")}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") next();
              if (e.key === "ArrowLeft") prev();
            }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) > 40) {
                if (delta < 0) next();
                else prev();
              }
              touchStartX.current = null;
            }}
          >
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.desktop}
                  className="relative aspect-[10/3] w-full shrink-0"
                  aria-hidden={current !== index}
                  aria-roledescription="slide"
                >
                  <Slide slide={slide} alt={t(slide.altKey)} priority={index === 0} />
                </div>
              ))}
            </div>

            <button
              onClick={prev}
              aria-label={t("lp_prev_slide")}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-brand-navy transition-colors hover:bg-brand-mist md:left-5 md:p-3 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label={t("lp_next_slide")}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-brand-navy transition-colors hover:bg-brand-mist md:right-5 md:p-3 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Indicadores com barra de progresso */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.desktop}
                onClick={() => goTo(index)}
                aria-label={`${t("lp_go_to_slide")} ${index + 1}`}
                aria-current={current === index}
                className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 cursor-pointer ${current === index ? "w-12 bg-brand-mist" : "w-6 bg-slate-200 hover:bg-slate-300"
                  }`}
              >
                {current === index && (
                  <span
                    key={current}
                    data-paused={paused}
                    className="slide-progress absolute inset-0 rounded-full bg-brand-navy"
                    style={{ "--slide-duration": `${SLIDE_DURATION}ms` } as React.CSSProperties}
                  />
                )}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Slide({ slide, alt, priority }: { slide: (typeof slides)[number]; alt: string; priority: boolean }) {
  // As imagens já estão otimizadas, então o Next só monta os atributos da <img>
  const { props: desktopProps } = getImageProps({
    alt,
    priority,
    unoptimized: true,
    src: slide.desktop,
    width: 1920,
    height: 576,
  });

  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={slide.mobile} width={960} height={288} />
      <img {...desktopProps} alt={alt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
    </picture>
  );
}
