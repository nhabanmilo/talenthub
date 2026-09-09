import {
  all,
  one,
  stmt,
  db,
  id,
  now,
  check,
  error,
  response,
  requireUser,
  csrf,
} from '@/lib/server';
import {
  applicationAccess,
  writable,
  strictText,
  interviewTimes,
  interviewLocation,
} from '@/lib/communication';
import { deliverSafely } from '@/lib/mail';
const select = `SELECT i.*,j.title job_title,c.name company_name,u.name candidate_name FROM interviews i JOIN applications a ON a.id=i.application_id JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id JOIN users u ON u.id=i.candidate_id`;
export async function GET(req: Request) {
  try {
    const u = await requireUser(req, ['candidate', 'employer']);
    const items = await all(
      select +
        ` WHERE i.${u.role === 'candidate' ? 'candidate_id' : 'employer_id'}=? ORDER BY i.starts_at DESC`,
      u.id,
    );
    return response({ interviews: items });
  } catch (e) {
    return error(e);
  }
}
export async function POST(req: Request) {
  try {
    csrf(req);
    const u = await requireUser(req, ['candidate', 'employer']);
    const b: any = await req.json();
    check(b && typeof b === 'object', 'Dữ liệu không hợp lệ.');
    const existing = b.id
      ? await one(
          'SELECT * FROM interviews WHERE id=?',
          strictText(b.id, 'Lịch hẹn', 100),
        )
      : null;
    if (b.id) check(existing, 'Không tìm thấy lịch.', 404);
    const a = await applicationAccess(
      existing?.application_id || strictText(b.application_id, 'Hồ sơ', 100),
      u,
    );
    writable(a);
    if (existing)
      check(
        Number.isSafeInteger(b.version) && b.version === existing.version,
        'Lịch đã thay đổi. Hãy tải lại trước khi tiếp tục.',
        409,
      );
    const iid = existing?.id || id(),
      version = (existing?.version || 0) + 1,
      stamp = now();
    let statement: D1PreparedStatement,
      content = '';
    if (b.action === 'save') {
      check(
        u.role === 'employer',
        'Chỉ nhà tuyển dụng được tạo hoặc đổi lịch.',
        403,
      );
      check(
        !existing || existing.status === 'scheduled',
        'Lịch đã hủy hoặc hoàn thành không thể đổi.',
        409,
      );
      const { start, end } = interviewTimes(b.starts_at, b.ends_at);
      const title = strictText(b.title, 'Tiêu đề', 200),
        location = interviewLocation(b.mode, b.location),
        notes = strictText(b.notes ?? '', 'Nội dung chuẩn bị', 3000, true);
      const conflicts = await one(
        `SELECT id FROM interviews WHERE id<>? AND status='scheduled' AND candidate_response<>'declined' AND (employer_id=? OR candidate_id=?) AND starts_at<? AND ends_at>? LIMIT 1`,
        iid,
        a.employer_id,
        a.candidate_id,
        end,
        start,
      );
      check(!conflicts, 'Trùng lịch của nhà tuyển dụng hoặc ứng viên.', 409);
      // Conflict test repeated inside the write, so concurrent requests cannot book the same interval.
      const guard = `NOT EXISTS(SELECT 1 FROM interviews WHERE id<>? AND status='scheduled' AND candidate_response<>'declined' AND (employer_id=? OR candidate_id=?) AND starts_at<? AND ends_at>?)`;
      statement = existing
        ? stmt(
            `UPDATE interviews SET title=?,starts_at=?,ends_at=?,mode=?,location=?,notes=?,candidate_response='pending',response_note='',version=?,updated_at=? WHERE id=? AND version=? AND ${guard}`,
            title,
            start,
            end,
            b.mode,
            location,
            notes,
            version,
            stamp,
            iid,
            b.version,
            iid,
            a.employer_id,
            a.candidate_id,
            end,
            start,
          )
        : stmt(
            `INSERT INTO interviews(id,application_id,employer_id,candidate_id,title,starts_at,ends_at,mode,location,notes,version,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard}`,
            iid,
            a.id,
            a.employer_id,
            a.candidate_id,
            title,
            start,
            end,
            b.mode,
            location,
            notes,
            version,
            stamp,
            stamp,
            iid,
            a.employer_id,
            a.candidate_id,
            end,
            start,
          );
      content = `${existing ? 'Lịch phỏng vấn đã thay đổi' : 'Lời mời phỏng vấn'}: ${title}, ${new Date(start).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (giờ Việt Nam). Vui lòng xem và xác nhận lịch trên TalentHub.`;
    } else {
      check(existing, 'Không tìm thấy lịch.', 404);
      check(
        existing.status === 'scheduled',
        'Lịch không còn cho phép thao tác.',
        409,
      );
      if (b.action === 'respond') {
        check(u.role === 'candidate', 'Chỉ ứng viên được phản hồi.', 403);
        check(
          new Date(existing.starts_at).getTime() > Date.now(),
          'Lịch đã bắt đầu.',
          409,
        );
        check(
          ['accepted', 'declined'].includes(b.response),
          'Phản hồi không hợp lệ.',
        );
        const note = strictText(
          b.note ?? '',
          'Lời nhắn',
          1500,
          b.response === 'accepted',
        );
        const guard =
          b.response === 'accepted'
            ? ` AND NOT EXISTS(SELECT 1 FROM interviews WHERE id<>? AND (employer_id=? OR candidate_id=?) AND status='scheduled' AND candidate_response<>'declined' AND starts_at<? AND ends_at>?)`
            : '';
        statement = stmt(
          `UPDATE interviews SET candidate_response=?,response_note=?,version=?,updated_at=? WHERE id=? AND version=?${guard}`,
          b.response,
          note,
          version,
          stamp,
          iid,
          b.version,
          ...(guard
            ? [
                iid,
                a.employer_id,
                a.candidate_id,
                existing.ends_at,
                existing.starts_at,
              ]
            : []),
        );
        content = `${u.name} ${b.response === 'accepted' ? 'đã xác nhận' : 'từ chối'} lịch phỏng vấn ${existing.title}.${note ? ' Lời nhắn: ' + note : ''}`;
      } else if (b.action === 'cancel') {
        check(u.role === 'employer', 'Chỉ nhà tuyển dụng được hủy lịch.', 403);
        const reason = strictText(b.reason, 'Lý do hủy', 1500);
        statement = stmt(
          "UPDATE interviews SET status='cancelled',cancel_reason=?,version=?,updated_at=? WHERE id=? AND version=?",
          reason,
          version,
          stamp,
          iid,
          b.version,
        );
        content = `Đã hủy lịch phỏng vấn ${existing.title}. Lý do: ${reason}`;
      } else if (b.action === 'complete') {
        check(
          u.role === 'employer',
          'Chỉ nhà tuyển dụng được hoàn thành lịch.',
          403,
        );
        check(
          Date.parse(existing.ends_at) <= Date.now(),
          'Lịch chưa kết thúc.',
          409,
        );
        statement = stmt(
          "UPDATE interviews SET status='completed',version=?,updated_at=? WHERE id=? AND version=?",
          version,
          stamp,
          iid,
          b.version,
        );
        content = `Đã hoàn thành lịch phỏng vấn ${existing.title}.`;
      } else {
        check(false, 'Thao tác không hợp lệ.');
        throw 0;
      }
    }
    const receiver = u.role === 'employer' ? a.candidate_id : a.employer_id;
    const results = await db().batch([
      statement!,
      stmt(
        'INSERT INTO notifications(id,user_id,content,created_at) SELECT ?,?,?,? WHERE changes()=1',
        id(),
        receiver,
        content,
        stamp,
      ),
    ]);
    check(
      results[0].meta.changes === 1,
      'Lịch đã thay đổi hoặc bị trùng. Hãy tải lại.',
      409,
    );
    await deliverSafely();
    return response({ ok: true, id: iid, version });
  } catch (e) {
    return error(e);
  }
}
