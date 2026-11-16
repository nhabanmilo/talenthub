import { googleConfig, googleReady, safeGooglePicture } from '@/lib/google';
import type { User } from '@/lib/server';
import {
  current,
  sha,
  same,
  stmt,
  one,
  db,
  id,
  now,
  session,
  check,
  files,
} from '@/lib/server';
export async function GET(req: Request) {
  const c = googleConfig();
  const finish = (code: string) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: '/?google=' + encodeURIComponent(code),
        'Cache-Control': 'no-store',
        'Set-Cookie':
          'th_google_state=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  try {
    check(googleReady(), 'Google chưa cấu hình.');
    const url = new URL(req.url),
      state = url.searchParams.get('state') || '';
    const cookie =
      req.headers
        .get('cookie')
        ?.match(/(?:^|;\s*)th_google_state=([^;]+)/)?.[1] || '';
    check(
      state && cookie && same(state, cookie),
      'Phiên đăng nhập không hợp lệ.',
    );
    const flow = await stmt(
      'DELETE FROM oauth_states WHERE state_hash=? AND expires_at>? RETURNING *',
      await sha(state),
      Date.now(),
    ).first<{ verifier: string; user_id: string | null; role: string }>();
    check(flow, 'Phiên đăng nhập đã hết hạn.');
    if (url.searchParams.get('error')) return finish('cancelled');
    const code = url.searchParams.get('code');
    check(code, 'Thiếu mã đăng nhập.');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: c.clientId,
        client_secret: c.secret,
        code: code!,
        code_verifier: flow!.verifier,
        redirect_uri: c.origin + '/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10000),
    });
    check(tokenRes.ok, 'Google từ chối mã đăng nhập.');
    const token = (await tokenRes.json()) as { access_token?: string };
    check(typeof token.access_token === 'string', 'Thiếu thông tin xác thực.');
    const infoRes = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: 'Bearer ' + token.access_token },
        signal: AbortSignal.timeout(10000),
      },
    );
    check(infoRes.ok, 'Không đọc được tài khoản Google.');
    const info = (await infoRes.json()) as {
      sub: string;
      email: string;
      email_verified: boolean;
      name?: string;
      picture?: string;
    };
    check(
      typeof info.sub === 'string' &&
        info.sub.length <= 255 &&
        info.email_verified === true &&
        typeof info.email === 'string' &&
        info.email.length <= 150,
      'Email Google chưa được xác minh.',
    );
    const identity = await one(
      'SELECT * FROM google_identities WHERE subject=?',
      info.sub,
    );
    let user: User;
    if (flow!.user_id) {
      const logged = await current(req);
      check(
        logged && logged.id === flow!.user_id,
        'Hãy đăng nhập lại trước khi liên kết.',
      );
      if (identity && identity.user_id !== logged!.id)
        return finish('already-linked');
      const other = await one(
        'SELECT subject FROM google_identities WHERE user_id=?',
        logged!.id,
      );
      if (other && other.subject !== info.sub) return finish('already-linked');
      user = logged!;
    } else if (identity)
      user = await one(
        'SELECT id,email,name,role,status FROM users WHERE id=?',
        identity.user_id,
      );
    else {
      const existing = await one(
        'SELECT id FROM users WHERE email=?',
        info.email.toLowerCase(),
      );
      // Never auto-link an existing password account by email alone.
      if (existing) return finish('link-required');
      user = {
        id: id(),
        email: info.email.toLowerCase(),
        name: String(info.name || info.email).slice(0, 150),
        role: flow!.role,
        status: 'active',
      };
      await db().batch([
        stmt(
          'INSERT INTO users(id,email,password_hash,role,status,name,created_at) VALUES(?,?,?,?,?,?,?)',
          user.id,
          user.email,
          'oauth-only',
          user.role,
          'active',
          user.name,
          now(),
        ),
        stmt('INSERT INTO profiles(user_id) VALUES(?)', user.id),
        stmt(
          'INSERT INTO google_identities(subject,user_id,picture) VALUES(?,?,?)',
          info.sub,
          user.id,
          safeGooglePicture(info.picture),
        ),
      ]);
    }
    check(user?.status === 'active', 'Tài khoản bị khóa.');
    await stmt(
      'INSERT INTO google_identities(subject,user_id,picture) VALUES(?,?,?) ON CONFLICT(subject) DO UPDATE SET picture=excluded.picture',
      info.sub,
      user.id,
      safeGooglePicture(info.picture),
    ).run();
    if (flow!.user_id && safeGooglePicture(info.picture))
      await files()?.delete(`avatars/${user.id}/profile`);
    const login = await session(req, user);
    const headers = new Headers({
      Location: '/?google=success',
      'Cache-Control': 'no-store',
    });
    headers.append('Set-Cookie', login.headers.get('set-cookie')!);
    headers.append(
      'Set-Cookie',
      'th_google_state=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    );
    return new Response(null, { status: 303, headers });
  } catch {
    return finish('failed');
  }
}
