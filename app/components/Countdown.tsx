"use client";

import { useEffect, useState } from "react";

const WEDDING = new Date(2026, 3, 15, 16, 0, 0);

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
  const [remaining, setRemaining] = useState(() => getRemaining());

  useEffect(() => {
    const tick = () => setRemaining(getRemaining());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    { label: "Dias", value: remaining.days },
    { label: "Horas", value: remaining.hours },
    { label: "Minutos", value: remaining.minutes },
    { label: "Segundos", value: remaining.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 text-wedding-ink sm:grid-cols-4 sm:gap-4">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-wedding-border bg-white px-4 py-5 text-center text-wedding-ink shadow-sm"
        >
          <p className="font-wedding-display text-3xl font-semibold tabular-nums text-wedding-ink sm:text-4xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-wedding-muted">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
