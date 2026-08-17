/**
 * Setează NEXT_PUBLIC_SITE_URL în .env.local (și în Vercel) cu domeniul final —
 * folosit pentru metadataBase, sitemap, robots.txt și datele structurate.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://guta-tricou.vercel.app"
).replace(/\/$/, "");
