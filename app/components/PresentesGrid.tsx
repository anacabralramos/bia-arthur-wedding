"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import { createStaticPix, hasError } from "pix-utils";
import { notificarPixEnviado, presentearPresente } from "@/app/actions/presentes";
import {
  presenteComPrecoNumerico,
  presenteEsgotado,
  type Presente,
} from "@/src/utils/supabase";

function formatBRL(value: number | string) {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

/**
 * Chave e-mail no Pix é tratada sem diferenciar maiúsculas no cadastro, mas vários apps
 * validam o payload contra a chave “canônica” em minúsculas — QR pode aparecer inválido se
 * o .env estiver com maiúsculas. Chaves aleatórias (EVP) e CPF/CNPJ não são alteradas.
 */
function normalizePixKey(raw: string): string {
  const k = raw.trim();
  if (k.includes("@")) {
    return k.toLowerCase();
  }
  return k;
}

/** EMV usa comprimento compatível com bytes; remove acentos e caracteres fora do ASCII imprimível. */
function emvSafeInfo(str: string, maxLen: number): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLen);
}

function buildStaticPixBrCode(presente: Presente): { ok: true; brCode: string } | { ok: false; message: string } {
  const key = normalizePixKey(process.env.NEXT_PUBLIC_PIX_KEY ?? "");
  const merchantName = process.env.NEXT_PUBLIC_PIX_NAME?.trim();
  const merchantCity = process.env.NEXT_PUBLIC_PIX_CITY?.trim();
  if (!key || !merchantName || !merchantCity) {
    return {
      ok: false,
      message:
        "Pix não configurado. Defina NEXT_PUBLIC_PIX_KEY, NEXT_PUBLIC_PIX_NAME e NEXT_PUBLIC_PIX_CITY no ambiente (ex.: .env.local ou Vercel).",
    };
  }
  const amount = typeof presente.price === "number" ? presente.price : Number(presente.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Valor do presente inválido para Pix." };
  }
  const pix = createStaticPix({
    pixKey: key,
    merchantName: merchantName.slice(0, 25),
    merchantCity: merchantCity.slice(0, 15),
    transactionAmount: amount,
    infoAdicional: emvSafeInfo(presente.name, 40),
  });
  if (hasError(pix)) {
    return { ok: false, message: pix.message };
  }
  return { ok: true, brCode: pix.toBRCode() };
}

type ModalState =
  | { mode: "closed" }
  | { mode: "pix"; presente: Presente }
  | { mode: "form"; presente: Presente; pixEmailWarning?: string }
  | { mode: "success"; guestName: string; emailWarning?: string }
  | { mode: "error"; message: string };

export function PresentesGrid({ presentes }: { presentes: Presente[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [guestName, setGuestName] = useState("");
  const [pixCopied, setPixCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setModal({ mode: "closed" });
    setGuestName("");
    setPixCopied(false);
  }, []);

  const pixPayload = useMemo(() => {
    if (modal.mode !== "pix") return null;
    return buildStaticPixBrCode(modal.presente);
  }, [modal]);

  useEffect(() => {
    if (modal.mode === "closed" || modal.mode === "success") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal.mode, closeModal]);

  useEffect(() => {
    if (modal.mode !== "form" && modal.mode !== "error" && modal.mode !== "pix")
      return;
    const t = window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>(
          "#presente-pix-guest-name, input:not([readonly])",
        )
        ?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [modal.mode]);

  useEffect(() => {
    if (!pixCopied) return;
    const t = window.setTimeout(() => setPixCopied(false), 2500);
    return () => clearTimeout(t);
  }, [pixCopied]);

  const openPresenteFlow = (presente: Presente) => {
    setGuestName("");
    setPixCopied(false);
    if (presenteComPrecoNumerico(presente)) {
      setModal({ mode: "pix", presente });
    } else {
      setModal({ mode: "form", presente, pixEmailWarning: undefined });
    }
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
        setModal({
          mode: "success",
          guestName: guestName.trim(),
          emailWarning: result.emailNotified
            ? undefined
            : "O aviso por e-mail não foi enviado. Confira RESEND_API_KEY no servidor (ex.: Vercel → Environment Variables) e os logs da Resend. Com o remetente de teste, só é possível entregar para o e-mail da conta Resend até você verificar um domínio.",
        });
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
      <ul className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        {presentes.map((p) => (
          <li
            key={p.id}
            className={`flex h-full flex-col overflow-hidden rounded-2xl border border-wedding-border bg-white shadow-md transition hover:shadow-lg ${
              presenteEsgotado(p) ? "opacity-75" : ""
            }`}
          >
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-[#ebe6df] to-[#ddd5cb]">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1023px) 50vw, 33vw"
                />
              ) : null}
              {presenteEsgotado(p) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 p-4">
                  <span className="rounded-full bg-white/95 px-4 py-2 text-center text-sm font-semibold text-wedding-ink shadow-md">
                    Já ganhamos!
                  </span>
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-4 p-5">
              <div className="min-w-0 space-y-3">
                <h2 className="text-sm font-semibold leading-snug text-wedding-ink lg:text-lg lg:leading-normal">
                  {p.name}
                </h2>
                {presenteComPrecoNumerico(p) ? (
                  <p className="text-xl font-medium text-wedding-accent">
                    {formatBRL(p.price)}
                  </p>
                ) : null}
              </div>
              {!presenteEsgotado(p) ? (
                <button
                  type="button"
                  onClick={() => openPresenteFlow(p)}
                  className="w-full shrink-0 rounded-full bg-wedding-accent py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-wedding-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent focus-visible:ring-offset-2"
                >
                  {presenteComPrecoNumerico(p) ? "Presentear" : "Reservar"}
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
            className={`w-full rounded-2xl border border-wedding-border bg-white p-6 shadow-xl ${
              modal.mode === "pix" ? "max-w-lg" : "max-w-md"
            }`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {modal.mode === "pix" ? (
              <>
                <h3
                  id="presente-modal-title"
                  className="font-wedding-display text-2xl text-wedding-ink"
                >
                  Pagamento via Pix
                </h3>
                <p className="mt-3 text-center text-lg font-semibold text-wedding-ink">
                  {modal.presente.name}
                </p>
                <p className="mt-1 text-center text-2xl font-medium text-wedding-accent">
                  {formatBRL(modal.presente.price)}
                </p>
                {pixPayload && !pixPayload.ok ? (
                  <p
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                    role="alert"
                  >
                    {pixPayload.message}
                  </p>
                ) : null}
                {pixPayload && pixPayload.ok ? (
                  <div className="mt-5 flex flex-col items-center gap-4">
                    <div className="rounded-xl border border-wedding-border bg-white p-3 shadow-sm">
                      <QRCodeSVG
                        value={pixPayload.brCode}
                        size={200}
                        level="M"
                        includeMargin
                      />
                    </div>
                    <label className="w-full text-xs font-medium uppercase tracking-wide text-wedding-muted">
                      Pix copia e cola
                      <input
                        readOnly
                        value={pixPayload.brCode}
                        className="mt-2 w-full rounded-xl border border-wedding-border bg-wedding-cream/40 px-3 py-2.5 font-mono text-xs text-wedding-ink"
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(pixPayload.brCode);
                          setPixCopied(true);
                        } catch {
                          setPixCopied(false);
                        }
                      }}
                      className="w-full rounded-full border border-wedding-border py-3 text-sm font-semibold text-wedding-ink transition hover:bg-wedding-cream"
                    >
                      {pixCopied ? "Copiado!" : "Copiar código"}
                    </button>
                    <label className="w-full text-sm font-medium text-wedding-ink">
                      Nome do convidado
                      <input
                        id="presente-pix-guest-name"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Quem está enviando o Pix"
                        autoComplete="name"
                        disabled={isPending}
                        className="mt-2 w-full rounded-xl border border-wedding-border px-4 py-3 text-wedding-ink outline-none ring-wedding-accent/30 transition focus:border-wedding-accent focus:ring-2 disabled:opacity-50"
                      />
                    </label>
                  </div>
                ) : null}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="rounded-full border border-wedding-border px-5 py-2.5 text-sm font-medium text-wedding-ink transition hover:bg-wedding-cream disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  {pixPayload?.ok ? (
                    <button
                      type="button"
                      disabled={isPending || !guestName.trim()}
                      onClick={() => {
                        if (modal.mode !== "pix") return;
                        const presente = modal.presente;
                        startTransition(async () => {
                          const result = await notificarPixEnviado(
                            presente.id,
                            guestName,
                          );
                          setPixCopied(false);
                          setModal({
                            mode: "form",
                            presente,
                            pixEmailWarning: result.ok
                              ? undefined
                              : result.error,
                          });
                        });
                      }}
                      className="rounded-full bg-wedding-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wedding-accent-hover disabled:opacity-50"
                    >
                      {isPending ? "Enviando aviso…" : "Já enviei o Pix"}
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}

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
                    {modal.presente.name}
                  </span>
                  {presenteComPrecoNumerico(modal.presente) ? (
                    <> ({formatBRL(modal.presente.price)})</>
                  ) : null}
                </p>
                {modal.pixEmailWarning ? (
                  <p
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950"
                    role="status"
                  >
                    {modal.pixEmailWarning}
                  </p>
                ) : null}
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
            {modal.emailWarning ? (
              <p
                className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950"
                role="status"
              >
                {modal.emailWarning}
              </p>
            ) : null}
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
