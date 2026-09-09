import { one, check, User } from './server';
export async function applicationAccess(applicationId: string, u: User) {
  check(
    ['candidate', 'employer'].includes(u.role),
    'Chỉ ứng viên và nhà tuyển dụng liên quan được truy cập cuộc trao đổi.',
    403,
  );
  const a = await one(
    `SELECT a.*,j.title job_title,j.created_by employer_id,c.name company_name,c.status company_status,
    candidate.name candidate_name,employer.name employer_name,candidate.status candidate_status,employer.status employer_status
    FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id
    JOIN users candidate ON candidate.id=a.candidate_id JOIN users employer ON employer.id=j.created_by WHERE a.id=?`,
    applicationId,
  );
  check(
    a && (u.id === a.candidate_id || u.id === a.employer_id),
    'Không tìm thấy hồ sơ thuộc quyền truy cập.',
    404,
  );
  return a;
}
export function writable(a: any) {
  check(
    a.candidate_status === 'active' &&
      a.employer_status === 'active' &&
      a.company_status !== 'blocked',
    'Cuộc trao đổi tạm khóa do tài khoản hoặc doanh nghiệp không hoạt động.',
    409,
  );
}
export function strictText(
  value: unknown,
  label: string,
  max: number,
  optional = false,
) {
  check(typeof value === 'string', `${label} không hợp lệ.`);
  const s = (value as string).trim();
  check(
    (optional || s.length > 0) && s.length <= max,
    `${label} cần ${optional ? 'tối đa' : 'từ 1 đến'} ${max} ký tự.`,
  );
  return s;
}
export function interviewTimes(start: unknown, end: unknown) {
  check(
    typeof start === 'string' &&
      typeof end === 'string' &&
      /Z$|[+-]\d{2}:\d{2}$/.test(start) &&
      /Z$|[+-]\d{2}:\d{2}$/.test(end),
    'Thời gian phải có múi giờ.',
  );
  const s = Date.parse(start as string),
    e = Date.parse(end as string);
  check(
    Number.isFinite(s) &&
      Number.isFinite(e) &&
      s > Date.now() &&
      e > s &&
      e - s <= 8 * 3600000,
    'Lịch phải ở tương lai, kết thúc sau khi bắt đầu và không quá 8 giờ.',
  );
  return { start: new Date(s).toISOString(), end: new Date(e).toISOString() };
}
export function interviewLocation(mode: unknown, location: unknown) {
  check(
    mode === 'online' || mode === 'onsite',
    'Hình thức phỏng vấn không hợp lệ.',
  );
  const text = strictText(
    location,
    mode === 'online' ? 'Liên kết họp' : 'Địa điểm',
    1000,
  );
  if (mode === 'online') {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      check(false, 'Liên kết họp không hợp lệ.');
      throw 0;
    }
    check(
      url!.protocol === 'https:' && !url!.username && !url!.password,
      'Liên kết họp phải dùng HTTPS và không chứa thông tin đăng nhập.',
    );
  }
  return text;
}
export function calendarFile(i: any) {
  const esc = (s: string) =>
    s
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  const dt = (s: string) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TalentHub//Interview//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${i.id}@talenthub`,
    `DTSTAMP:${dt(i.updated_at)}`,
    `DTSTART:${dt(i.starts_at)}`,
    `DTEND:${dt(i.ends_at)}`,
    `SEQUENCE:${i.version}`,
    `SUMMARY:${esc(i.title)}`,
    `DESCRIPTION:${esc(i.job_title + '\n' + i.company_name + '\n' + i.notes)}`,
    `LOCATION:${esc(i.location)}`,
    `STATUS:${i.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // Fold by UTF-8 octets, keeping Vietnamese code points intact (RFC 5545).
  return (
    lines
      .map((line) => {
        let out = '',
          part = '',
          size = 0;
        for (const char of line) {
          const n = new TextEncoder().encode(char).length;
          if (size + n > 74) {
            out += part + '\r\n';
            part = ' ';
            size = 1;
          }
          part += char;
          size += n;
        }
        return out + part;
      })
      .join('\r\n') + '\r\n'
  );
}
