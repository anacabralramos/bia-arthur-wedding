"use server";

import { revalidatePath } from "next/cache";
import { sendGiftReservedNotification } from "@/src/lib/send-gift-notification-email";
import { createSupabaseClient } from "@/src/utils/supabase";

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

  const { data, error } = await supabase
    .from("presentes")
    .update({ was_purchased: true, buyer_name: name })
    .eq("id", presenteId)
    .eq("was_purchased", false)
    .select("id, display_name");

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
    giftName: row.display_name,
  });

  revalidatePath("/");
  revalidatePath("/presentes");
  return { ok: true, emailNotified: emailResult.ok };
}
