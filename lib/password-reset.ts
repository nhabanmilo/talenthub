import { one, stmt, db, sha, id, now, check, passwordHash } from './server';
import { mailConfig, mailReady } from './mail';
import { sendResend } from './mail-provider';

const generic = 'Nếu email thuộc tài khoản đang hoạt động, hệ thống sẽ gửi liên kết đặt lại mật khẩu. Hãy kiểm tra hộp thư và thư rác.';
export async function passwordRecovery(req: Request, body: any) {
  check(body && typeof body === 'object' && !Array.isArray(body), 'Dữ liệu không hợp lệ.');
  check(['request', 'reset'].includes(body.action), 'Thao tác không hợp lệ.');
  const time = Date.now();
  const ip = req.headers.get('cf-connecting-ip') || 'local';
  const rateKey = 'password-reset:' + await sha(ip);
  const rate = await stmt(`INSERT INTO auth_limits(key,attempts,reset_at) VALUES(?,1,?)
    ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END,
    reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING attempts`,
    rateKey, time+900000, time, time, time+900000).first<any>();
  check(rate.attempts <= 20, 'Bạn thao tác quá nhiều lần. Hãy thử lại sau 15 phút.', 429);
  if (body.action === 'request') {
    check(mailReady(), 'Chức năng khôi phục đang chờ cấu hình email. Vui lòng liên hệ quản trị viên.', 503);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    check(email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Email không hợp lệ.');
    const user = await one("SELECT id FROM users WHERE email=? AND status='active'", email);
    if (!user) return { message: generic };
    const recent = await one('SELECT token_hash FROM password_resets WHERE user_id=? AND expires_at>?', user.id, time+14*60000);
    if (recent) return { message: generic };
    const config = mailConfig();
    const url = new URL(config.url);
    check(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)), 'Địa chỉ website chưa được cấu hình đúng.', 503);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b=>b.toString(16).padStart(2,'0')).join('');
    await stmt('DELETE FROM password_resets WHERE expires_at<?', time).run();
    await stmt('INSERT INTO password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)', await sha(token), user.id, time+900000, now()).run();
    // Fragment keeps the token out of HTTP access logs and Referer headers.
    url.pathname = '/'; url.search = ''; url.hash = 'reset-password=' + token;
    await sendResend({id:id(),to:email,subject:'TalentHub - Đặt lại mật khẩu',text:`Bạn đã yêu cầu đặt lại mật khẩu TalentHub. Liên kết có hiệu lực 15 phút và chỉ dùng một lần:\n${url.href}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`},config);
    return { message: generic };
  }
  check(typeof body.token === 'string' && /^[a-f0-9]{64}$/.test(body.token), 'Liên kết không hợp lệ hoặc đã hết hạn.', 400);
  check(typeof body.password === 'string' && body.password.length >= 8 && body.password.length <= 128, 'Mật khẩu cần từ 8 đến 128 ký tự.');
  const hash = await sha(body.token);
  const reset = await one("SELECT r.user_id FROM password_resets r JOIN users u ON u.id=r.user_id WHERE token_hash=? AND used_at IS NULL AND expires_at>? AND u.status='active'", hash, time);
  check(reset, 'Liên kết không hợp lệ hoặc đã hết hạn.', 400);
  const password = await passwordHash(body.password);
  const claim = id();
  const results = await db().batch([
    stmt("UPDATE password_resets SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>? AND EXISTS(SELECT 1 FROM users WHERE id=password_resets.user_id AND status='active')",claim,hash,Date.now()),
    stmt('UPDATE users SET password_hash=? WHERE id=? AND EXISTS(SELECT 1 FROM password_resets WHERE token_hash=? AND used_at=?)',password,reset.user_id,hash,claim),
    stmt('DELETE FROM sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM password_resets WHERE token_hash=? AND used_at=?)',reset.user_id,hash,claim),
    stmt('UPDATE password_resets SET used_at=? WHERE user_id=? AND used_at IS NULL AND EXISTS(SELECT 1 FROM password_resets WHERE token_hash=? AND used_at=?)',claim,reset.user_id,hash,claim),
  ]);
  check(results[0].meta.changes === 1, 'Liên kết đã được sử dụng hoặc hết hạn.', 400);
  return { message: 'Đã đổi mật khẩu và đăng xuất các phiên cũ. Bạn có thể đăng nhập lại.' };
}
