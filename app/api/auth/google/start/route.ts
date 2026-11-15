import {
  googleConfig,
  googleReady,
  randomToken,
  challenge,
} from '@/lib/google';
import { current, csrf, sha, stmt, response, error, check } from '@/lib/server';
export async function POST(req: Request) {
  try {
    csrf(req);
    check(
      googleReady(),
      'Google chưa được cấu hình. Vui lòng dùng email và mật khẩu.',
      503,
    );
    const c = googleConfig();
    check(
      new URL(req.url).origin === c.origin,
      'Địa chỉ website không khớp cấu hình Google.',
      400,
    );
    const body = (await req.json()) as { link?: boolean; role?: string };
    check(body && typeof body === 'object', 'Dữ liệu không hợp lệ.');
    const u = await current(req);
    check(!body.link || u, 'Đăng nhập trước khi liên kết Google.', 401);
    const role = body.role === 'employer' ? 'employer' : 'candidate';
    const state = randomToken(),
      verifier = randomToken();
    await stmt('DELETE FROM oauth_states WHERE expires_at<?', Date.now()).run();
    await stmt(
      'INSERT INTO oauth_states(state_hash,verifier,user_id,role,expires_at) VALUES(?,?,?,?,?)',
      await sha(state),
      verifier,
      body.link ? u!.id : null,
      role,
      Date.now() + 600000,
    ).run();
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: c.clientId,
      redirect_uri: c.origin + '/api/auth/google/callback',
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: await challenge(verifier),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    return response({ url: url.href }, 200, {
      'Set-Cookie': `th_google_state=${state}; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    });
  } catch (e) {
    return error(e);
  }
}
