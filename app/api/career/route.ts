import {
  all,
  one,
  stmt,
  requireUser,
  csrf,
  check,
  response,
  error,
  str,
  required,
  id,
  now,
  today,
} from '@/lib/server';
import { cleanCV, recommend } from '@/lib/career';
import { normalizeLocation } from '@/lib/locations';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const u = await requireUser(req, ['candidate']);
    const documents = await all(
      'SELECT * FROM career_documents WHERE user_id=? ORDER BY updated_at DESC',
      u.id,
    );
    const preferences =
      (await one('SELECT * FROM career_preferences WHERE user_id=?', u.id)) ||
      {};
    const jobs = await all(
      "SELECT j.*,c.name company_name FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.status='active' AND j.deadline>=? AND j.is_demo=0 AND c.status='verified' AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.job_id=j.id AND a.candidate_id=?) ORDER BY j.created_at DESC LIMIT 1000",
      today(),
      u.id,
    );
    return response({
      documents: documents.map((d) => ({
        ...d,
        content: JSON.parse(d.content),
      })),
      preferences,
      recommendations: recommend(jobs, preferences),
    });
  } catch (e) {
    return error(e);
  }
}
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req, ['candidate']);
    const raw = await req.text();
    check(raw.length <= 60000, 'Nội dung quá lớn.', 413);
    const b = JSON.parse(raw);
    if (b.action === 'preferences') {
      const salary = Number(b.salary_min || 0);
      check(
        Number.isFinite(salary) && salary >= 0 && salary <= 1000,
        'Lương mong muốn từ 0 đến 1.000 triệu.',
      );
      await stmt(
        'INSERT INTO career_preferences(user_id,category,location,salary_min,experience,skills) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET category=excluded.category,location=excluded.location,salary_min=excluded.salary_min,experience=excluded.experience,skills=excluded.skills',
        u.id,
        str(b.category, 150),
        normalizeLocation(str(b.location, 150)),
        salary,
        str(b.experience, 100),
        str(b.skills, 2000),
      ).run();
      return response({ ok: true });
    }
    if (b.action === 'delete') {
      const result = await stmt(
        'DELETE FROM career_documents WHERE id=? AND user_id=?',
        str(b.id, 100),
        u.id,
      ).run();
      check(result.meta.changes, 'Không tìm thấy CV.', 404);
      return response({ ok: true });
    }
    check(b.action === 'save', 'Thao tác không hợp lệ.');
    let content;
    try {
      content = cleanCV(b.content);
    } catch (e) {
      return response({ error: (e as Error).message }, 400);
    }
    const title = required(b.title, 'tên CV', 150),
      updated = now();
    if (b.id) {
      const result = await stmt(
        'UPDATE career_documents SET title=?,content=?,updated_at=? WHERE id=? AND user_id=? AND updated_at=?',
        title,
        JSON.stringify(content),
        updated,
        str(b.id, 100),
        u.id,
        str(b.updated_at, 100),
      ).run();
      check(
        result.meta.changes,
        'CV đã thay đổi ở cửa sổ khác hoặc không còn tồn tại. Hãy tải lại trước khi lưu.',
        409,
      );
      return response({ id: b.id, updated_at: updated });
    }
    const count = await one(
      'SELECT COUNT(*) n FROM career_documents WHERE user_id=?',
      u.id,
    );
    check(count.n < 20, 'Bạn có thể lưu tối đa 20 CV.');
    const ref = id();
    await stmt(
      'INSERT INTO career_documents(id,user_id,title,content,updated_at) VALUES(?,?,?,?,?)',
      ref,
      u.id,
      title,
      JSON.stringify(content),
      updated,
    ).run();
    return response({ id: ref, updated_at: updated });
  } catch (e) {
    return error(e);
  }
}
