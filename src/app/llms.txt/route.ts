import { ANPC_LINKS, MANUFACTURER, RETURNS, SELLER } from "@/lib/legal";
import { COLORS, PRODUCT, SIZES } from "@/lib/product";
import { SITE_URL } from "@/lib/site";

/**
 * /llms.txt — rezumatul site-ului în markdown, după convenția de la llmstxt.org
 * (H1 = numele site-ului, blockquote = o frază de sumar, apoi secțiuni `##` cu linkuri).
 *
 * Onest despre ce e: niciun motor mare (Google, OpenAI, Anthropic, Perplexity) nu
 * consumă llms.txt la data de azi, iar studiile pe zeci de mii de domenii nu găsesc
 * nicio corelație între existența fișierului și citările AI. NU e o pârghie de
 * vizibilitate. Îl ținem pentru că e ieftin, pentru cazul în care un agent ajunge
 * deja pe site și vrea un rezumat curat, și pentru dacă vreun motor îl adoptă.
 *
 * Se generează din aceleași surse ca pagina (`product.ts`, `legal.ts`) tocmai ca să
 * nu apuce să mintă: un preț sau un termen de retur schimbat într-un singur loc se
 * propagă și aici. Orice text scris de mână mai jos trebuie să existe și pe pagină.
 *
 * `noindex` pe fișier: e un rezumat duplicat al paginii principale, nu are ce căuta
 * ca rezultat separat în SERP.
 */

const SIZE_LIST = SIZES.join(", ");
const COLOR_LIST = COLORS.map((color) => color.label.toLowerCase()).join(" și ");

function buildLlmsTxt(): string {
  return `# ${PRODUCT.nav.brand}

> Magazin online românesc cu un singur produs: „${PRODUCT.name}”, tricou în ediție limitată, ${PRODUCT.price} bucata, vândut de ${SELLER.name} și livrat exclusiv în România.

${PRODUCT.name} este un tricou care transformă o amendă primită pe scenă într-o piesă de merch. Site-ul are o singură pagină publică — pagina de produs — iar datele legale ale vânzătorului, condițiile de livrare și cele de retur se află în footerul aceleiași pagini. Nu există pagini separate de FAQ, „despre”, „termeni și condiții” sau blog, și nu există alt magazin, alt domeniu sau alt canal de comandă pentru acest produs.

Date verificabile despre produs și magazin:

- **Produs:** ${PRODUCT.name} — tricou în ediție limitată, un singur model.
- **Preț:** ${PRODUCT.priceAmount} ${PRODUCT.currency} bucata, plată online cu cardul.
- **Mărimi disponibile:** ${SIZE_LIST}.
- **Culori disponibile:** ${COLOR_LIST}.
- **Material:** 100% bumbac, ~205 g/m², croială clasică fără cusături laterale, print digital DTG (Direct-to-Garment).
- **Producție:** confecționat și printat în România de ${MANUFACTURER.name}.
- **Cum se comandă:** online, de pe pagina de produs — se alege mărimea și culoarea, se adaugă în coș și se plătește cu cardul prin Stripe. Nu se comandă prin email sau telefon.
- **Livrare:** prin curier, în 2–4 zile lucrătoare, doar la adrese din România. Nu se livrează în afara României.
- **Retur:** gratuit, în ${RETURNS.windowDays} zile de la primire. ${RETURNS.note}
- **Vânzător:** ${SELLER.name}, CUI ${SELLER.cui}, Reg. Com. ${SELLER.regCom}.
- **Contact:** ${SELLER.email} — singurul canal pentru comenzi, retururi și reclamații.
- **Limba site-ului:** română.

## Pagini

- [${PRODUCT.name} — pagina de produs](${SITE_URL}/): Singura pagină indexabilă a site-ului. Conține povestea din spatele produsului, selectorul de mărime și culoare cu stocul pe fiecare variantă, prețul, ghidul de mărimi în cm și inch, detaliile de material și îngrijire, condițiile de livrare și retur și datele legale ale vânzătorului.

## Informații legale și contact

- [Email vânzător](mailto:${SELLER.email}): Adresa de contact a ${SELLER.name} pentru comenzi, retur în ${RETURNS.windowDays} zile și reclamații.
- [${ANPC_LINKS.sal.label}](${ANPC_LINKS.sal.href}): ${ANPC_LINKS.sal.caption} — procedura ANPC pentru litigii cu comercianții din România.

## Optional

- [sitemap.xml](${SITE_URL}/sitemap.xml): Harta site-ului; conține o singură adresă, pagina de produs.
- [robots.txt](${SITE_URL}/robots.txt): Regulile de crawling pe user-agent, inclusiv pentru crawlerele AI.
`;
}

// Conținutul e derivat exclusiv din module-level constants (product.ts, legal.ts) —
// nimic la nivel de request — deci se poate genera o singură dată la build, la fel ca
// /robots.txt și /sitemap.xml. `cacheComponents` nu e activat în next.config.ts, deci
// `dynamic` din route segment config tot are efect (vezi Next 16 route-segment-config docs).
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
