"use server";

import { revalidatePath } from "next/cache";
import { sendGiftReservedNotification } from "@/src/lib/send-gift-notification-email";
import {
  createSupabaseClient,
  presenteComPrecoNumerico,
  presenteQuantity,
  presenteReservedCount,
} from "@/src/utils/supabase";

export type PresentearResult =
  | { ok: true; emailNotified: boolean }
  | { ok: false; error: string };

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

  const emailResult = await sendGiftReservedNotification({
    guestName: name,
    giftName: row.name,
  });

  revalidatePath("/");
  revalidatePath("/presentes");
  return { ok: true, emailNotified: emailResult.ok };
}
