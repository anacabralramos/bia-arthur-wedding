import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Colunas da tabela `presentes` no Supabase. */
export interface Presente {
  id: string;
  display_name: string;
  name: string;
  image_url: string | null;
  price: number;
  was_purchased: boolean;
  buyer_name: string | null;
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
