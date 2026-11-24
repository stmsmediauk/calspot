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

/** A Playtomic level (0 to 7, one decimal) from what a coach typed, such as "4.5" or "4,5". */
export function playtomicLevel(input: string): string | null {
  const text = input.trim().replace(",", ".");
  if (!/^\d(\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text);
  return value >= 0 && value <= 7 ? value.toFixed(1) : null;
}
