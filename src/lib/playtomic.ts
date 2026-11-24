/**
 * A club's Playtomic page, so a coach can check court times in one tap. Calspot
 * only stores and opens the link the coach pastes in. It never reads from or writes
 * to Playtomic, and it makes no promise about court reservations.
 */
export function playtomicUrl(input: string): string | null {
  const text = input.trim();
  if (!text || text.length > 300) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    const host = url.hostname.toLowerCase();
    const ok = /(^|\.)playtomic\.(com|io)$/.test(host);
    return url.protocol === "https:" && ok ? url.toString() : null;
  } catch {
    return null;
  }
}
