"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/img/carousel/1.png",
  "/img/carousel/2.png",
  "/img/carousel/3.png",
  "/img/carousel/4.png",
  "/img/carousel/5.png",
  "/img/carousel/6.png",
];

export function Carousel() {
  const [current, setCurrent] = useState(0);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % images.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="w-full bg-white">
      <div className="relative w-full overflow-hidden">
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, index) => (
            <div
              key={index}
              className="relative w-full shrink-0 aspect-16/7 md:aspect-3/1"
            >
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                unoptimized
                className="object-contain"
                draggable={false}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${current === index ? "w-6 bg-blue-500" : "w-1.5 bg-gray-400/60"
                }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Botões de navegação */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/10 p-2 text-white transition-colors cursor-pointer hover:bg-black/30 md:p-3"
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/10 p-2 text-white transition-colors cursor-pointer hover:bg-black/30 md:p-3"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </main>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6"><path d="m15 18-6-6 6-6" /></svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6"><path d="m9 18 6-6-6-6" /></svg>
  );
}