# SEO Research — tricouamenda.ro (AMENDAT PENTRU ARTĂ)

## Method note
This research used direct Read/Bash/Grep on the repo and WebSearch for market/competitor
discovery, per explicit instruction to avoid the repo's context-mode MCP routing for this
task. One limitation: a repo-level hook blocked WebFetch outright ("context-mode: WebFetch
blocked... use ctx_fetch_and_index") and the Chrome browser extension was not connected in
this session, so competitor title/meta tags below are reconstructed from WebSearch snippets
and known site positioning rather than fetched raw HTML. No live keyword-volume tool (GSC,
Keyword Planner, Ahrefs) was available — search-term picks are qualitative/directional,
based on real query patterns surfaced by WebSearch, not verified monthly volumes.

## 1. What the site currently ships (verified in repo)
- `src/app/layout.tsx`: title `"AMENDAT PENTRU ARTĂ — tricouamenda.ro"` (37 chars), description
  = `PRODUCT.seoDescription` (162 chars — see issue #1 below), keywords
  `["tricou", "streetwear România", "ediție limitată", "tricouamenda.ro"]`, canonical `/`,
  OG + Twitter card mirrored from the same title/description, `robots: index, follow`.
- `src/app/page.tsx`: single `Product` JSON-LD block with per-size/color `Offer`s (no
  `Organization`, `WebSite`, `BreadcrumbList`, or `FAQPage` in the graph).
- `src/app/opengraph-image.tsx`: dynamic OG image using `PRODUCT.eyebrow` + `PRODUCT.name` — good.
- `src/app/comanda-confirmata/page.tsx`: correctly `noindex, nofollow`.
- `src/app/sitemap.ts` / `robots.ts`: single-URL sitemap (homepage only), `allow: "/"` — correct
  for a one-page store; the noindexed confirmation page is intentionally left out of the
  sitemap and not blocked in robots.txt (right call — blocking it in robots.txt would hide
  the noindex tag from crawlers).
- One `<h1>` on the page (`ProductExperience.tsx:97`, the product name rendered over the hero
  image) — good, no heading hierarchy conflicts. Footer uses `<h2>` for "Vânzător" / "Retur și
  reclamații" / "Producător" (`SiteFooter.tsx`) — legitimate structure, not decorative divs.
  Images already use `next/image` with descriptive `alt` text (product name + "fotografie
  produs" / "imagine N").
- Brand voice source of truth: `PRODUCT.eyebrow`, `PRODUCT.seoDescription`, `STORY.lead`,
  `STORY.paragraphs`, `STORY.closer` in `src/lib/product.ts` — all recommendations below reuse
  this approved language rather than inventing new claims.

## 2. Keyword research (Romanian market)

No paid keyword-volume tool was available this session, so treat clusters as directionally
prioritized, not volume-ranked. Grouped by intent:

**A. Brand / exact-match (people who already heard of the product)**
- `amendat pentru artă` / `amendat pentru arta tricou`
- `tricouamenda.ro`
- `tricou amendat pentru artă`

These will be the highest-converting, lowest-volume terms — anyone typing them already knows
what they want. Title/H1/OG all correctly target this today; no change needed there.

**B. Incident/news-driven long-tail (people searching the real-world hook, not yet aware of
the product)**
The "amendă pe scenă" story pattern maps to real, well-documented Romanian cases — most
recently rapper **Albert NBN**, fined by the Jandarmerie for lyrics at the "Beach, Please!"
festival, and trapper **Gheboasă**, fined at UNTOLD in 2023 for the same reason (both widely
covered: ProTV, HotNews, Adevărul, G4Media). This is exactly the kind of real "viral fine"
moment the product's story voice is built around. Realistic queries in this space:
- `cântăreț amendat pe scenă`
- `amendă concert versuri România`
- `amendat de jandarmerie concert`
- `proces verbal cântăreț festival`

These won't convert 1:1, but they're the audience most primed to find the story funny/relatable
— worth capturing via the on-page story copy (already present) and, if the team ever writes a
short "story" blurb elsewhere (Instagram bio link, a press mention), linking back with this
phrasing. **Do not fabricate a claim that the shirt is based on one specific named artist/incident**
unless that's actually true and cleared for use — real people's names and fines are involved in
every case above, and implying a specific real person inspired the product without their
involvement is a legal/reputational risk, not just an SEO one. If the story's inspiration is
meant to stay a general "this happens in the RO scene" wink rather than one identified event,
keep the copy exactly as ambiguous as it is now.

**C. Product category (people shopping for this kind of item without brand awareness)**
- `tricou cu mesaj`
- `tricou provocator`
- `tricou streetwear românesc`
- `tricou ediție limitată`
- `tricou personalizat cu mesaj` (much higher-volume category, but dominated by print-on-demand
  players like Ruvix, City Print Shop, Tshirts.ro — see competitor notes; hard to rank against,
  and semantically these are personalization services, not a fit for a fixed single-SKU drop)
- `merch trupă românească` / `tricou trupă românească limited`

**D. Transactional modifiers** — combine with A/C: `cumpără`, `unde găsesc`, `preț`, `mărimi`.
Given the single SKU and 5-size/2-color matrix, `ghid mărimi tricou` is a real supporting query
already answered on-page (`SIZE_GUIDE_PANEL` in `product.ts`) but not currently surfaced to
search engines as structured content (see recommendation #4 below).

## 3. Competitor / reference scan

Closest direct comparables found via WebSearch (site content reconstructed from search
snippets, not fetched — see method note):

| Site | Positioning | Relevant pattern |
|---|---|---|
| **urbanlevel.ro** | Romanian streetwear, "Made in România", explicitly markets limited drops ("fiecare piesă e gândită să rămână un statement, nu un produs banal") | Closest direct analog: small RO streetwear brand leaning on scarcity + statement-piece framing, same as this product |
| **unfazed.ro** | Streetwear collections, "limited collaborations" | Category-page structure (`/collections/tricouri-hanorace`) — Shopify-style, generic titles |
| **shop-nbn.com** | Albert NBN's own artist merch store | Direct parallel: an artist who *himself* went viral for an on-stage fine now sells merch directly — validates the "real incident → merch" model as a proven pattern in this exact RO scene |
| **metalheadmerch.ro**, **delatitus.ro** | Official band merch marketplaces (500+ licensed bands) | These win on breadth/catalog SEO, not on any single product's story — no gap to compete on per-SKU pages, but confirms "tricou trupă românească" as a live search category |
| Personalization shops (ruvix.ro, tshirts.ro, tricoupersonalizat.ro, City Print Shop) | High-volume "tricou personalizat" category | Not a real competitor for this SKU — different intent (build-your-own vs. buy-the-drop) — don't chase their head terms |

**Gap to exploit**: none of the streetwear/merch competitors found build their SEO around a
*specific real incident* the way this product's story does. That's a genuine "Information
Gain" angle — a page that tells one concrete, true, colorful story (already written in
`STORY.paragraphs`) beats generic "streetwear pentru cei care..." copy every competitor uses.
The current page underuses this asset for search engines: the story is real body copy (good),
but none of it is marked up as structured data (`Article`/`FAQPage`) or excerpted into the
meta description in a way that leads with the hook. Recommendation #2 below fixes the second
half of that.

## 4. Concrete recommendations

### 4a. Title tag — 3 options (char counts verified)

1. **Keep current** — `AMENDAT PENTRU ARTĂ — tricouamenda.ro` (37 chars). Already short, exact
   product-name match, includes domain. Safe baseline if you don't want to touch it.
2. **Ship this** — `AMENDAT PENTRU ARTĂ — Tricou Limited Drop | tricouamenda.ro` (59 chars).
   Adds the two category words ("tricou", "limited drop") most likely to appear in someone's
   query when they don't yet know the brand name, while keeping the branded hook first and the
   domain last.
3. **RO-only alternative** — `AMENDAT PENTRU ARTĂ — Tricou Ediție Limitată, tricouamenda.ro`
   (61 chars, 1 over the soft 60-char guide — Google's cutoff is pixel-width not char-count, so
   this will very likely still render fully, but it's the tightest of the three).

**Recommendation: option 2.**

### 4b. Meta description — 3 options (char counts verified, all built from existing approved copy)

1. `Nu toate versurile rămân doar pe scenă — unele vin și cu proces-verbal. Tricou AMENDAT
   PENTRU ARTĂ, ediție limitată, 100% bumbac, confecționat în România.` (154 chars) — leads
   with the exact `STORY.lead` line verbatim, then closes with factual product details already
   in `DETAIL_PANELS`.
2. `Tricou ediție limitată care transformă o amendă primită pe scenă în piesă de merch. Amenda
   e reală. Tricoul e și mai real. Livrare în 2-4 zile în România.` (154 chars) — trims the
   current live description and closes with the real shipping window instead of the truncated
   punchline.
3. `O amendă primită pe scenă, transformată în piesă de merch. Nu toate versurile rămân doar pe
   scenă — unele vin și cu proces-verbal.` (130 chars) — closest to a minimal edit of the
   current copy, just short enough that the punchline is never cut off.

**Recommendation: option 1.** It puts the strongest, most quotable line first (best for
curiosity clicks from incident-driven searchers, cluster B above) and still fits comfortably
under the truncation limit.

### 4c. Current meta description issue (flag, not blocking)
`PRODUCT.seoDescription` is **162 characters**. Google's display cutoff is pixel-width based,
roughly 155–160 characters for this kind of text — so the current description is right on the
edge and risks being truncated mid-word inside "proces-verbal", which is the single best line
in the copy. This is worth fixing regardless of which title is picked, independently of the
title change.

### 4d. Revised `keywords` array
```ts
keywords: [
  "tricou amendat pentru artă",
  "tricou cu mesaj",
  "streetwear românesc",
  "tricou ediție limitată",
  "tricou limited drop",
  PRODUCT.nav.brand,
],
```
Rationale: keeps the brand/domain entry, replaces generic `"tricou"` and `"ediție limitată"`
with more specific two/three-word phrases that match how people actually search, adds
`"tricou cu mesaj"` (cluster C) and `"streetwear românesc"` (closer to the `urbanlevel.ro`-style
positioning). Note: the `<meta name="keywords">` tag itself has ~zero weight in Google ranking
today — this change is low-priority housekeeping, not a ranking lever. Don't expect it to move
anything on its own.

### 4e. On-page copy suggestions (flag only — not auto-applied, brand voice is deliberate)
- A one-line FAQ-style addition near the size guide or detail panels — e.g. "Tricoul e disponibil
  doar în România?" / "Din ce e făcut tricoul?" — answered with facts already in
  `DETAIL_PANELS` (100% bumbac, DTG, made in România, livrare 2-4 zile). This would double as
  content for an `FAQPage` JSON-LD block (see 4f) and for AI-answer-engine citation (AEO), since
  short claim→evidence Q&A pairs are exactly what gets pulled into AI Overviews/Perplexity
  answers. Needs a copywriting pass to match the site's irreverent tone — the two example
  questions above are functional placeholders, not final copy.
- Image alt text already reuses the product name well; if new product photos are ever added,
  consider varying the alt text per angle/color (e.g. "AMENDAT PENTRU ARTĂ — tricou negru, print
  frontal") instead of the current generic "imagine N" pattern — minor, only matters if Google
  Images becomes a traffic channel worth optimizing for.

### 4f. Technical/on-page issues worth fixing
1. **Meta description length (162 chars)** — see 4c. Concrete, real, fixable with any of the
   4b options.
2. **JSON-LD graph is Product-only.** Adding an `Organization` node (seller = Din Viitor
   S.R.L., per `src/lib/legal.ts`) linked to the `Product` via `brand`/`seller` would strengthen
   trust signals for a single-SKU store with no other pages to establish authority — this is a
   real gap, not padding, since right now there's no structured signal identifying who's behind
   the site at all. Low effort: it's data already in `legal.ts`.
3. Everything else checked (sitemap, robots.txt, canonical, single H1, `next/image` usage,
   noindex on the confirmation page, footer heading structure) is already correct — no changes
   needed there.

## Sources consulted
- [Albert NBN, amendat de Jandarmerie — PRO TV](https://www.protv.ro/articol/114651-albert-nbn-amendat-de-jandarmerie-dupa-ce-a-injurat-romania-pe-scena-festivalului-beach-please)
- [Gheboasă acuză Jandarmeria de discriminare — HotNews](https://hotnews.ro/gheboasa-acuza-jandarmeria-de-discriminare-dupa-ce-a-fost-amendat-altii-au-avut-versuri-mai-rele-eu-iubesc-tiganii-si-i-reprezint-cum-sa-i-discriminez-50475)
- [Gheboasă a câștigat procesul pentru amenda de la Untold — Realitatea](https://www.realitatea.net/stiri/actual/gheboasa-a-castigat-procesul-pentru-amenda-de-la-untold-jandarmeria-trebuie-sai-plateasca-artistului-de-7-ori-mai-mult_677e928411ae8211fc11b55d)
- [Streetwear Made in România – UrbanLevel](https://www.urbanlevel.ro/blog/streetwear-ul-urbanlevel-stil-atitudine-%C8%99i-calitate-made-in-rom%C3%A2nia.html)
- [AlbertNBN Store: Official Merch & Vinyl — Merchbar](https://www.merchbar.com/r-b-hiphop-rap/albertnbn)
- [MetalHead Merch](https://metalheadmerch.ro/), [De la Titus — tricouri trupe românești](https://delatitus.ro/categorie-produs/tricouri-rock/tricouri-trupe-romanesti/)
- [Streetwear - Unfazed](https://unfazed.ro/collections/tricouri-hanorace)
