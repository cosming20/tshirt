import { Resend } from "resend";
import Stripe from "stripe";
import {
  buildOrderEmailHtml,
  buildOrderEmailSubject,
  resolveColorFromCustomFields,
  resolveSizeFromPriceId,
  type ManufacturingOrder,
  type OrderLine,
} from "@/lib/orders";

/** Evenimente Stripe pe care le tratăm — orice altceva primește 200 și e ignorat, ca Stripe să nu reîncerce livrarea. */
const HANDLED_EVENT = "checkout.session.completed";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY nu este configurat.");
  return new Stripe(secretKey);
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY nu este configurat.");
  return new Resend(apiKey);
}

async function buildManufacturingOrder(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<ManufacturingOrder> {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price"],
  });
  const color = resolveColorFromCustomFields(session.custom_fields);

  const lines: OrderLine[] = lineItems.data.map((item) => ({
    size: resolveSizeFromPriceId(item.price?.id),
    color,
    quantity: item.quantity ?? 1,
  }));

  const shippingAddress = session.collected_information?.shipping_details?.address;

  return {
    orderId: session.id,
    customerName: session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? null,
    shippingAddress: shippingAddress
      ? [
          shippingAddress.line1,
          shippingAddress.line2,
          shippingAddress.postal_code,
          shippingAddress.city,
          shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", ")
      : null,
    lines,
    totalAmount: session.amount_total,
    currency: session.currency,
  };
}

async function notifyProvider(order: ManufacturingOrder): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.PROVIDER_EMAIL;
  if (!from || !to) {
    throw new Error("RESEND_FROM_EMAIL sau PROVIDER_EMAIL lipsesc din configurație.");
  }

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from,
    to,
    subject: buildOrderEmailSubject(order),
    html: buildOrderEmailHtml(order),
  });

  if (error) throw new Error(`Resend a refuzat emailul: ${error.message}`);
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
    const order = await buildManufacturingOrder(stripe, session);
    await notifyProvider(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "eroare necunoscută";
    console.error(`[stripe-webhook] eșec la procesarea comenzii ${session.id}: ${message}`);
    // 200 către Stripe — evenimentul e valid și confirmat, doar notificarea a eșuat;
    // reîncercarea Stripe nu ar rezolva o eroare de config (env vars lipsă etc.).
    return Response.json({ received: true, notification: "failed" });
  }

  return Response.json({ received: true });
}
