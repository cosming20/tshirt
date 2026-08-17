# Guta Tricou

Site cu un singur produs (Next.js), gata de hostat pe Vercel free tier. Plata se face
prin Stripe Payment Links — nu există backend/API de checkout, doar redirect direct
către checkout-ul găzduit de Stripe.

## Setup local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Configurare

- **Text produs, preț, descriere, textele din Îngrijire/Detalii/Livrare** →
  `src/lib/product.ts`.
- **Imagini produs** → pune fișierele (jpg/png/webp) în `public/product/`. Sunt
  afișate automat, în ordine alfabetică, ca galerie principală + thumbnails. Nu e
  nevoie de nicio configurare suplimentară.
- **Linkuri de plată Stripe** → în `.env.local`, câte un `NEXT_PUBLIC_STRIPE_LINK_<MĂRIME>`
  per mărime (S/M/L/XL/XXL). Se creează din Stripe Dashboard → Payment Links → New,
  folosind produsul deja existent în Stripe (un Payment Link separat per mărime).
  Vezi `.env.local.example`.

## Deploy pe Vercel

1. `vercel link` (sau importă repo-ul din dashboard-ul Vercel).
2. Adaugă în Vercel → Project Settings → Environment Variables aceleași chei din
   `.env.local`.
3. `vercel deploy --prod` sau push pe branch-ul conectat.
4. Când ai domeniul, îl adaugi din Vercel → Domains — nu necesită nicio schimbare de cod.
