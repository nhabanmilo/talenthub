import { inferSpecialty, occupationSelection, specialties } from '@/lib/occupations';
import { env } from 'cloudflare:workers';
import { googleReady } from '@/lib/google';
import { categoryFilterNames } from '@/lib/category-groups';
import { remindSavedJobs } from '@/lib/saved-job-reminders';
import { canCloseJob, canModerateJob } from '@/lib/recruitment-workflow';
import { normalizeLocation, locationAliases } from '@/lib/locations';
import { deliverSafely } from '@/lib/mail';
import {
  all,
  one,
  stmt,
  db,
  id,
  now,
  today,
  str,
  required,
  check,
  error,
  response,
  current,
  requireUser,
  csrf,
  notice,
  auditStmt,
} from '@/lib/server';
import { sampleJobs, categories as seedCategories } from '@/app/seed';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export const dynamic = 'force-dynamic';
async function seedCatalog() {
  if (await one("SELECT id FROM setup WHERE id='categories_initialized'")) return;
  await db().batch([
    ...seedCategories.map((name, index) => stmt('INSERT OR IGNORE INTO categories(id,name,is_active) VALUES(?,?,1)', 'category-' + index, name)),
    stmt("INSERT OR IGNORE INTO setup(id,value) VALUES('categories_initialized',?)", now()),
  ]);
}
const jobSelect =
  'SELECT j.*,c.name company_name,c.description company_description,c.address company_address,c.website company_website,c.status company_status FROM jobs j JOIN companies c ON c.id=j.company_id';
function decorate(j: any) {
  const sample = sampleJobs.find((x) => x.company_name === j.company_name);
  return {
    ...j,
    location: normalizeLocation(j.location),
    tags: JSON.parse(j.tags || '[]'),
    initials: sample?.initials || j.company_name.slice(0, 2),
    color: sample?.color || '#187955',
    status:
      j.status === 'active' && j.deadline < today() ? 'expired' : j.status,
  };
}
export async function GET(req: Request) {
  try {
    await seedCatalog();
    const u = await current(req);
    if (u?.role === 'candidate') {
      const created = await remindSavedJobs(u.id);
      if (created) await deliverSafely();
    }
    const params = new URL(req.url).searchParams;
    const demoEnabled = (env as unknown as Record<string,string>).ENABLE_DEMO_DATA === 'true';
    if (!demoEnabled) params.delete('demo');
    const savedView = params.get('saved') === '1';
    if (savedView) for (const key of ['q','location','category','experience','type','salary','sort','company']) params.delete(key);
    const q = str(params.get('q'), 150),
      location = str(params.get('location'), 150),
      category = str(params.get('category'), 150),
      experience = str(params.get('experience'), 100),
      type = str(params.get('type'), 100);
    const min = Number(params.get('salary') || 0);
    let page = Math.max(1, Math.min(100000, Math.floor(Number(params.get('page')) || 1)));
    const filters = savedView ? ["j.status IN ('active','expired','closed')", "c.status!='blocked'"] : ['j.status=?', 'j.deadline>=?', "c.status!='blocked'"];
    const args: unknown[] = savedView ? [] : ['active', today()];
    if (!savedView) { filters.push('j.is_demo=?', "c.status='verified'"); args.push(params.get('demo') === '1' ? 1 : 0); }
    if (params.get('company')) { filters.push('j.company_id=?'); args.push(str(params.get('company'),100)); }
    if (q) {
      filters.push('(j.title LIKE ? OR c.name LIKE ? OR j.tags LIKE ?)');
      args.push('%' + q + '%', '%' + q + '%', '%' + q + '%');
    }
    if (category) {
      const selection = occupationSelection(category);
      if (selection) {
        filters.push('j.specialty IN (' + selection.ids.map(() => '?').join(',') + ')');
        args.push(...selection.ids);
      }
      const categories = selection ? [selection.category] : categoryFilterNames(category);
      filters.push('j.category IN (' + categories.map(() => '?').join(',') + ')');
      args.push(...categories);
    }
    if (location) {
      const names = locationAliases(location);
      filters.push('j.location IN (' + names.map(() => '?').join(',') + ')');
      args.push(...names);
    }
    for (const [k, v] of [
      

      ['experience', experience],
      ['type', type],
    ])
      if (v) {
        filters.push(`j.${k}=?`);
        args.push(v);
      }
    if (min) {
      filters.push('j.salary_max>=?');
      args.push(min);
    }
    if (params.get('saved') === '1') {
      if (!u || u.role !== 'candidate') filters.push('1=0');
      filters.push(
        'j.id IN (SELECT job_id FROM saved_jobs WHERE candidate_id=?)',
      );
      args.push(u?.id || '');
    }
    const where = ' WHERE ' + filters.join(' AND ');
    const total = await one(
      'SELECT COUNT(*) total FROM jobs j JOIN companies c ON c.id=j.company_id' +
        where,
      ...args,
    );
    const order =
      params.get('sort') === 'salary'
        ? 'j.salary_max DESC,j.created_at DESC'
        : 'j.created_at DESC,j.id';
    page = Math.min(page, Math.max(1, Math.ceil(Number(total.total) / 6)));
    const jobs = (
      await all(
        jobSelect + where + ` ORDER BY ${order} LIMIT 6 OFFSET ?`,
        ...args,
        (page - 1) * 6,
      )
    ).map(decorate);
    let detail = null;
    if (params.get('job')) {
      const j = await one(jobSelect + ' WHERE j.id=?', params.get('job'));
      if (
        j &&
        ((j.status === 'active' && j.company_status === 'verified') ||
          u?.role === 'admin' ||
          j.created_by === u?.id)
      )
        detail = decorate(j);
    }
    if (detail) {
      detail.related = (await all(jobSelect + " WHERE j.id!=? AND j.is_demo=? AND j.category=? AND j.status='active' AND j.deadline>=? AND c.status='verified' ORDER BY (j.specialty=? AND j.specialty!='') DESC,j.created_at DESC LIMIT 4", detail.id,detail.is_demo,detail.category,today(),detail.specialty)).map(decorate);
    }
    const data: any = {
      user: u,
      demoEnabled,
      googleReady: googleReady(),
      googleLinked: u ? !!(await one('SELECT subject FROM google_identities WHERE user_id=?',u.id)) : false,
      jobs,
      total: total.total,
      page,
      detail,
      categories: await all(
        'SELECT * FROM categories WHERE is_active=1 ORDER BY name',
      ),
      companies: await all(
        "SELECT c.id,c.name,c.description,c.address,c.website,c.status,c.is_demo,(SELECT count(*) FROM jobs j WHERE j.company_id=c.id AND j.status='active' AND j.deadline>=?) active_jobs FROM companies c WHERE c.status='verified' AND c.is_demo=? ORDER BY c.name", today(),params.get('demo') === '1' ? 1 : 0,
      ),
      followedCompanies: [],
      saved: [],
      applications: [],
      resumes: [],
      notifications: [],
      profile: null,
      company: null,
      managedJobs: [],
      users: [],
      allCategories: [],
      audit: [],
    };
    if (!u) {
      data.needsSetup =
        !(await one('SELECT id FROM users WHERE role=?', 'admin')) &&
        !!(await getChatGPTUser());
      return response(data);
    }
    data.profile = await one('SELECT * FROM profiles WHERE user_id=?', u.id);
    data.notifications = await all(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100',
      u.id,
    );
    if (u.role === 'candidate') {
      data.followedCompanies = (await all('SELECT company_id FROM company_follows WHERE candidate_id=?',u.id)).map(row => row.company_id);
      data.saved = (
        await all('SELECT job_id FROM saved_jobs WHERE candidate_id=?', u.id)
      ).map((x) => x.job_id);
      data.resumes = await all(
        'SELECT id,title,size,is_default,created_at FROM resumes WHERE candidate_id=? AND deleted=0 ORDER BY is_default DESC,created_at DESC',
        u.id,
      );
      data.applications = await all(
        'SELECT a.id,a.job_id,a.resume_id,a.cover_letter,a.status,a.applied_at,a.updated_at,j.title,c.name company_name,r.title resume_title FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id JOIN resumes r ON r.id=a.resume_id WHERE a.candidate_id=? ORDER BY a.applied_at DESC',
        u.id,
      );
    }
    if (u.role === 'employer') {
      data.company = await one(
        'SELECT * FROM companies WHERE owner_id=?',
        u.id,
      );
      data.managedJobs = (
        await all(
          jobSelect + ' WHERE j.created_by=? ORDER BY j.created_at DESC',
          u.id,
        )
      ).map(decorate);
      data.applications = await all(
        'SELECT a.*,j.title,u.name candidate_name,u.email candidate_email,r.title resume_title FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.candidate_id JOIN resumes r ON r.id=a.resume_id WHERE j.created_by=? ORDER BY a.applied_at DESC',
        u.id,
      );
    }
    if (u.role === 'admin') {
      data.managedJobs = (
        await all(jobSelect + ' ORDER BY j.created_at DESC')
      ).map(decorate);
      data.users = await all(
        'SELECT id,email,name,role,status,created_at FROM users ORDER BY created_at DESC',
      );
      data.companies = await all('SELECT * FROM companies ORDER BY name');
      data.allCategories = await all('SELECT * FROM categories ORDER BY name');
      data.stats = await one(
        'SELECT (SELECT COUNT(*) FROM applications) applications,(SELECT COUNT(*) FROM users) users',
      );
      data.audit = await all(
        'SELECT a.*,u.name actor_name FROM audit_log a LEFT JOIN users u ON a.actor_id=u.id ORDER BY a.created_at DESC LIMIT 50',
      );
    }
    return response(data);
  } catch (e) {
    return error(e);
  }
}
async function mutate(req: Request) {
  try {
    csrf(req);
    const b: any = await req.json();
    check(
      b && typeof b === 'object' && !Array.isArray(b),
      'Dữ liệu không hợp lệ.',
    );
    const action = str(b.action);
    const u = await requireUser(req);
    const role = (...roles: string[]) =>
      check(
        roles.includes(u.role),
        'Bạn không có quyền thực hiện thao tác này.',
        403,
      );
    const ref = str(b.id, 100);
    if (action === 'follow-company') {
      role('candidate');
      check(typeof b.follow === 'boolean','Trạng thái theo dõi không hợp lệ.');
      const company = await one('SELECT id,status FROM companies WHERE id=?',ref);
      check(company && company.status !== 'blocked','Không tìm thấy công ty.',404);
      if (b.follow) await stmt('INSERT OR IGNORE INTO company_follows(candidate_id,company_id,created_at) VALUES(?,?,?)',u.id,ref,now()).run();
      else await stmt('DELETE FROM company_follows WHERE candidate_id=? AND company_id=?',u.id,ref).run();
      return response({ok:true});
    }
    if (action === 'account-name') {
      const name = required(b.name, 'họ tên', 150);
      await stmt('UPDATE users SET name=? WHERE id=?', name, u.id).run();
      return response({ ok: true });
    }
    if (action === 'profile') {
      const name = required(b.name, 'họ tên', 150);
      await db().batch([
        stmt('UPDATE users SET name=? WHERE id=?', name, u.id),
        stmt(
          'UPDATE profiles SET phone=?,location=?,headline=?,skills=?,experience_summary=?,date_of_birth=? WHERE user_id=?',
          str(b.phone, 20),
          normalizeLocation(str(b.location, 150)),
          str(b.headline, 255),
          str(b.skills, 2000),
          str(b.experience_summary, 5000),
          str(b.date_of_birth, 10),
          u.id,
        ),
      ]);
      return response({ ok: true });
    }
    if (action === 'company') {
      role('employer');
      const name = required(b.name, 'tên doanh nghiệp', 200);
      const website = str(b.website, 255);
      check(
        !website || /^https?:\/\//i.test(website),
        'Website phải bắt đầu bằng https:// hoặc http://.',
      );
      const existing = await one(
        'SELECT * FROM companies WHERE owner_id=?',
        u.id,
      );
      check(existing?.status !== 'blocked', 'Doanh nghiệp đã bị khóa.', 403);
      const address = required(b.address, 'địa chỉ', 255);
      const taxCode = str(b.tax_code, 50);
      const identityUnchanged = existing && existing.name === name && (existing.tax_code || '') === taxCode && existing.address === address;
      await stmt(
        'INSERT INTO companies(id,owner_id,name,tax_code,address,website,description) VALUES(?,?,?,?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET name=excluded.name,tax_code=excluded.tax_code,address=excluded.address,website=excluded.website,description=excluded.description,status=?',
        existing?.id || id(),
        u.id,
        name,
        taxCode,
        address,
        website,
        required(b.description, 'giới thiệu doanh nghiệp', 5000),
        existing?.status === 'verified' && identityUnchanged ? 'verified' : 'pending',
      ).run();
      return response({ ok: true });
    }
    if (action === 'save') {
      role('candidate');
      check(typeof b.saved === 'boolean', 'Trạng thái lưu không hợp lệ.');
      if (b.saved === false) {
        await stmt('DELETE FROM saved_jobs WHERE candidate_id=? AND job_id=?', u.id, ref).run();
        return response({ ok: true });
      }
      const j = await one(
        "SELECT j.id FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.id=? AND j.status='active' AND j.deadline>=? AND c.status='verified'",
        ref,
        today(),
      );
      check(j, 'Tin không còn nhận hồ sơ.', 409);
      await stmt(
          'INSERT OR IGNORE INTO saved_jobs(candidate_id,job_id) VALUES(?,?)',
          u.id,
          ref,
        ).run();
      return response({ ok: true });
    }
    if (action === 'apply') {
      role('candidate');
      const j = await one(
        "SELECT j.* FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.id=? AND j.status='active' AND j.deadline>=? AND c.status='verified'",
        ref,
        today(),
      );
      check(j, 'Tin đã hết hạn hoặc không còn nhận hồ sơ.', 409);
      const r = await one(
        'SELECT id FROM resumes WHERE id=? AND candidate_id=? AND deleted=0',
        str(b.resume_id, 100),
        u.id,
      );
      check(r, 'Vui lòng chọn một CV hợp lệ.');
      check(
        !(await one(
          'SELECT id FROM applications WHERE job_id=? AND candidate_id=?',
          ref,
          u.id,
        )),
        'Bạn đã ứng tuyển vị trí này.',
        409,
      );
      const appId = id();
      await db().batch([
        stmt(
          "INSERT INTO applications(id,job_id,candidate_id,resume_id,cover_letter,applied_at,updated_at) SELECT ?,j.id,?,?,?,?,? FROM jobs j JOIN companies c ON c.id=j.company_id JOIN resumes r ON r.id=? AND r.candidate_id=? AND r.deleted=0 WHERE j.id=? AND j.status='active' AND j.deadline>=? AND c.status='verified'",
          appId,
          u.id,
          r.id,
          str(b.cover_letter, 5000),
          now(),
          now(),
          r.id,
          u.id,
          ref,
          today(),
        ),
        stmt(
          'INSERT INTO notifications(id,user_id,content,created_at) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM applications WHERE id=?)',
          id(),
          j.created_by,
          `${u.name} vừa ứng tuyển: ${j.title}`,
          now(),
          appId,
        ),
        stmt(
          'INSERT INTO notifications(id,user_id,content,created_at) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM applications WHERE id=?)',
          id(),
          u.id,
          `Đã nộp hồ sơ cho vị trí ${j.title}.`,
          now(),
          appId,
        ),
      ]);
      check(
        await one('SELECT id FROM applications WHERE id=?', appId),
        'Tin không còn nhận hồ sơ.',
        409,
      );
      return response({ ok: true, id: appId });
    }
    if (action === 'resume-default' || action === 'resume-delete') {
      role('candidate');
      check(
        await one(
          'SELECT id FROM resumes WHERE id=? AND candidate_id=? AND deleted=0',
          ref,
          u.id,
        ),
        'Không tìm thấy CV.',
        404,
      );
      if (action === 'resume-default')
        await db().batch([
          stmt('UPDATE resumes SET is_default=0 WHERE candidate_id=?', u.id),
          stmt(
            'UPDATE resumes SET is_default=1 WHERE id=? AND candidate_id=?',
            ref,
            u.id,
          ),
        ]);
      else
        await db().batch([
          stmt(
            'UPDATE resumes SET deleted=1,is_default=0 WHERE id=? AND candidate_id=?',
            ref,
            u.id,
          ),
          stmt(
            'UPDATE resumes SET is_default=1 WHERE id=(SELECT id FROM resumes WHERE candidate_id=? AND deleted=0 ORDER BY created_at DESC LIMIT 1) AND NOT EXISTS(SELECT 1 FROM resumes WHERE candidate_id=? AND deleted=0 AND is_default=1)',
            u.id,
            u.id,
          ),
        ]);
      return response({ ok: true });
    }
    if (action === 'job-save') {
      role('employer');
      const c = await one(
        "SELECT * FROM companies WHERE owner_id=? AND status!='blocked'",
        u.id,
      );
      check(c, 'Vui lòng hoàn thiện hồ sơ doanh nghiệp trước.');
      if (ref)
        check(
          await one(
            'SELECT id FROM jobs WHERE id=? AND created_by=?',
            ref,
            u.id,
          ),
          'Bạn không có quyền sửa tin này.',
          403,
        );
      const min = Number(b.salary_min),
        max = Number(b.salary_max);
      check(
        Number.isFinite(min) &&
          Number.isFinite(max) &&
          min >= 0 &&
          max >= min &&
          max <= 10000,
        'Mức lương không hợp lệ (đơn vị triệu đồng).',
      );
      const deadline = str(b.deadline, 10);
      check(
        /^\d{4}-\d{2}-\d{2}$/.test(deadline) &&
          !Number.isNaN(Date.parse(deadline)) &&
          new Date(deadline).toISOString().slice(0, 10) === deadline &&
          deadline >= today(),
        'Hạn nộp phải là ngày hợp lệ từ hôm nay.',
      );
      check(
        await one(
          'SELECT id FROM categories WHERE name=? AND is_active=1',
          str(b.category, 150),
        ),
        'Vui lòng chọn ngành nghề hợp lệ.',
      );
      const specialty = str(b.specialty, 150) || inferSpecialty(str(b.category, 150), str(b.title, 200));
      check(!specialty || specialties.some(s => s.id === specialty && s.category === str(b.category, 150)), 'Chuyên môn không thuộc nhóm nghề đã chọn.');
      const jid = ref || id();
      const values = [
        c.id,
        u.id,
        str(b.category, 150),
        required(b.title, 'vị trí', 200),
        required(b.description, 'mô tả công việc', 10000),
        required(b.requirements, 'yêu cầu', 10000),
        required(b.benefits, 'quyền lợi', 10000),
        normalizeLocation(required(b.location, 'địa điểm', 200)),
        min,
        max,
        deadline,
        b.draft ? 'draft' : 'pending',
        str(b.experience, 100),
        str(b.type, 100),
        JSON.stringify(
          str(b.tags, 500)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        ),
        now(),
      ];
      const s = ref
        ? stmt(
            'UPDATE jobs SET company_id=?,created_by=?,category=?,title=?,description=?,requirements=?,benefits=?,location=?,salary_min=?,salary_max=?,deadline=?,status=?,experience=?,type=?,tags=?,updated_at=?,reason=? WHERE id=? AND created_by=?',
            ...values,
            '',
            jid,
            u.id,
          )
        : stmt(
            'INSERT INTO jobs(company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,updated_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            ...values,
            jid,
            now(),
          );
      const admins = await all(
        "SELECT id FROM users WHERE role='admin' AND status='active'",
      );
      await db().batch([
        s,
        stmt('UPDATE jobs SET specialty=? WHERE id=? AND created_by=?', specialty, jid, u.id),
        ...(b.draft
          ? []
          : admins.map((a) => notice(a.id, `Tin chờ duyệt: ${b.title}`))),
      ]);
      return response({ ok: true, id: jid });
    }
    if (action === 'job-close') {
      role('employer');
      const closingJob = await one('SELECT status FROM jobs WHERE id=? AND created_by=?', ref, u.id);
      check(
        closingJob,
        'Bạn không có quyền đóng tin này.',
        403,
      );
      check(canCloseJob(closingJob.status), 'Chỉ tin đang tuyển hoặc chờ duyệt mới có thể đóng.', 409);
      await stmt(
        "UPDATE jobs SET status='closed',updated_at=? WHERE id=? AND created_by=? AND status IN ('active','pending')",
        now(),
        ref,
        u.id,
      ).run();
      return response({ ok: true });
    }
    if (action === 'application-status') {
      role('employer');
      check(
        ['viewed', 'shortlisted', 'interview', 'rejected', 'hired'].includes(
          b.status,
        ),
        'Trạng thái không hợp lệ.',
      );
      const a = await one(
        'SELECT a.*,j.title,c.status company_status FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id WHERE a.id=? AND j.created_by=?',
        ref,
        u.id,
      );
      check(a, 'Bạn không có quyền xem hồ sơ này.', 403);
      check(a.company_status !== 'blocked', 'Doanh nghiệp đang bị khóa, không thể cập nhật hồ sơ ứng tuyển.', 403);
      const labels: any = {
        viewed: 'Đã xem',
        shortlisted: 'Phù hợp',
        interview: 'Phỏng vấn',
        rejected: 'Từ chối',
        hired: 'Trúng tuyển',
      };
      await db().batch([
        stmt(
          'UPDATE applications SET status=?,note=?,updated_at=? WHERE id=?',
          b.status,
          str(b.note, 5000),
          now(),
          ref,
        ),
        ...(a.status !== b.status ? [notice(a.candidate_id, `Hồ sơ ${a.title}: ${labels[b.status]}.`)] : []),
      ]);
      return response({ ok: true });
    }
    if (action === 'notifications-read') {
      await stmt(
        'UPDATE notifications SET is_read=1 WHERE user_id=?',
        u.id,
      ).run();
      return response({ ok: true });
    }
    if (action === 'moderate') {
      role('admin');
      check(
        ['active', 'rejected', 'hidden', 'closed'].includes(b.status),
        'Trạng thái không hợp lệ.',
      );
      const j = await one('SELECT * FROM jobs WHERE id=?', ref);
      check(j, 'Không tìm thấy tin.', 404);
      check(canModerateJob(j.status, b.status), 'Thao tác không phù hợp với trạng thái hiện tại của tin. Hãy tải lại danh sách.', 409);
      const reason = ['rejected', 'hidden'].includes(b.status)
        ? required(b.reason, 'lý do', 2000)
        : '';
      if (b.status === 'active') {
        check(
          j.status === 'pending',
          'Chỉ tin chờ duyệt mới được phê duyệt.',
          409,
        );
        check(j.deadline >= today(), 'Tin đã hết hạn.', 409);
        const c = await one(
          'SELECT status FROM companies WHERE id=?',
          j.company_id,
        );
        check(c?.status === 'verified', 'Hãy xác minh doanh nghiệp trước khi duyệt tin.', 409);
      }
      await db().batch([
        stmt(
          'UPDATE jobs SET status=?,reason=?,updated_at=? WHERE id=?',
          b.status,
          reason,
          now(),
          ref,
        ),
        notice(
          j.created_by,
          `Tin ${j.title}: ${b.status === 'active' ? 'Đã duyệt' : b.status === 'rejected' ? 'Bị từ chối' : b.status === 'hidden' ? 'Đã ẩn' : 'Đã đóng'}.${reason ? ' Lý do: ' + reason : ''}`,
        ),
        auditStmt(u, 'job:' + b.status, ref, reason),
      ]);
      return response({ ok: true });
    }
    if (action === 'user-status') {
      role('admin');
      check(ref !== u.id, 'Không thể khóa chính tài khoản đang sử dụng.');
      check(
        ['active', 'locked'].includes(b.status),
        'Trạng thái không hợp lệ.',
      );
      const target = await one('SELECT * FROM users WHERE id=?', ref);
      check(
        target && target.role !== 'admin',
        'Không thể thay đổi tài khoản quản trị.',
        403,
      );
      if (target.status === b.status) return response({ ok: true });
      await db().batch([
        stmt('UPDATE users SET status=? WHERE id=?', b.status, ref),
        ...(b.status === 'locked'
          ? [stmt('DELETE FROM sessions WHERE user_id=?', ref)]
          : []),
        auditStmt(u, 'user:' + b.status, ref, str(b.reason, 2000)),
      ]);
      return response({ ok: true });
    }
    if (action === 'company-status') {
      role('admin');
      check(
        ['verified', 'blocked', 'pending'].includes(b.status),
        'Trạng thái không hợp lệ.',
      );
      const c = await one('SELECT * FROM companies WHERE id=?', ref);
      check(c, 'Không tìm thấy doanh nghiệp.', 404);
      if (c.status === b.status) return response({ ok: true });
      const reason =
        b.status === 'blocked' ? required(b.reason, 'lý do khóa', 2000) : '';
      await db().batch([
        stmt('UPDATE companies SET status=? WHERE id=?', b.status, ref),
        notice(
          c.owner_id,
          `Trạng thái doanh nghiệp: ${b.status === 'verified' ? 'Đã xác minh' : b.status === 'blocked' ? 'Bị khóa' : 'Chờ xác minh'}. ${reason}`,
        ),
        auditStmt(u, 'company:' + b.status, ref, reason),
      ]);
      return response({ ok: true });
    }
    if (action === 'category') {
      role('admin');
      const name = required(b.name, 'tên danh mục', 150);
      if (ref) {
        const old = await one('SELECT * FROM categories WHERE id=?', ref);
        check(old, 'Không tìm thấy danh mục.', 404);
        check(name === old.name || !specialties.some(s => s.category === old.name), 'Nhóm nghề chuẩn có chuyên môn liên kết nên không thể đổi tên. Bạn có thể ẩn nhóm này hoặc tạo nhóm mới.');
        await db().batch([
          stmt(
            'UPDATE categories SET name=?,is_active=? WHERE id=?',
            name,
            b.is_active ? 1 : 0,
            ref,
          ),
          stmt('UPDATE jobs SET category=? WHERE category=?', name, old.name),
          auditStmt(u, 'category:update', ref),
        ]);
      } else
        await db().batch([
          stmt(
            'INSERT INTO categories(id,name,is_active) VALUES(?,?,?)',
            id(),
            name,
            b.is_active ? 1 : 0,
          ),
          auditStmt(u, 'category:create', name),
        ]);
      return response({ ok: true });
    }
    if (action === 'seed') {
      role('admin');
      check((env as unknown as Record<string,string>).ENABLE_DEMO_DATA === 'true', 'Dữ liệu minh họa không được bật trên website này.', 403);
      check(
        !(await one("SELECT id FROM setup WHERE id='demo_seeded'")),
        'Dữ liệu mẫu đã được tạo.',
        409,
      );
      const ops = [
        stmt('INSERT INTO setup(id,value) VALUES(?,?)', 'demo_seeded', now()),
      ];
      const names = [...new Set(sampleJobs.map((j) => j.company_name))];
      for (const [nameIdx, name] of names.entries()) {
        const uid = 'demo-employer-' + nameIdx,
          cid = 'demo-company-' + nameIdx;
        ops.push(
          stmt(
            'INSERT INTO users(id,email,password_hash,role,status,name,created_at) VALUES(?,?,?,?,?,?,?)',
            uid,
            uid + '@example.invalid',
            'disabled',
            'employer',
            'locked',
            name,
            now(),
          ),
          stmt('INSERT INTO profiles(user_id) VALUES(?)', uid),
          stmt(
            'INSERT INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES(?,?,?,?,?,?,1)',
            cid,
            uid,
            name,
            'Việt Nam',
            'Doanh nghiệp giả lập phục vụ minh họa nghiệp vụ tuyển dụng.',
            'verified',
          ),
        );
      }
      for (const [nameIdx, name] of seedCategories.entries())
        ops.push(
          stmt(
            'INSERT OR IGNORE INTO categories(id,name,is_active) VALUES(?,?,1)',
            'category-' + nameIdx,
            name,
          ),
        );
      for (const j of sampleJobs) {
        const i = names.indexOf(j.company_name);
        ops.push(
          stmt(
            'INSERT INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo,specialty) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)',
            j.id,
            'demo-company-' + i,
            'demo-employer-' + i,
            j.category,
            j.title,
            j.description,
            j.requirements,
            j.benefits,
            j.location,
            j.salary_min,
            j.salary_max,
            new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
            'active',
            j.experience,
            j.type,
            JSON.stringify(j.tags),
            now(),
            now(),
        inferSpecialty(j.category, j.title),
          ),
        );
      }
      ops.push(auditStmt(u, 'demo:seed', 'demo'));
      await db().batch(ops);
      return response({ ok: true });
    }
    return response({ error: 'Thao tác không hợp lệ.' }, 400);
  } catch (e) {
    return error(e);
  }
}

export async function POST(req: Request) {
  const result = await mutate(req);
  if (result.ok) await deliverSafely();
  return result;
}
