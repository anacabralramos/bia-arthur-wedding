import { Suspense } from "react";
import { Countdown } from "./components/Countdown";
import { PresentesSection } from "./components/PresentesSection";
import { PresentesSectionFallback } from "./components/PresentesSectionFallback";
import heroPhoto from "./assets/bia_e_arthur.jpeg";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-wedding-cream text-wedding-ink">
      <header className="relative flex min-h-[85vh] flex-col items-center justify-end overflow-hidden pb-16 pt-28 text-center sm:min-h-[90vh] sm:pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, var(--wedding-hero-overlay), var(--wedding-hero-overlay)), url("${heroPhoto.src}")`,
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl px-6 text-white">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-white/90">
            O casamento de
          </p>
          <h1 className="font-wedding-display text-5xl font-normal leading-tight sm:text-6xl md:text-7xl">
            Bia <span className="text-white/85">&</span> Arthur
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Com alegria, convidamos você a celebrar conosco o início de uma nova
            história. Será uma honra ter você nesse dia tão especial.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contagem"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Contagem regressiva
            </a>
            <a
              href="#presentes"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-wedding-ink transition hover:bg-white/90"
            >
              Lista de presentes
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section
          id="contagem"
          className="scroll-mt-6 border-b border-wedding-border bg-wedding-cream px-6 py-16 text-wedding-ink sm:py-20"
        >
          <div className="mx-auto max-w-3xl text-center text-wedding-ink">
            <h2 className="font-wedding-display text-3xl font-normal text-wedding-ink sm:text-4xl">
              Falta pouco
            </h2>
            <p className="mt-3 text-wedding-muted">
              Nosso grande dia será em{" "}
              <span className="font-medium text-wedding-ink">
                19 de abril de 2026
              </span>
              . Acompanhe a contagem ao vivo.
            </p>
            <div className="mt-10">
              <Countdown />
            </div>
          </div>
        </section>

        <section id="presentes" className="scroll-mt-6 px-6 py-16 sm:py-20">
          <Suspense fallback={<PresentesSectionFallback />}>
            <PresentesSection />
          </Suspense>
        </section>
      </main>

      <footer className="border-t border-wedding-border bg-white/80 px-6 py-8 text-center text-sm text-wedding-muted">
        Bia e Arthur — com carinho
      </footer>
    </div>
  );
}
