import { one, check, requireUser, error } from '@/lib/server';
import { applicationAccess, calendarFile } from '@/lib/communication';
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requireUser(req, ['candidate', 'employer']);
    const { id } = await params;
    const i = await one('SELECT * FROM interviews WHERE id=?', id);
    check(i, 'Không tìm thấy lịch.', 404);
    const a = await applicationAccess(i.application_id, u);
    return new Response(
      calendarFile({
        ...i,
        job_title: a.job_title,
        company_name: a.company_name,
      }),
      {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="talenthub-interview.ics"',
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    );
  } catch (e) {
    return error(e);
  }
}
