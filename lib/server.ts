import { env } from 'cloudflare:workers';
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};
export const db = () => (env as unknown as { DB: D1Database }).DB;
export const files = () => (env as unknown as { FILES: R2Bucket }).FILES;
export const now = () => new Date().toISOString();
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const id = () => crypto.randomUUID();
export const stmt = (sql: string, ...args: unknown[]) =>
  db()
    .prepare(sql)
    .bind(...args);
export async function all(sql: string, ...args: unknown[]) {
  return (await stmt(sql, ...args).all()).results as any[];
}
export async function one(sql: string, ...args: unknown[]) {
  return (await stmt(sql, ...args).first()) as any;
}
export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const check = (value: unknown, message: string, status = 400) => {
  if (!value) throw new HttpError(message, status);
};
export function str(v: unknown, max = 10000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
export function required(v: unknown, label: string, max = 10000) {
  const s = str(v, max);
  check(s, `Vui lòng nhập ${label}.`);
  return s;
}
export async function sha(v: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function passwordHash(
  password: string,
  salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(''),
) {
  const k = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const b = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
    },
    k,
    256,
  );
  return (
    salt +
    ':' +
    Array.from(new Uint8Array(b))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}
export function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let c = 0;
  for (let i = 0; i < a.length; i++) c |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return c === 0;
}
export async function current(req: Request): Promise<User | null> {
  const token = req.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)th_session=([^;]+)/)?.[1];
  if (!token) return null;
  return one(
    'SELECT u.id,u.email,u.name,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.status=?',
    await sha(token),
    Date.now(),
    'active',
  );
}
export async function requireUser(req: Request, roles?: string[]) {
  const u = await current(req);
  check(u, 'Vui lòng đăng nhập.', 401);
  check(
    !roles || roles.includes(u!.role),
    'Bạn không có quyền thực hiện thao tác này.',
    403,
  );
  return u!;
}
export function csrf(req: Request) {
  const origin = req.headers.get('origin');
  check(
    origin && origin === new URL(req.url).origin,
    'Nguồn yêu cầu không hợp lệ.',
    403,
  );
}
export function response(
  data: unknown,
  status = 200,
  headers: HeadersInit = {},
) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}
export function error(e: unknown) {
  if (e instanceof HttpError) return response({ error: e.message }, e.status);
  if (String(e).includes('UNIQUE constraint'))
    return response(
      { error: 'Dữ liệu đã tồn tại. Vui lòng kiểm tra và thử lại.' },
      409,
    );
  console.error(e);
  return response({ error: 'Không thể xử lý yêu cầu. Vui lòng thử lại.' }, 500);
}
export async function session(req: Request, u: User) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
  await stmt(
    'INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)',
    await sha(token),
    u.id,
    Date.now() + 7 * 86400000,
  ).run();
  return response({ user: u }, 200, {
    'Set-Cookie': `th_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`,
  });
}
export const notice = (uid: string, content: string) =>
  stmt(
    'INSERT INTO notifications(id,user_id,content,created_at) VALUES(?,?,?,?)',
    id(),
    uid,
    content,
    now(),
  );
export const auditStmt = (u: User, action: string, ref: string, reason = '') =>
  stmt(
    'INSERT INTO audit_log(id,actor_id,action,reference_id,reason,created_at) VALUES(?,?,?,?,?,?)',
    id(),
    u.id,
    action,
    ref,
    reason,
    now(),
  );
