import { mailConfig, dispatchMail } from '@/lib/mail';
import { same, check, error, response } from '@/lib/server';
// Optional HTTPS scheduler hook; the secret is never accepted in a query string.
export async function POST(req: Request) {
  try {
    const secret = mailConfig().cron;
    const token =
      req.headers.get('authorization')?.replace(/^Bearer /, '') || '';
    check(secret.length >= 32 && same(token, secret), 'Không được phép.', 401);
    return response(await dispatchMail(20));
  } catch (e) {
    return error(e);
  }
}
