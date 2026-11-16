export function resumeLink(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return null;
    return url.href;
  } catch { return null; }
}
