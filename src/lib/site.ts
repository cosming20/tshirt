/**
 * Setează NEXT_PUBLIC_SITE_URL în .env.local (și în Vercel) cu domeniul final —
 * folosit pentru metadataBase, sitemap, robots.txt și datele structurate.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://guta-tricou.vercel.app"
).replace(/\/$/, "");

/**
 * Actualizează manual data asta când schimbi conținutul real al paginii (preț, poze,
 * descriere) — folosită ca `lastModified` în sitemap.xml. Nu o lega de data build-ului:
 * un rebuild fără schimbări de conținut nu trebuie să pară o actualizare pentru Google.
 */
export const LAST_CONTENT_UPDATE = "2026-08-17";
