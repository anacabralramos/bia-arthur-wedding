import { Countdown } from "./components/Countdown";
import { GIFTS } from "./data/gifts";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--wedding-cream)] text-[var(--wedding-ink)]">
      <header className="relative flex min-h-[85vh] flex-col items-center justify-end overflow-hidden pb-16 pt-28 text-center sm:min-h-[90vh] sm:pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, var(--wedding-hero-overlay), var(--wedding-hero-overlay)),
              url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80")`,
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
              className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[var(--wedding-ink)] transition hover:bg-white/90"
            >
              Lista de presentes
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section
          id="contagem"
          className="scroll-mt-6 border-b border-[var(--wedding-border)] bg-white/60 px-6 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-wedding-display text-3xl font-normal text-[var(--wedding-ink)] sm:text-4xl">
              Falta pouco
            </h2>
            <p className="mt-3 text-[var(--wedding-muted)]">
              Nosso grande dia será em{" "}
              <span className="font-medium text-[var(--wedding-ink)]">
                20 de março de 2026
              </span>
              . Acompanhe a contagem ao vivo.
            </p>
            <div className="mt-10">
              <Countdown />
            </div>
          </div>
        </section>

        <section
          id="presentes"
          className="scroll-mt-6 px-6 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-wedding-display text-3xl font-normal text-[var(--wedding-ink)] sm:text-4xl">
              Lista de presentes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--wedding-muted)] leading-relaxed">
              Montamos uma lista para nos ajudar a construir nosso lar com muito
              carinho. Sua presença já é o maior presente — se quiser nos
              presentear, fique à vontade para escolher um item.
            </p>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GIFTS.map((title) => (
                <li
                  key={title}
                  className="flex flex-col rounded-2xl border border-[var(--wedding-border)] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className="mb-4 aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-[#ebe6df] to-[#ddd5cb]"
                    aria-hidden
                  />
                  <h3 className="flex-1 text-lg font-medium text-[var(--wedding-ink)]">
                    {title}
                  </h3>
                  <button
                    type="button"
                    className="mt-5 w-full rounded-full bg-[var(--wedding-accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--wedding-accent-hover)]"
                  >
                    Presentear
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--wedding-border)] bg-white/80 px-6 py-8 text-center text-sm text-[var(--wedding-muted)]">
        Bia e Arthur — com carinho
      </footer>
    </div>
  );
}
