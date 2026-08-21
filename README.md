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

Structura: **un produs cu 10 prețuri** (5 mărimi × 2 culori). **Fără Payment Links** —
`/api/checkout` creează sesiunea din coș, ca mai multe mărimi să încapă într-o singură
plată. Setările care altfel s-ar bifa pe fiecare link (adresă de livrare, adresă de
facturare, telefon, cantitate ajustabilă) sunt în cod.

1. Creează produsul cu primul preț (150 RON, **tax behavior: inclusive**), apoi adaugă
   celelalte 9 din Product → Pricing → Add another price. Dă fiecăruia un nickname de
   forma `S · negru`.
2. Adaugă pe produs metadata `cod_produs` = codul din nomenclatorul SmartBill.
3. Pune cele 10 **Price ID**-uri (`price_…`, nu `prod_…`) în
   `STRIPE_PRICE_ID_<MĂRIME>_<CULOARE>`.

Prețurile nu circulă niciodată prin browser: clientul trimite doar mărime, culoare și
cantitate, iar serverul rezolvă Price ID-ul din variabilele de mediu. Payload-ul e
validat în `src/lib/cart.ts` (variante inexistente, cantități negative/fracționare/peste
plafon și variante duplicate sunt respinse cu 400).

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

## Adresa de contact (contact@tricouamenda.ro)

Adresa publică din footer nu e un inbox real — e redirectată către inboxul personal, ca
să nu publicăm o adresă privată. Fluxul: Resend primește mesajul pe domeniu, trimite
evenimentul `email.received` către `/api/resend/inbound`, care verifică semnătura Svix
pe corpul brut și cheamă `emails.receiving.forward` cu `passthrough: true` (mesaj
original + atașamente, neatinse).

1. Resend → Domains → `tricouamenda.ro` → activează **Receiving**, apoi adaugă în Vercel
   recordul MX primit. Nu intră în conflict cu trimiterea, care folosește subdomeniul
   `send.`
2. Resend → Webhooks → Add endpoint → `https://tricouamenda.ro/api/resend/inbound`,
   eveniment `email.received`. Signing secret → `RESEND_WEBHOOK_SECRET`.
3. `CONTACT_FORWARD_TO` = adresa reală unde vrei mesajele.

Ruta întoarce **500** la eșec (spre deosebire de webhook-ul de comenzi, care întoarce
200), ca Resend să reîncerce: aici o reîncercare chiar poate reuși, iar un email de
client pierdut nu se recuperează.

Ca să și *răspunzi* de pe adresa magazinului, adaugă-o în Gmail la Send mail as, cu SMTP
`smtp.resend.com:465`, user `resend`, parola = API key-ul.

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
