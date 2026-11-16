import { requireUser, csrf, stmt, id, now, required, check, error, response } from '@/lib/server';
import { resumeLink } from '@/lib/resume-link';
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req, ['candidate']);
    check(Number(req.headers.get('content-length') || 0) <= 10000, 'Dữ liệu quá lớn.', 413);
    const f = await req.formData();
    const url = resumeLink(f.get('url'));
    check(url, 'Nhập đường dẫn HTTPS của CV (Google Drive hoặc OneDrive).');
    const rid = id();
    await stmt(
      'INSERT INTO resumes(id,candidate_id,title,object_key,content_type,size,is_default,created_at) VALUES(?,?,?,?,?,?,CASE WHEN EXISTS(SELECT 1 FROM resumes WHERE candidate_id=? AND deleted=0) THEN 0 ELSE 1 END,?)',
      rid, u.id, required(f.get('title'), 'tên CV', 200), url,
      'text/uri-list', 0, u.id, now(),
    ).run();
    return response({ ok: true, id: rid });
  } catch (e) { return error(e); }
}
