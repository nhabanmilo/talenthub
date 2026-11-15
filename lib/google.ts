import { env } from 'cloudflare:workers';
export function googleConfig() {
  const e = env as unknown as Record<string, string | undefined>;
  const origin = e.APP_URL || '';
  return {
    clientId: e.GOOGLE_CLIENT_ID || '',
    secret: e.GOOGLE_CLIENT_SECRET || '',
    origin: origin.replace(/\/$/, ''),
  };
}
export function googleReady() {
  const c = googleConfig();
  return !!(c.clientId && c.secret && c.origin.startsWith('https://'));
}
export const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
export async function challenge(value: string) {
  return btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
      ),
    ),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
export function safeGooglePicture(value: unknown) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' &&
      (url.hostname === 'lh3.googleusercontent.com' ||
        /^lh\d+\.googleusercontent\.com$/.test(url.hostname))
      ? url.href
      : '';
  } catch {
    return '';
  }
}
