import {
  requireUser,
  csrf,
  files,
  db,
  stmt,
  id,
  now,
  required,
  check,
  error,
  response,
  one,
} from '@/lib/server';
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req, ['candidate']);
    check(
      Number(req.headers.get('content-length') || 0) <= 6 * 1024 * 1024,
      'Tệp tối đa 5 MB.',
      413,
    );
    const f = await req.formData();
    const file = f.get('file');
    check(file instanceof File, 'Vui lòng chọn tệp PDF.');
    const pdf = file as File;
    check(
      pdf.size > 5 && pdf.size <= 5 * 1024 * 1024,
      'Tệp PDF cần có dung lượng tối đa 5 MB.',
    );
    check(
      pdf.name.toLowerCase().endsWith('.pdf') &&
        (!pdf.type || pdf.type === 'application/pdf'),
      'Chỉ hỗ trợ tệp PDF.',
    );
    const bytes = await pdf.arrayBuffer();
    check(
      new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-',
      'Nội dung tệp PDF không hợp lệ.',
    );
    const rid = id(),
      key = `resumes/${u.id}/${rid}.pdf`;
    await files().put(key, bytes, {
      httpMetadata: { contentType: 'application/pdf' },
    });
    try {
      await stmt(
        'INSERT INTO resumes(id,candidate_id,title,object_key,content_type,size,is_default,created_at) VALUES(?,?,?,?,?,?,CASE WHEN EXISTS(SELECT 1 FROM resumes WHERE candidate_id=? AND deleted=0) THEN 0 ELSE 1 END,?)',
        rid,
        u.id,
        required(f.get('title') || pdf.name, 'tên CV', 200),
        key,
        'application/pdf',
        pdf.size,
        u.id,
        now(),
      ).run();
    } catch (e) {
      await files().delete(key);
      throw e;
    }
    return response({ ok: true, id: rid });
  } catch (e) {
    return error(e);
  }
}
