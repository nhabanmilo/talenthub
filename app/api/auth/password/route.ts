import { csrf, error, response } from '@/lib/server';
import { passwordRecovery } from '@/lib/password-reset';
export async function POST(req: Request) {
  try { csrf(req); return response(await passwordRecovery(req, await req.json())); }
  catch (e) { return error(e); }
}
