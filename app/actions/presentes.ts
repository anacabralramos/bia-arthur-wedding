"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/src/utils/supabase";

export type PresentearResult =
  | { ok: true }
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
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.length) {
    return {
      ok: false,
      error:
        "Este presente já foi escolhido. Atualize a página para ver a lista atualizada.",
    };
  }

  revalidatePath("/");
  revalidatePath("/presentes");
  return { ok: true };
}
