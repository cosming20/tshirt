import Stripe from "stripe";
import { MAX_QUANTITY_PER_ITEM, parseCartPayload } from "@/lib/cart";
import { resolvePriceIdForVariant } from "@/lib/orders";
import { SITE_URL } from "@/lib/site";

/**
 * Creează o sesiune de checkout Stripe din coșul clientului. Înlocuiește
 * Payment Links: acolo fiecare link avea line items ficși, deci mărimi diferite
 * însemnau plăți separate. Aici liniile se compun dinamic, dar prețurile se
 * rezolvă pe server după mărime+culoare — clientul nu poate influența suma.
 */
export async function POST(request: Request): Promise<Response> {
  // Validarea cererii vine prima: un coș malformat e 400 indiferent de cum e configurat serverul.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Coș invalid." }, { status: 400 });
  }

  const items = parseCartPayload(payload);
  if (!items) {
    return Response.json({ error: "Coș invalid." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[checkout] STRIPE_SECRET_KEY lipsește.");
    return Response.json({ error: "Checkout indisponibil." }, { status: 500 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of items) {
    const price = resolvePriceIdForVariant({ size: item.size, color: item.color });
    if (!price) {
      console.error(`[checkout] lipsește Price ID pentru ${item.size}/${item.color}.`);
      return Response.json(
        { error: `Varianta ${item.size} / ${item.color} nu e disponibilă.` },
        { status: 409 },
      );
    }
    lineItems.push({
      price,
      quantity: item.quantity,
      adjustable_quantity: { enabled: true, minimum: 1, maximum: MAX_QUANTITY_PER_ITEM },
    });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // Adresa de livrare ajunge la atelier; cea de facturare e necesară pentru factura SmartBill.
      shipping_address_collection: { allowed_countries: ["RO"] },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      locale: "ro",
      success_url: `${SITE_URL}/comanda-confirmata`,
      cancel_url: SITE_URL,
    });

    if (!session.url) throw new Error("Stripe nu a returnat un URL de checkout.");
    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "eroare necunoscută";
    console.error(`[checkout] crearea sesiunii a eșuat: ${message}`);
    return Response.json({ error: "Nu am putut porni plata." }, { status: 502 });
  }
}
