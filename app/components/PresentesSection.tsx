import { PresentesGrid } from "./PresentesGrid";
import { createSupabaseClient, type Presente } from "@/src/utils/supabase";

export async function PresentesSection() {
  let presentes: Presente[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("presentes")
      .select(
        "id, name, image_url, price, was_purchased, buyer_name, quantity",
      )
      .order("name", { ascending: true });

    if (error) {
      fetchError = error.message;
    } else {
      presentes = (data ?? []) as Presente[];
    }
  } catch (e) {
    fetchError =
      e instanceof Error ? e.message : "Não foi possível carregar os presentes.";
  }

  return (
    <>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-wedding-display text-3xl font-normal text-wedding-ink sm:text-4xl">
          Lista de presentes
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-wedding-muted leading-relaxed">
          Montamos uma lista online para nos ajudar a construir nosso lar. Sua
          presença já é o maior presente — se quiser nos presentear, escolha um
          item abaixo.
        </p>
      </div>

      {fetchError ? (
        <div
          className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">Não foi possível carregar a lista.</p>
          <p className="mt-2 text-red-800/90">{fetchError}</p>
        </div>
      ) : presentes.length === 0 ? (
        <p className="mt-12 text-center text-wedding-muted">
          Ainda não há presentes cadastrados.
        </p>
      ) : (
        <div className="mx-auto mt-12 max-w-5xl">
          <PresentesGrid presentes={presentes} />
        </div>
      )}
    </>
  );
}
