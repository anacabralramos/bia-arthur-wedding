import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Colunas da tabela `presentes` no Supabase. */
export interface Presente {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  /** Quantas reservas já foram feitas (INTEGER no Postgres; esgota em `quantity`). */
  was_purchased: number;
  /** Nomes de quem reservou (coluna `TEXT[]` no Postgres). */
  buyer_name: string[] | null;
  quantity: number | null;
}

/** Quantidade de “vagas” do presente (mínimo 1). */
export function presenteQuantity(p: Pick<Presente, "quantity">): number {
  const q = p.quantity;
  return q != null && q > 0 ? q : 1;
}

/** Número de reservas já registradas em `was_purchased` (tolerante a tipos do JSON). */
export function presenteReservedCount(
  p: Pick<Presente, "was_purchased">,
): number {
  const v = p.was_purchased;
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
  if (typeof v === "boolean") {
    return v ? 1 : 0;
  }
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

/**
 * Preço diferente de zero: item tratado como estoque ilimitado (`quantity` não limita reservas).
 * Mesmo critério usado para exibir preço e rótulo “Presentear” na UI.
 */
export function presenteComPrecoNumerico(p: Pick<Presente, "price">): boolean {
  const n = typeof p.price === "number" ? p.price : Number(p.price);
  return Number.isFinite(n) && n !== 0;
}

/** Esgotado quando o contador atinge `quantity` (itens com preço ≠ 0 nunca esgotam por quantidade). */
export function presenteEsgotado(p: Presente): boolean {
  if (presenteComPrecoNumerico(p)) return false;
  return presenteReservedCount(p) >= presenteQuantity(p);
}

export function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.",
    );
  }

  return createClient(url, key);
}
