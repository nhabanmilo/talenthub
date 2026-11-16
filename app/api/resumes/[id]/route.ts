import { resumeLink } from '@/lib/resume-link';
import { requireUser, one, check, files, error } from '@/lib/server';
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requireUser(req);
    const { id } = await params;
    const r = await one('SELECT * FROM resumes WHERE id=?', id);
    check(r, 'Không tìm thấy CV.', 404);
    let allowed =
      r.candidate_id === u.id &&
      (!r.deleted ||
        !!(await one(
          'SELECT id FROM applications WHERE resume_id=? AND candidate_id=?',
          id,
          u.id,
        )));
    if (u.role === 'employer')
      allowed = !!(await one(
        'SELECT a.id FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.resume_id=? AND j.created_by=?',
        id,
        u.id,
      ));
    check(allowed, 'Bạn không có quyền truy cập CV này.', 403);
    if (r.content_type === 'text/uri-list') {
      const url = resumeLink(r.object_key);
      check(url, 'Đường dẫn CV không hợp lệ.', 400);
      return new Response(null, { status: 302, headers: {
        Location: url!, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer',
      } });
    }
    check(files(), 'CV cũ chưa có trên máy chủ này. Vui lòng thêm đường dẫn CV mới.', 404);
    const obj = await files().get(r.object_key);
    check(obj, 'Tệp không còn tồn tại.', 404);
    return new Response(obj!.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(r.title.endsWith('.pdf') ? r.title : r.title + '.pdf')}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': 'sandbox',
      },
    });
  } catch (e) {
    return error(e);
  }
}
