import { Resend } from "resend";
import { SELLER } from "@/lib/legal";
import { readShopInboxes } from "@/lib/mail";
import {
  buildCustomerHtml,
  buildCustomerSubject,
  buildProviderHtml,
  buildProviderSubject,
  type Order,
} from "@/lib/orders";

export async function sendOrderEmails(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const inboxes = readShopInboxes();

  if (!apiKey || !from) {
    throw new Error(
      "Configurație incompletă: RESEND_API_KEY sau RESEND_FROM_EMAIL lipsesc.",
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
            to: inboxes.recipients,
            replyTo: SELLER.email,
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
          replyTo: SELLER.email,
          subject: buildCustomerSubject(order),
          html: buildCustomerHtml(order),
        }),
    });
  } else {
    console.warn(
      `[order-mail] comanda ${order.orderId} nu are email de client — trimit doar către magazin și atelier.`,
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
    .filter((item): item is string => item !== null);

  if (failures.length > 0) throw new Error(failures.join(" | "));
}
