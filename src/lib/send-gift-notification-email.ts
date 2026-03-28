import { Resend } from "resend";

const DEFAULT_NOTIFICATION_TO = "ana.clara.2cr@gmail.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type SendGiftEmailResult = { ok: true } | { ok: false; reason: string };

/**
 * Notifies the bride when a guest reserves a gift.
 *
 * Setup:
 * - Set RESEND_API_KEY (server-only; never NEXT_PUBLIC_*).
 *
 * Sender:
 * - With the Resend test address, you may only send TO the same email you used
 *   to sign up at resend.com, unless you verify a domain.
 * - For production: verify your domain in Resend, then set RESEND_FROM_EMAIL
 *   e.g. `Casamento <noreply@seudominio.com>`.
 *
 * Recipient: GIFT_NOTIFICATION_EMAIL or arthuraguiar.ah07@gmail.com
 */
export async function sendGiftReservedNotification(input: {
  guestName: string;
  giftName: string;
}): Promise<SendGiftEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[gift-notification] RESEND_API_KEY is missing — add it to .env.local (local) or Vercel → Settings → Environment Variables, then redeploy.",
    );
    return { ok: false, reason: "missing_api_key" };
  }

  const to =
    process.env.GIFT_NOTIFICATION_EMAIL?.trim() || DEFAULT_NOTIFICATION_TO;
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const guestSafe = escapeHtml(input.guestName);
  const giftSafe = escapeHtml(input.giftName);
  const subjectGift = input.giftName.replace(/\s+/g, " ").trim();

  const html = `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
  <h2 style="color: #d63384; text-align: center;">Obaaa, Bia! Mais um presente! 🥂</h2>
  
  <p>Oi, Noivinha! Acabamos de receber uma atualização no seu site de casamento.</p>
  
  <div style="background-color: #fff0f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d63384;">
    <p style="margin: 0;"><strong>Convidado:</strong> ${guestSafe}</p>
    <p style="margin: 10px 0 0 0;"><strong>Presente:</strong> ${giftSafe}</p>
  </div>

  <p>Agora falta pouco para o grande dia! Não esqueça de dar uma olhadinha no seu painel do Supabase se quiser ver a lista completa de quem já confirmou.</p>
  
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  
  <p style="font-size: 12px; color: #999; text-align: center;">
    Este é um e-mail automático enviado pelo seu sistema (Next.js + Resend).<br />
    <strong>Casamento Bia &amp; Arthur - 20 de Abril</strong>
  </p>
</div>`;

  const plain = `Obaaa, Bia! Mais um presente!

Oi, Noivinha! Acabamos de receber uma atualização no seu site de casamento.

Convidado: ${input.guestName}
Presente: ${input.giftName}

Agora falta pouco para o grande dia! Não esqueça de dar uma olhadinha no seu painel do Supabase se quiser ver a lista completa de quem já confirmou.

---
Este é um e-mail automático enviado pelo seu sistema (Next.js + Resend).
Casamento Bia & Arthur - 20 de Abril`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: `🎁 Presente reservado: ${subjectGift}!`,
      text: plain,
      html,
    });

    if (error) {
      console.error(
        "[gift-notification] Resend API error:",
        JSON.stringify(error, null, 2),
      );
      return {
        ok: false,
        reason:
          typeof error.message === "string" ? error.message : "resend_error",
      };
    }

    console.log("[gift-notification] Email queued:", data?.id ?? data);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[gift-notification] Unexpected error:", msg);
    return { ok: false, reason: msg };
  }
}
