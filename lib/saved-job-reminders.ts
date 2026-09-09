import { stmt, today, now } from './server';
// Stable notification ID prevents repeat reminders, including concurrent requests.
// A changed deadline creates a new reminder for the new closing date.
export async function remindSavedJobs(candidateId?: string) {
  const date = today();
  const result = await stmt(`INSERT OR IGNORE INTO notifications(id,user_id,content,is_read,created_at)
    SELECT 'saved-expiry:' || s.candidate_id || ':' || j.id || ':' || j.deadline,
      s.candidate_id,
      'Tin đã lưu sắp hết hạn: ' || j.title || ' tại ' || c.name || '. Hạn nộp: ' ||
      substr(j.deadline,9,2) || '/' || substr(j.deadline,6,2) || '/' || substr(j.deadline,1,4) ||
      '. Bạn hãy mở mục Đã lưu để xem và ứng tuyển.', 0, ?
    FROM saved_jobs s JOIN jobs j ON j.id=s.job_id
    JOIN users u ON u.id=s.candidate_id JOIN companies c ON c.id=j.company_id
    WHERE u.status='active' AND u.role='candidate' AND j.status='active' AND c.status!='blocked'
      AND j.deadline>=? AND j.deadline<=date(?, '+2 days')
      AND (? IS NULL OR s.candidate_id=?)
      AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.candidate_id=s.candidate_id AND a.job_id=j.id)`,
    now(), date, date, candidateId || null, candidateId || null).run();
  return result.meta.changes || 0;
}
