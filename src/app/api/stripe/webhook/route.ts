import { Resend } from "resend";
import Stripe from "stripe";
import {
  buildCustomerHtml,
  buildCustomerSubject,
  buildProviderHtml,
  buildProviderSubject,
  resolveVariantFromPriceId,
  type Order,
  type OrderLine,
} from "@/lib/orders";

/** Evenimentul Stripe pe care îl tratăm — orice altceva primește 200 și e ignorat, ca Stripe să nu reîncerce livrarea. */
const HANDLED_EVENT = "checkout.session.completed";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY nu este configurat.");
  return new Stripe(secretKey);
}

async function buildOrder(stripe: Stripe, session: Stripe.Checkout.Session): Promise<Order> {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price"],
  });

  const lines: OrderLine[] = lineItems.data.map((item) => ({
    variant: resolveVariantFromPriceId(item.price?.id),
    quantity: item.quantity ?? 1,
  }));

  const address = session.collected_information?.shipping_details?.address;

  return {
    orderId: session.id,
    customerName: session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? null,
    shippingAddress: address
      ? [address.line1, address.line2, address.postal_code, address.city, address.country]
          .filter(Boolean)
          .join(", ")
      : null,
    lines,
    totalAmount: session.amount_total,
    currency: session.currency,
  };
}

/**
 * Trimite două emailuri independente: unul către producător (ce are de
 * fabricat) și unul de confirmare către client. Sunt trimise individual, nu
 * prin batch, pentru că batch-ul Resend nu suportă atașamente — de care avem
 * nevoie ca să atașăm factura. Eșecul unuia nu îl blochează pe celălalt.
 */
async function sendOrderEmails(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const providerEmail = process.env.PROVIDER_EMAIL;

  if (!apiKey || !from || !providerEmail) {
    throw new Error(
      "Configurație incompletă: RESEND_API_KEY, RESEND_FROM_EMAIL sau PROVIDER_EMAIL lipsesc.",
    );
  }

  const resend = new Resend(apiKey);

  const deliveries: { label: string; send: () => Promise<{ error: { message: string } | null }> }[] =
    [
      {
        label: "producător",
        send: () =>
          resend.emails.send({
            from,
            to: [providerEmail],
            subject: buildProviderSubject(order),
            html: buildProviderHtml(order),
          }),
      },
    ];

  if (order.customerEmail) {
    const customerEmail = order.customerEmail;
    deliveries.push({
      label: "client",
      send: () =>
        resend.emails.send({
          from,
          to: [customerEmail],
          replyTo: providerEmail,
          subject: buildCustomerSubject(order),
          html: buildCustomerHtml(order),
        }),
    });
  } else {
    console.warn(
      `[stripe-webhook] comanda ${order.orderId} nu are email de client — trimit doar către producător.`,
    );
  }

  const results = await Promise.allSettled(
    deliveries.map(async ({ label, send }) => {
      const { error } = await send();
      if (error) throw new Error(`emailul către ${label} a fost refuzat: ${error.message}`);
    }),
  );

  const failures = results
    .map((result, i) =>
      result.status === "rejected"
        ? `${deliveries[i].label}: ${result.reason instanceof Error ? result.reason.message : result.reason}`
        : null,
    )
    .filter((f): f is string => f !== null);

  if (failures.length > 0) throw new Error(failures.join(" | "));
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
    const order = await buildOrder(stripe, session);
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
