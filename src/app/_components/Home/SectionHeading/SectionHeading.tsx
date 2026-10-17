import { Reveal } from "../Reveal/Reveal";

type SectionHeadingProps = {
  kicker: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionHeading({ kicker, title, description, align = "left", tone = "light" }: SectionHeadingProps) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <Reveal className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${dark ? "bg-white/10 text-brand-sky" : "bg-brand-mist text-brand-blue"
          }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-brand-sky" : "bg-brand-dot"}`} />
        {kicker}
      </span>
      <h2
        className={`mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${dark ? "text-white" : "text-brand-ink"
          }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/70" : "text-slate-600"}`}>{description}</p>
      )}
    </Reveal>
  );
}
