/**
 * The public address of the site, used for canonical links, the sitemap, robots.txt,
 * share images and structured data. Set NEXT_PUBLIC_SITE_URL once the live domain is
 * ready. Until then it falls back to Vercel's production address (the vercel.app URL).
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Whether search engines may index the site. Off by default so the vercel.app
 * address stays out of search results until launch. Set NEXT_PUBLIC_INDEXABLE
 * to "true" on the live domain.
 */
export function isIndexable() {
  return process.env.NEXT_PUBLIC_INDEXABLE === "true";
}
