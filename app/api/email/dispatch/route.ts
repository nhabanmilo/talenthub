import { mailConfig, dispatchMail } from '@/lib/mail';
import { remindSavedJobs } from '@/lib/saved-job-reminders';
import { same, check, error, response } from '@/lib/server';
// Optional HTTPS scheduler hook; the secret is never accepted in a query string.
export async function POST(req: Request) {
  try {
    const secret = mailConfig().cron;
    const token =
      req.headers.get('authorization')?.replace(/^Bearer /, '') || '';
    check(secret.length >= 32 && same(token, secret), 'Không được phép.', 401);
    const reminders = await remindSavedJobs();
    return response({ ...(await dispatchMail(20)), reminders });
  } catch (e) {
    return error(e);
  }
}
