"use server";

import { revalidatePath } from "next/cache";
import { sendGiftReservedNotification } from "@/src/lib/send-gift-notification-email";
import { sendPixMarkedNotification } from "@/src/lib/send-pix-notification-email";
import {
  createSupabaseClient,
  presenteComPrecoNumerico,
  presenteQuantity,
  presenteReservedCount,
} from "@/src/utils/supabase";

export type PresentearResult =
  | { ok: true; emailNotified: boolean }
  | { ok: false; error: string };

export type NotificarPixResult =
  | { ok: true }
  | { ok: false; error: string };

function formatBRLServer(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

/** Chamado ao clicar em “Já enviei o Pix” (somente presentes com preço ≠ 0). */
export async function notificarPixEnviado(
  presenteId: string,
  donorName: string,
): Promise<NotificarPixResult> {
  const name = donorName.trim();
  if (!name) {
    return { ok: false, error: "Por favor, informe seu nome." };
  }

  const supabase = createSupabaseClient();

  const { data: row, error: fetchError } = await supabase
    .from("presentes")
    .select("id, name, price")
    .eq("id", presenteId)
    .single();

  if (fetchError || !row) {
    return {
      ok: false,
      error: fetchError?.message ?? "Presente não encontrado.",
    };
  }

  if (!presenteComPrecoNumerico(row)) {
    return {
      ok: false,
      error: "Este fluxo de Pix não se aplica a este presente.",
    };
  }

  const emailResult = await sendPixMarkedNotification({
    donorName: name,
    amountBRL: formatBRLServer(row.price),
    giftName: row.name,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error:
        "Não foi possível enviar o aviso por e-mail. Confira RESEND_API_KEY e os logs da Resend.",
    };
  }

  return { ok: true };
}

export async function presentearPresente(
  presenteId: string,
  buyerName: string,
): Promise<PresentearResult> {
  const name = buyerName.trim();
  if (!name) {
    return { ok: false, error: "Por favor, informe seu nome." };
  }

  const supabase = createSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from("presentes")
    .select("id, name, price, buyer_name, quantity, was_purchased")
    .eq("id", presenteId)
    .single();

  if (fetchError || !current) {
    return {
      ok: false,
      error: fetchError?.message ?? "Presente não encontrado.",
    };
  }

  const qty = presenteQuantity(current);
  const reserved = presenteReservedCount(current);
  const buyers = Array.isArray(current.buyer_name)
    ? current.buyer_name.filter((x) => typeof x === "string")
    : typeof current.buyer_name === "string" && current.buyer_name.trim()
      ? [current.buyer_name.trim()]
      : [];

  if (!presenteComPrecoNumerico(current) && reserved >= qty) {
    return {
      ok: false,
      error:
        "Este presente já foi escolhido. Atualize a página para ver a lista atualizada.",
    };
  }

  const nextBuyers = [...buyers, name];
  const nextReserved = reserved + 1;

  const { data, error } = await supabase
    .from("presentes")
    .update({ buyer_name: nextBuyers, was_purchased: nextReserved })
    .eq("id", presenteId)
    .select("id, name");

  if (error) {
    return { ok: false, error: error.message };
  }

  const row = data?.[0];
  if (!row) {
    return {
      ok: false,
      error:
        "Este presente já foi escolhido. Atualize a página para ver a lista atualizada.",
    };
  }

  let emailNotified = true;
  if (!presenteComPrecoNumerico(current)) {
    const emailResult = await sendGiftReservedNotification({
      guestName: name,
      giftName: row.name,
    });
    emailNotified = emailResult.ok;
  }

  revalidatePath("/");
  revalidatePath("/presentes");
  return { ok: true, emailNotified };
}
