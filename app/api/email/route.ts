import {
  all,
  one,
  stmt,
  db,
  now,
  id,
  check,
  error,
  response,
  requireUser,
  csrf,
} from '@/lib/server';
import { mailReady, dispatchMail, deliverSafely } from '@/lib/mail';
export async function GET(req: Request) {
  try {
    const u = await requireUser(req);
    const preference = await one(
      'SELECT enabled FROM email_preferences WHERE user_id=?',
      u.id,
    );
    const rows = await all(
      `SELECT o.id,o.subject,o.status,o.attempts,o.last_error,o.created_at,o.sent_at,o.provider_id,u.email recipient FROM email_outbox o JOIN users u ON u.id=o.user_id ${u.role === 'admin' ? '' : 'WHERE o.user_id=?'} ORDER BY o.created_at DESC LIMIT 100`,
      ...(u.role === 'admin' ? [] : [u.id]),
    );
    return response({
      configured: mailReady(),
      enabled: preference?.enabled !== 0,
      rows,
    });
  } catch (e) {
    return error(e);
  }
}
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req);
    const b: any = await req.json();
    check(b && typeof b === 'object', 'Dữ liệu không hợp lệ.');
    if (b.action === 'preference') {
      check(typeof b.enabled === 'boolean', 'Lựa chọn không hợp lệ.');
      await db().batch([
        stmt(
          'INSERT INTO email_preferences(user_id,enabled,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET enabled=excluded.enabled,updated_at=excluded.updated_at',
          u.id,
          b.enabled ? 1 : 0,
          now(),
        ),
        ...(b.enabled
          ? []
          : [
              stmt(
                "UPDATE email_outbox SET status='skipped',last_error='Người dùng đã tắt email.' WHERE user_id=? AND status IN ('pending','failed')",
                u.id,
              ),
            ]),
      ]);
      return response({ ok: true });
    }
    check(u.role === 'admin', 'Chỉ quản trị viên được xử lý hàng đợi.', 403);
    check(
      mailReady(),
      'Chưa cấu hình RESEND_API_KEY và EMAIL_FROM trên máy chủ.',
      409,
    );
    if (b.action === 'process') return response(await dispatchMail(10));
    if (b.action === 'test') {
      await stmt(
        'INSERT INTO notifications(id,user_id,content,created_at) VALUES(?,?,?,?)',
        id(),
        u.id,
        'Email kiểm tra kết nối Resend từ TalentHub.',
        now(),
      ).run();
      return response(await deliverSafely());
    }
    if (b.action === 'retry') {
      check(typeof b.id === 'string', 'Email không hợp lệ.');
      const job = await one('SELECT * FROM email_outbox WHERE id=?', b.id);
      check(
        job && job.status === 'failed',
        'Chỉ email gửi lỗi mới được thử lại.',
        409,
      );
      check(
        !job.first_attempt_at ||
          Date.now() - job.first_attempt_at < 23 * 3600000,
        'Cần kiểm tra kết quả trên Resend trước khi gửi lại sau 23 giờ.',
        409,
      );
      await stmt(
        "UPDATE email_outbox SET status='pending',attempts=0,next_attempt_at=0 WHERE id=? AND status='failed'",
        b.id,
      ).run();
      return response(await deliverSafely());
    }
    return response({ error: 'Thao tác không hợp lệ.' }, 400);
  } catch (e) {
    return error(e);
  }
}
