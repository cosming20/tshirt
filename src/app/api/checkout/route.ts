import Stripe from "stripe";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart";
import { parseCheckoutRequest } from "@/lib/checkout";
import { resolvePriceIdForVariant } from "@/lib/orders";
import { shippingToMetadata } from "@/lib/shipping";
import { SITE_URL } from "@/lib/site";

/**
 * Creează o sesiune de checkout Stripe din coșul clientului. Înlocuiește
 * Payment Links: acolo fiecare link avea line items ficși, deci mărimi diferite
 * însemnau plăți separate. Aici liniile se compun dinamic, dar prețurile se
 * rezolvă pe server după mărime+culoare — clientul nu poate influența suma.
 */
export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Coș invalid." }, { status: 400 });
  }

  const checkout = parseCheckoutRequest(payload);
  if (!checkout) {
    return Response.json({ error: "Completează adresa de livrare." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[checkout] STRIPE_SECRET_KEY lipsește.");
    return Response.json({ error: "Checkout indisponibil." }, { status: 500 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of checkout.items) {
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

  const { shipping } = checkout;

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      billing_address_collection: "required",
      locale: "ro",
      metadata: shippingToMetadata(shipping),
      payment_intent_data: {
        shipping: {
          name: shipping.fullName,
          phone: shipping.phone,
          address: {
            line1: shipping.line1,
            line2: shipping.line2 ?? undefined,
            city: shipping.city,
            state: shipping.county,
            postal_code: shipping.postalCode,
            country: "RO",
          },
        },
      },
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
