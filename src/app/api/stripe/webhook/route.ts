import Stripe from "stripe";
import { sendOrderEmails } from "@/lib/notify";
import {
  resolveVariantFromPriceId,
  type Order,
  type OrderLine,
} from "@/lib/orders";
import { formatShippingAddress, shippingFromMetadata } from "@/lib/shipping";

/** Evenimentul Stripe pe care îl tratăm — orice altceva primește 200 și e ignorat, ca Stripe să nu reîncerce livrarea. */
const HANDLED_EVENT = "checkout.session.completed";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY nu este configurat.");
  return new Stripe(secretKey);
}

async function buildOrder(stripe: Stripe, sessionId: string): Promise<Order> {
  /**
   * Recitim sesiunea din API în loc să folosim obiectul din eveniment. Payload-ul
   * evenimentului e serializat cu versiunea de API aleasă pe destinație în dashboard;
   * dacă acolo e o versiune veche, câmpuri ca `collected_information` lipsesc și am
   * pierde adresa de livrare fără nicio eroare vizibilă. Citirea directă vine mereu
   * în versiunea pe care o așteaptă SDK-ul.
   */
  const [session, lineItems] = await Promise.all([
    stripe.checkout.sessions.retrieve(sessionId),
    stripe.checkout.sessions.listLineItems(sessionId, { expand: ["data.price"] }),
  ]);

  const lines: OrderLine[] = lineItems.data.map((item) => ({
    variant: resolveVariantFromPriceId(item.price?.id),
    quantity: item.quantity ?? 1,
  }));

  const fromForm = shippingFromMetadata(session.metadata);
  const collected = session.collected_information?.shipping_details?.address;

  return {
    orderId: session.id,
    customerName: fromForm?.fullName ?? session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? null,
    customerPhone: fromForm?.phone ?? session.customer_details?.phone ?? null,
    shippingAddress: fromForm
      ? formatShippingAddress(fromForm)
      : collected
        ? [collected.line1, collected.line2, collected.postal_code, collected.city, collected.country]
            .filter(Boolean)
            .join(", ")
        : null,
    lines,
    totalAmount: session.amount_total,
    currency: session.currency,
  };
}

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json({ error: "Webhook neconfigurat." }, { status: 500 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  const stripe = getStripeClient();

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "semnătură invalidă";
    console.error(`[stripe-webhook] verificare semnătură eșuată: ${message}`);
    return Response.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type !== HANDLED_EVENT) {
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return Response.json({ received: true, ignored: "payment_status not paid" });
  }

  try {
    const order = await buildOrder(stripe, session.id);
    await sendOrderEmails(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "eroare necunoscută";
    console.error(`[stripe-webhook] eșec la procesarea comenzii ${session.id}: ${message}`);
    // 200 către Stripe — evenimentul e valid și confirmat, doar notificarea a eșuat;
    // reîncercarea Stripe nu ar rezolva o eroare de config (env vars lipsă etc.).
    return Response.json({ received: true, notification: "failed" });
  }

  return Response.json({ received: true });
}
