import { sendResend } from './mail-provider';
import { env } from 'cloudflare:workers';
import { all, one, stmt, id, now } from './server';
export function mailConfig() {
  const e = env as unknown as Record<string, string | undefined>;
  return {
    key: e.RESEND_API_KEY || '',
    from: e.EMAIL_FROM || '',
    url:
      e.APP_URL ||
      'https://talenthub-viec-lam-080926.spite-mahouts9j.chatgpt.site',
    cron: e.MAIL_CRON_SECRET || '',
  };
}
export function mailReady() {
  const c = mailConfig();
  return !!(c.key && c.from);
}
export async function dispatchMail(limit = 4) {
  const c = mailConfig();
  if (!mailReady()) return { configured: false, processed: 0 };
  const queued = await all(
    `SELECT id FROM email_outbox WHERE (status IN ('pending','failed') AND next_attempt_at<=? AND attempts<5) OR (status='sending' AND lease_until<?) ORDER BY created_at LIMIT ?`,
    Date.now(),
    Date.now(),
    Math.min(20, limit),
  );
  let processed = 0;
  for (const row of queued) {
    const token = id();
    const t = Date.now();
    const job = await stmt(
      `UPDATE email_outbox SET status='sending',lock_token=?,lease_until=?,attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?) WHERE id=? AND ((status IN ('pending','failed') AND next_attempt_at<=? AND attempts<5) OR (status='sending' AND lease_until<?)) RETURNING *`,
      token,
      t + 60000,
      t,
      row.id,
      t,
      t,
    ).first<any>();
    if (!job) continue;
    const finish = (
      status: string,
      error = '',
      providerId: string | null = null,
    ) =>
      stmt(
        "UPDATE email_outbox SET status=?,last_error=?,provider_id=COALESCE(?,provider_id),sent_at=CASE WHEN ?='sent' THEN ? ELSE sent_at END,lease_until=NULL,lock_token=NULL,next_attempt_at=? WHERE id=? AND lock_token=?",
        status,
        error,
        providerId,
        status,
        now(),
        Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts),
        job.id,
        token,
      ).run();
    try {
      if (t - job.first_attempt_at >= 23 * 3600000) {
        await finish(
          'review',
          'Quá thời hạn chống gửi trùng. Cần kiểm tra trên Resend.',
        );
        continue;
      }
      const recipient = await one(
        'SELECT u.email,u.status,COALESCE(p.enabled,1) enabled FROM users u LEFT JOIN email_preferences p ON p.user_id=u.id WHERE u.id=?',
        job.user_id,
      );
      if (
        !recipient ||
        recipient.status !== 'active' ||
        !recipient.enabled ||
        /@.*(?:\.test|\.invalid)$|@example\.(?:com|net|org)$/i.test(
          recipient.email,
        )
      ) {
        await finish(
          'skipped',
          'Tài khoản ngừng hoạt động, tắt email hoặc địa chỉ thử nghiệm.',
        );
        continue;
      }
      const result = await sendResend(
        {
          id: job.id,
          to: recipient.email,
          subject: job.subject,
          text:
            job.body +
            '\n\nMở TalentHub: ' +
            c.url +
            '/?view=notifications\nQuản lý email: ' +
            c.url +
            '/?view=email',
        },
        c,
      );
      await finish(
        result.accepted ? 'sent' : 'failed',
        result.error,
        result.providerId,
      );
      processed++;
    } catch {
      await finish(
        'failed',
        'Không xác nhận được kết quả gửi. Sẽ thử lại với cùng khóa chống trùng.',
      );
    }
  }
  return { configured: true, processed };
}
export async function deliverSafely() {
  try {
    return await dispatchMail();
  } catch {
    return { configured: mailReady(), processed: 0 };
  }
}
