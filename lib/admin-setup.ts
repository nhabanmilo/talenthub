export function setupEnabled(config: { ADMIN_SETUP_TOKEN?: string }): boolean {
  return typeof config.ADMIN_SETUP_TOKEN === 'string' && config.ADMIN_SETUP_TOKEN.length >= 32;
}
export async function validSetupToken(config: { ADMIN_SETUP_TOKEN?: string }, supplied: unknown): Promise<boolean> {
  if (!setupEnabled(config) || typeof supplied !== 'string' || supplied.length > 256) return false;
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([digest(config.ADMIN_SETUP_TOKEN!), digest(supplied)]);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
