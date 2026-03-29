import { Resend } from "resend";

const DEFAULT_NOTIFICATION_TO = "ana.clara.2cr@gmail.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBRL(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

export type SendPixEmailResult = { ok: true } | { ok: false; reason: string };

/**
 * Aviso quando o convidado marca “Já enviei o Pix” (presentes com preço ≠ 0).
 * Mesmas variáveis de ambiente que `send-gift-notification-email` (Resend).
 */
export async function sendPixMarkedNotification(input: {
  donorName: string;
  amountBRL: string;
  giftName: string;
}): Promise<SendPixEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[pix-notification] RESEND_API_KEY is missing — add it to .env.local or Vercel → Environment Variables.",
    );
    return { ok: false, reason: "missing_api_key" };
  }

  const to =
    process.env.GIFT_NOTIFICATION_EMAIL?.trim() || DEFAULT_NOTIFICATION_TO;
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const donorSafe = escapeHtml(input.donorName);
  const giftSafe = escapeHtml(input.giftName);
  const amountSafe = escapeHtml(input.amountBRL);

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:24px 12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:400px;width:100%;background:#ffffff;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border-top:8px solid #32bcad;text-align:center;">
        <tr>
          <td style="padding:30px 24px;">
            <div style="font-size:50px;line-height:1;margin-bottom:10px;">📱💰</div>
            <h1 style="color:#32bcad;margin:10px 0;font-size:24px;font-weight:bold;">NOTIFICAÇÃO DE AMOR!</h1>
            <p style="color:#666;line-height:1.6;margin:0 0 16px;font-size:15px;">Acabou de cair um PIX na conta da felicidade!</p>
            <p style="margin:15px 0;font-size:32px;font-weight:bold;color:#333;">${amountSafe}</p>
            <p style="color:#666;line-height:1.6;margin:0 0 20px;font-size:15px;">
              <strong>${donorSafe}</strong> deu um empurrãozinho na nossa Lua de Mel (ou no estoque de cerveja do noivo)!
            </p>
            <p style="color:#888;font-size:13px;margin:0 0 8px;">Presente: ${giftSafe}</p>
            <p style="font-size:14px;color:#999;font-style:italic;margin:16px 0 0;line-height:1.5;">
              Obrigado por fazer parte da nossa história! <span style="color:#e74c3c;">❤</span><br />
              <em>Ass: Os Noivos mais Felizes do Mundo</em>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  const plain = `NOTIFICAÇÃO DE AMOR!

Acabou de cair um PIX na conta da felicidade!

${input.amountBRL}

${input.donorName} deu um empurrãozinho na nossa Lua de Mel (ou no estoque de cerveja do noivo)!

Presente: ${input.giftName}

Obrigado por fazer parte da nossa história!
Ass: Os Noivos mais Felizes do Mundo`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: `PIX Recebido! 💸 ${input.amountBRL} — ${input.donorName}`,
      text: plain,
      html,
    });

    if (error) {
      console.error(
        "[pix-notification] Resend API error:",
        JSON.stringify(error, null, 2),
      );
      return {
        ok: false,
        reason:
          typeof error.message === "string" ? error.message : "resend_error",
      };
    }

    console.log("[pix-notification] Email queued:", data?.id ?? data);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[pix-notification] Unexpected error:", msg);
    return { ok: false, reason: msg };
  }
}
