import { Resend } from "resend";
import { SELLER } from "@/lib/legal";

/**
 * Primește emailurile trimise pe domeniu (ex: contact@tricouamenda.ro) și le
 * redirectează către inboxul real. Resend livrează evenimentul `email.received`
 * aici; noi verificăm semnătura și cerem redirectarea mesajului original.
 */
const HANDLED_EVENT = "email.received";

/** Expeditorul redirectării trebuie să fie pe domeniul verificat în Resend, nu adresa clientului. */
const FORWARD_FROM = SELLER.email;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const forwardTo = process.env.CONTACT_FORWARD_TO;

  if (!apiKey || !webhookSecret || !forwardTo) {
    console.error(
      "[resend-inbound] configurație incompletă: RESEND_API_KEY, RESEND_WEBHOOK_SECRET sau CONTACT_FORWARD_TO lipsesc.",
    );
    return Response.json({ error: "Redirect neconfigurat." }, { status: 500 });
  }

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return Response.json({ error: "Lipsesc headerele de semnătură." }, { status: 400 });
  }

  // Semnătura se calculează pe corpul brut — orice parsare/reserializare ar invalida-o.
  const payload = await request.text();
  const resend = new Resend(apiKey);

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "semnătură invalidă";
    console.error(`[resend-inbound] verificare semnătură eșuată: ${message}`);
    return Response.json({ error: "Webhook invalid." }, { status: 400 });
  }

  if (event.type !== HANDLED_EVENT) {
    return Response.json({ received: true, ignored: event.type });
  }

  try {
    const { error } = await resend.emails.receiving.forward({
      emailId: event.data.email_id,
      to: forwardTo,
      from: FORWARD_FROM,
      // Trimite mesajul original neatins, cu tot cu atașamente.
      passthrough: true,
    });

    if (error) throw new Error(error.message);
  } catch (err) {
    const message = err instanceof Error ? err.message : "eroare necunoscută";
    console.error(
      `[resend-inbound] redirectarea emailului ${event.data.email_id} a eșuat: ${message}`,
    );
    // 500 pentru ca Resend să reîncerce — spre deosebire de comenzi, aici o
    // reîncercare chiar poate reuși, iar un email de client pierdut nu se recuperează.
    return Response.json({ error: "Redirectare eșuată." }, { status: 500 });
  }

  return Response.json({ received: true, forwarded: true });
}
