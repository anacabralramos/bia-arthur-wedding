"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { presentearPresente } from "@/app/actions/presentes";
import type { Presente } from "@/src/utils/supabase";

function formatBRL(value: number | string) {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

type ModalState =
  | { mode: "closed" }
  | { mode: "form"; presente: Presente }
  | { mode: "success"; guestName: string }
  | { mode: "error"; message: string };

export function PresentesGrid({ presentes }: { presentes: Presente[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [guestName, setGuestName] = useState("");
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setModal({ mode: "closed" });
    setGuestName("");
  }, []);

  useEffect(() => {
    if (modal.mode === "closed" || modal.mode === "success") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal.mode, closeModal]);

  useEffect(() => {
    if (modal.mode !== "form" && modal.mode !== "error") return;
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [modal.mode]);

  const openForm = (presente: Presente) => {
    setGuestName("");
    setModal({ mode: "form", presente });
  };

  const handleConfirm = () => {
    if (modal.mode !== "form") return;
    const { presente } = modal;
    startTransition(async () => {
      const result = await presentearPresente(presente.id, guestName);
      if (result.ok) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.65 },
        });
        setModal({ mode: "success", guestName: guestName.trim() });
        router.refresh();
      } else {
        setModal({ mode: "error", message: result.error });
      }
    });
  };

  const dismissSuccess = () => {
    closeModal();
    router.refresh();
  };

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {presentes.map((p) => (
          <li
            key={p.id}
            className={`flex flex-col overflow-hidden rounded-2xl border border-wedding-border bg-white shadow-md transition hover:shadow-lg ${
              p.was_purchased ? "opacity-75" : ""
            }`}
          >
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-[#ebe6df] to-[#ddd5cb]">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : null}
              {p.was_purchased ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 p-4">
                  <span className="rounded-full bg-white/95 px-4 py-2 text-center text-sm font-semibold text-wedding-ink shadow-md">
                    Já ganhamos!
                  </span>
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold text-wedding-ink">
                {p.display_name}
              </h2>
              <p className="mt-1 text-sm text-wedding-muted">{p.name}</p>
              <p className="mt-3 text-xl font-medium text-wedding-accent">
                {formatBRL(p.price)}
              </p>
              {!p.was_purchased ? (
                <button
                  type="button"
                  onClick={() => openForm(p)}
                  className="mt-5 w-full rounded-full bg-wedding-accent py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-wedding-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent focus-visible:ring-offset-2"
                >
                  Presentear
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {modal.mode !== "closed" && modal.mode !== "success" ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isPending) closeModal();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="presente-modal-title"
            className="w-full max-w-md rounded-2xl border border-wedding-border bg-white p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {modal.mode === "form" ? (
              <>
                <h3
                  id="presente-modal-title"
                  className="font-wedding-display text-2xl text-wedding-ink"
                >
                  Presentear
                </h3>
                <p className="mt-2 text-sm text-wedding-muted">
                  Você está reservando:{" "}
                  <span className="font-medium text-wedding-ink">
                    {modal.presente.display_name}
                  </span>{" "}
                  ({formatBRL(modal.presente.price)})
                </p>
                <label className="mt-5 block text-sm font-medium text-wedding-ink">
                  Nome do convidado
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Como quer ser identificado(a)"
                    className="mt-2 w-full rounded-xl border border-wedding-border px-4 py-3 text-wedding-ink outline-none ring-wedding-accent/30 transition focus:border-wedding-accent focus:ring-2"
                    autoComplete="name"
                    disabled={isPending}
                  />
                </label>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="rounded-full border border-wedding-border px-5 py-2.5 text-sm font-medium text-wedding-ink transition hover:bg-wedding-cream disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isPending || !guestName.trim()}
                    className="rounded-full bg-wedding-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wedding-accent-hover disabled:opacity-50"
                  >
                    {isPending ? "Enviando…" : "Confirmar"}
                  </button>
                </div>
              </>
            ) : null}

            {modal.mode === "error" ? (
              <>
                <h3
                  id="presente-modal-title"
                  className="font-wedding-display text-2xl text-wedding-ink"
                >
                  Não foi possível concluir
                </h3>
                <p className="mt-3 text-sm text-wedding-muted">{modal.message}</p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-wedding-border px-5 py-2.5 text-sm font-medium text-wedding-ink hover:bg-wedding-cream"
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {modal.mode === "success" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dismissSuccess();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-title"
            className="w-full max-w-md rounded-2xl border border-wedding-border bg-white p-8 text-center shadow-xl"
          >
            <h3
              id="thanks-title"
              className="font-wedding-display text-2xl text-wedding-ink"
            >
              Muito obrigado!
            </h3>
            <p className="mt-4 text-wedding-muted leading-relaxed">
              {modal.guestName}, seu carinho com a gente significa o mundo. Mal
              podemos esperar para celebrar esse dia especial com você — e
              guardaremos esse gesto com muito amor.
            </p>
            <button
              type="button"
              onClick={dismissSuccess}
              className="mt-8 rounded-full bg-wedding-accent px-8 py-3 text-sm font-semibold text-white transition hover:bg-wedding-accent-hover"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
