import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Politica pe boți e împărțită după ce *face* fiecare bot, nu după cine îl trimite.
 * Distincția contează: un bot de „retrieval” aduce pagina în răspunsul pe care îl
 * citește un om (ChatGPT, Perplexity, Google AI Overviews) și pune un link înapoi
 * spre noi; un bot de antrenare doar copiază textul în datele unui model.
 *
 * Greșeala clasică e să blochezi tot ce sună a AI: dacă blochezi OAI-SearchBot sau
 * PerplexityBot, dispari din răspunsurile lor cu totul. Pentru un produs de nișă,
 * care se vinde prin notorietate, asta e exact invers față de ce vrem.
 *
 * Regulile pe user-agent din robots.txt nu se cumulează: un bot citește doar grupul
 * cel mai specific care i se potrivește, deci fiecare grup de mai jos trebuie să-și
 * repete singur restricțiile de cale. De aici constanta comună.
 */

/**
 * Rutele fără conținut public. `/api/` sunt endpointuri POST-only (checkout, webhook
 * Stripe, inbound Resend) — un crawler nu ia nimic util de acolo.
 *
 * `/comanda-confirmata` NU e listat intenționat: are deja `robots: { index: false }`
 * în metadata, iar un `Disallow` aici ar împiedica exact crawlerele care trebuie să
 * citească acel `noindex` să ajungă la el.
 */
const DISALLOWED_PATHS = ["/api/"];

/**
 * Căutare și răspunsuri: aceștia indexează sau aduc pagina la cererea unui om și
 * citează sursa. Blocarea oricăruia ne scoate din rezultatele lui. Se permit toți.
 *
 * Bingbot contează dublu: indexul Bing alimentează Bing, Copilot și o mare parte din
 * ChatGPT Search, deci e o singură permisiune pentru trei suprafețe de răspuns.
 */
const ANSWER_ENGINE_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Applebot",
  "DuckAssistBot",
  "MistralAI-User",
];

/**
 * Crawlere de antrenare ale companiilor care operează și un motor de răspuns.
 * Le lăsăm să treacă deliberat: pentru un drop limitat, faptul că modelele „știu”
 * din start ce e AMENDAT PENTRU ARTĂ și cine îl vinde e reclamă gratuită, iar
 * pagina nu conține nimic proprietar de protejat — e un landing page de marketing.
 *
 * Google-Extended și Applebot-Extended sunt doar token-uri de opt-out din antrenare;
 * nu au crawler propriu și nu influențează în niciun fel indexarea în Search sau Siri.
 */
const TRAINING_BOTS_WE_FEED = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

/**
 * Scraping pur: colectează conținutul fără să existe vreo suprafață unde site-ul să
 * fie citat sau de unde să vină trafic. CCBot alimentează un dataset revândut mai
 * departe, fără atribuire. Bytespider și Perplexity-User au istoric documentat de
 * ignorare a robots.txt — regula rămâne o declarație de intenție; oprirea reală, dacă
 * devine nevoie, se face din WAF/Vercel Firewall, nu de aici.
 */
const SCRAPE_ONLY_BOTS = [
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "Amazonbot",
  "Diffbot",
  "ImagesiftBot",
  "omgilibot",
  "Timpibot",
  "PanguBot",
  "AI2Bot",
  "Webzio-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: ANSWER_ENGINE_BOTS, allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: TRAINING_BOTS_WE_FEED, allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: SCRAPE_ONLY_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
