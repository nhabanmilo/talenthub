import {
  all,
  one,
  stmt,
  db,
  id,
  now,
  check,
  error,
  response,
  requireUser,
  csrf,
} from '@/lib/server';
import { applicationAccess, writable, strictText } from '@/lib/communication';
import { deliverSafely } from '@/lib/mail';
export async function GET(req: Request) {
  try {
    const u = await requireUser(req, ['candidate', 'employer']);
    const p = new URL(req.url).searchParams;
    const aid = p.get('application');
    if (!aid) {
      const threads = await all(
        `SELECT a.id application_id,j.title job_title,c.name company_name,cu.name candidate_name,eu.name employer_name,
 (SELECT body FROM messages WHERE application_id=a.id ORDER BY id DESC LIMIT 1) last_message,
 (SELECT created_at FROM messages WHERE application_id=a.id ORDER BY id DESC LIMIT 1) last_at,
 (SELECT COUNT(*) FROM messages WHERE application_id=a.id AND sender_id<>? AND read_at IS NULL) unread
 FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id JOIN users cu ON cu.id=a.candidate_id JOIN users eu ON eu.id=j.created_by
 WHERE ${u.role === 'candidate' ? 'a.candidate_id' : 'j.created_by'}=? ORDER BY COALESCE(last_at,a.applied_at) DESC`,
        u.id,
        u.id,
      );
      return response({ threads });
    }
    const a = await applicationAccess(aid, u);
    const before = Number(p.get('before') || 0);
    check(Number.isSafeInteger(before) && before >= 0, 'Con trỏ không hợp lệ.');
    const rows = await all(
      `SELECT id,application_id,sender_id,body,read_at,created_at FROM messages WHERE application_id=? ${before ? 'AND id<?' : ''} ORDER BY id DESC LIMIT 51`,
      aid,
      ...(before ? [before] : []),
    );
    const more = rows.length > 50;
    const messages = rows.slice(0, 50).reverse();
    return response({
      messages,
      hasMore: more,
      canWrite:
        a.candidate_status === 'active' &&
        a.employer_status === 'active' &&
        a.company_status !== 'blocked',
      application: {
        id: a.id,
        job_title: a.job_title,
        company_name: a.company_name,
        candidate_name: a.candidate_name,
        employer_name: a.employer_name,
      },
    });
  } catch (e) {
    return error(e);
  }
}
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req, ['candidate', 'employer']);
    const b: any = await req.json();
    check(b && typeof b === 'object', 'Dữ liệu không hợp lệ.');
    const a = await applicationAccess(
      strictText(b.application_id, 'Hồ sơ', 100),
      u,
    );
    if (b.action === 'read') {
      check(
        Number.isSafeInteger(b.through) && b.through >= 0,
        'Con trỏ đọc không hợp lệ.',
      );
      await stmt(
        'UPDATE messages SET read_at=? WHERE application_id=? AND sender_id<>? AND id<=? AND read_at IS NULL',
        now(),
        a.id,
        u.id,
        b.through,
      ).run();
      return response({ ok: true });
    }
    check(b.action === 'send', 'Thao tác không hợp lệ.');
    writable(a);
    const text = strictText(b.body, 'Tin nhắn', 4000),
      client = strictText(b.client_id, 'Mã tin nhắn', 100);
    const existing = await one(
      'SELECT id,application_id,body FROM messages WHERE sender_id=? AND client_id=?',
      u.id,
      client,
    );
    if (existing) {
      check(
        existing.application_id === a.id && existing.body === text,
        'Mã gửi đã được dùng cho nội dung khác.',
        409,
      );
      return response({ ok: true, id: existing.id });
    }
    const recipient = u.id === a.candidate_id ? a.employer_id : a.candidate_id;
    const stamp = now();
    const result = await db().batch([
      stmt(
        'INSERT OR IGNORE INTO messages(application_id,sender_id,client_id,body,created_at) VALUES(?,?,?,?,?)',
        a.id,
        u.id,
        client,
        text,
        stamp,
      ),
      stmt(
        `INSERT INTO notifications(id,user_id,content,created_at) SELECT ?,?,?,? WHERE changes()=1`,
        id(),
        recipient,
        `${u.name} gửi tin nhắn mới về vị trí ${a.job_title}.`,
        stamp,
      ),
    ]);
    const saved = await one(
      'SELECT id,application_id,body FROM messages WHERE sender_id=? AND client_id=?',
      u.id,
      client,
    );
    check(
      saved?.application_id === a.id && saved.body === text,
      'Mã gửi trùng.',
      409,
    );
    await deliverSafely();
    return response({ ok: true, id: saved.id });
  } catch (e) {
    return error(e);
  }
}
