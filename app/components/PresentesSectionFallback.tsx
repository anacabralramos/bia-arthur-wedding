export function PresentesSectionFallback() {
  return (
    <>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-wedding-display text-3xl font-normal text-wedding-ink sm:text-4xl">
          Lista de presentes
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-wedding-muted leading-relaxed">
          Carregando a lista…
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[22rem] animate-pulse rounded-2xl border border-wedding-border bg-white/60"
          />
        ))}
      </div>
    </>
  );
}
