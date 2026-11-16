import {
  all,
  one,
  stmt,
  db,
  id,
  now,
  str,
  required,
  check,
  error,
  response,
  passwordHash,
  same,
  session,
  sha,
  csrf,
} from '@/lib/server';
import { env } from 'cloudflare:workers';
import { validSetupToken } from '@/lib/admin-setup';
export async function POST(req: Request) {
  try {
    csrf(req);
    const b: any = await req.json();
    check(
      b && typeof b === 'object' && !Array.isArray(b),
      'Dữ liệu không hợp lệ.',
    );
    const action = str(b.action);
    if (action === 'logout') {
      const t = req.headers
        .get('cookie')
        ?.match(/(?:^|;\s*)th_session=([^;]+)/)?.[1];
      if (t)
        await stmt('DELETE FROM sessions WHERE token=?', await sha(t)).run();
      return response({ ok: true }, 200, {
        'Set-Cookie': 'th_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      });
    }
    const email = required(b.email, 'email', 150).toLowerCase();
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Email không hợp lệ.');
    const password = typeof b.password === 'string' ? b.password : '';
    check(
      password.length >= 8 && password.length <= 128,
      'Mật khẩu cần từ 8 đến 128 ký tự.',
    );
    const key = await sha(
      (req.headers.get('cf-connecting-ip') || 'local') + ':' + email,
    );
    const lim = await one('SELECT * FROM auth_limits WHERE key=?', key);
    check(
      !lim || lim.reset_at < Date.now() || lim.attempts < 12,
      'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.',
      429,
    );
    await stmt(
      'INSERT INTO auth_limits(key,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END',
      key,
      Date.now() + 900000,
      Date.now(),
      Date.now(),
      Date.now() + 900000,
    ).run();
    if (action === 'login') {
      const u = await one('SELECT * FROM users WHERE email=?', email);
      const h = await passwordHash(
        password,
        u?.password_hash?.split(':')[0] || '00000000000000000000000000000000',
      );
      check(
        u && same(h, u.password_hash),
        'Email hoặc mật khẩu không đúng.',
        401,
      );
      check(
        u.status === 'active',
        'Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên.',
        403,
      );
      delete u.password_hash;
      return session(req, u);
    }
    check(
      action === 'register' || action === 'setup',
      'Thao tác không hợp lệ.',
    );
    let role = str(b.role);
    let setupIdentity = '';
    if (action === 'setup') {
      const authorized = await validSetupToken(env as { ADMIN_SETUP_TOKEN?: string }, b.setupToken);
      check(
        authorized,
        'Mã thiết lập không hợp lệ hoặc chưa được cấu hình.',
        403,
      );
      check(
        !(await one('SELECT id FROM users WHERE role=?', 'admin')),
        'Hệ thống đã có quản trị viên.',
        409,
      );
      setupIdentity = 'cloudflare-owner';
      role = 'admin';
    } else
      check(['candidate', 'employer'].includes(role), 'Vai trò không hợp lệ.');
    const uid = id();
    const name = required(b.name, 'họ tên', 150);
    const hash = await passwordHash(password);
    const statements = [
      stmt(
        'INSERT INTO users(id,email,password_hash,role,name,created_at) VALUES(?,?,?,?,?,?)',
        uid,
        email,
        hash,
        role,
        name,
        now(),
      ),
      stmt('INSERT INTO profiles(user_id) VALUES(?)', uid),
    ];
    if (action === 'setup')
      statements.unshift(
        stmt(
          'INSERT INTO setup(id,value) VALUES(?,?)',
          'admin_initialized',
          setupIdentity,
        ),
      );
    await db().batch(statements);
    return session(req, { id: uid, email, role, name, status: 'active' });
  } catch (e) {
    return error(e);
  }
}
