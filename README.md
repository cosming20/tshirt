# Guta Tricou

Site cu un singur produs (Next.js), hostat pe Vercel, domeniu `tricouamenda.ro`. Plata se
face prin Stripe Payment Links. Un singur endpoint de backend (`/api/stripe/webhook`)
trimite automat un email furnizorului de fiecare dată când o comandă e plătită.

## Setup local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Configurare conținut

- **Text produs, preț, descriere, textele din Îngrijire/Detalii/Livrare/Ghid mărimi** →
  `src/lib/product.ts`.
- **Imagini produs** → pune fișierele (jpg/png/webp) în `public/product/`. Sunt
  afișate automat, în ordine alfabetică, ca galerie principală + thumbnails.
- **Stoc** → `STOCK` în `src/lib/product.ts`, actualizat manual de tine după fiecare
  comandă/reaprovizionare (nu există bază de date, nu scade automat).

## Configurare Stripe (checkout)

Structura: **un produs cu 10 prețuri** (5 mărimi × 2 culori), fiecare cu propriul
Payment Link. Culoarea e fixată de link, deci selecția de pe site determină complet ce
se cumpără — nu există pas în care clientul ar putea alege altceva decât ce a văzut.

1. Creează produsul cu primul preț (150 RON, **tax behavior: inclusive**), apoi adaugă
   celelalte 9 prețuri din Product → Pricing → Add another price. Dă fiecăruia un
   nickname de forma `S · negru`.
2. Adaugă pe produs metadata `cod_produs` = codul din nomenclatorul SmartBill.
3. Creează 10 Payment Links, câte unul per preț. Pe **fiecare** activează:
   - **Collect shipping address** (altfel nu ai unde livra)
   - **Billing address: required** (necesar pentru factură)
   - **Adjustable quantity** min 1 / max 10
4. Pune cele 10 URL-uri în `NEXT_PUBLIC_STRIPE_LINK_<MĂRIME>_<CULOARE>` și cele 10
   **Price ID**-uri (`price_…`, nu `prod_…`) în `STRIPE_PRICE_ID_<MĂRIME>_<CULOARE>`.
   Webhook-ul folosește Price ID-ul ca să știe ce variantă s-a vândut.

## Configurare emailuri (webhook + Resend)

La fiecare `checkout.session.completed`, endpoint-ul `/api/stripe/webhook` verifică
semnătura, extrage varianta și cantitatea, și trimite **două emailuri**: specificațiile
de fabricație către `PROVIDER_EMAIL` și confirmarea comenzii către client. Sunt trimise
individual (nu prin `resend.batch`, care nu suportă atașamente) cu `Promise.allSettled`,
deci eșecul unuia nu îl blochează pe celălalt.

1. **Stripe:** Developers → API keys → cheia secretă în `STRIPE_SECRET_KEY`.
2. **Stripe webhook:** Developers → Webhooks → Add endpoint → URL =
   `https://tricouamenda.ro/api/stripe/webhook`, eveniment = `checkout.session.completed`.
   Signing secret → `STRIPE_WEBHOOK_SECRET`.
3. **Resend:** cont gratuit pe resend.com, verifică domeniul `tricouamenda.ro` (adaugă
   recordurile DNS **în Vercel**, nu la registrar — vezi mai jos), creează un API key →
   `RESEND_API_KEY`. `RESEND_FROM_EMAIL` = adresă de pe domeniul verificat.
4. **`PROVIDER_EMAIL`** → adresa reală a producătorului.

Testare locală: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
(Stripe CLI) sau `stripe trigger checkout.session.completed`.

## Facturare (SmartBill, fără cod)

Facturile fiscale nu sunt generate de aplicație — SmartBill se conectează direct la
Stripe, vede fiecare plată și emite factura cu serie/număr legal, plus trimiterea în SPV
(obligatoriu în România). Aplicația doar pregătește Stripe pentru asta: preț
`tax_behavior: inclusive`, billing address obligatorie, și metadata `cod_produs` pe
produs pentru potrivirea cu nomenclatorul SmartBill.

Emailul de confirmare către client menționează explicit că factura vine separat, de la
SmartBill, ca să nu creeze așteptarea că e atașată.

## Configurare domeniu (`tricouamenda.ro`)

Domeniul e deja adăugat în proiectul Vercel (`tricouamenda.ro` și `www.tricouamenda.ro`).
La registrar, **nu** schimba nameserverele — doar adaugă:

```
A    tricouamenda.ro       76.76.21.21
A    www.tricouamenda.ro   76.76.21.21
```

Vercel emite automat certificatul SSL după ce recordurile propagă.

## Deploy pe Vercel

1. `vercel link` (deja făcut — proiectul e `guta_tricou`, conectat la
   `github.com/cosming20/tshirt`).
2. Adaugă în Vercel → Project Settings → Environment Variables toate cheile din
   `.env.local` (inclusiv cele fără `NEXT_PUBLIC_`, sunt server-only).
3. `vercel deploy --prod` sau push pe `main`.
