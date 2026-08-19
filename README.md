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

1. Pentru fiecare mărime (S/M/L/XL/XXL), creează un **Payment Link** separat în
   Stripe Dashboard → Payment Links → New, folosind produsul existent.
2. Pe fiecare din cele 5 linkuri, adaugă un **custom field** pentru culoare:
   Edit link → Add custom field → tip **Dropdown**, key = `culoare`, cu două opțiuni
   ale căror **chei** (nu doar etichetele) sunt exact `negru` și `alb`. Un singur link
   acoperă ambele culori — clientul alege culoarea direct la checkout Stripe.
3. Pune cele 5 URL-uri în `.env.local` (`NEXT_PUBLIC_STRIPE_LINK_*`).
4. Ia **Price ID**-ul din spatele fiecărui link (Products → [mărime] → sub preț) și
   pune-le în `STRIPE_PRICE_ID_*` — sunt folosite de webhook ca să știe ce mărime s-a
   vândut.

## Configurare notificare furnizor (webhook + email)

De fiecare dată când Stripe confirmă o plată (`checkout.session.completed`), endpoint-ul
`/api/stripe/webhook` verifică semnătura, extrage mărime/culoare/cantitate din comandă
și trimite un email prin Resend către `PROVIDER_EMAIL`.

1. **Stripe:** Developers → API keys → copiază cheia secretă în `STRIPE_SECRET_KEY`.
2. **Stripe webhook:** Developers → Webhooks → Add endpoint → URL =
   `https://tricouamenda.ro/api/stripe/webhook`, eveniment = `checkout.session.completed`.
   Copiază "Signing secret" în `STRIPE_WEBHOOK_SECRET`.
3. **Resend:** cont gratuit pe resend.com (fără card, 3000 emailuri/lună), verifică
   domeniul `tricouamenda.ro` (adaugă recordurile DNS pe care ți le dă Resend), creează
   un API key → `RESEND_API_KEY`. Setează `RESEND_FROM_EMAIL` pe o adresă de pe acel
   domeniu (ex: `comenzi@tricouamenda.ro`).
4. **`PROVIDER_EMAIL`** → adresa reală a furnizorului care primește comenzile.

Testare locală fără credite reale: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
(Stripe CLI) sau `stripe trigger checkout.session.completed`.

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
