"use client";

import { useEffect, useState } from "react";

const WEDDING = new Date(2026, 2, 20, 16, 0, 0);

function getRemaining() {
  const now = Date.now();
  const end = WEDDING.getTime();
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Dias", value: remaining.days },
    { label: "Horas", value: remaining.hours },
    { label: "Minutos", value: remaining.minutes },
    { label: "Segundos", value: remaining.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-[var(--wedding-border)] bg-white/80 px-4 py-5 text-center shadow-sm backdrop-blur-sm"
        >
          <p className="font-wedding-display text-3xl font-semibold tabular-nums text-[var(--wedding-ink)] sm:text-4xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-[var(--wedding-muted)]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
