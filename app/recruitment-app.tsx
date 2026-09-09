'use client';
import { locations, normalizeLocation } from '@/lib/locations';
import UserAvatar from './user-avatar';
import CommunicationPanel from './communication-panel';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  FormEvent,
  ReactNode,
} from 'react';
import {
  Search,
  MapPin,
  Bookmark,
  ArrowUpRight,
  BriefcaseBusiness,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Bell,
  Plus,
  FileText,
  Building2,
  Users,
  LayoutDashboard,
  LogOut,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  ShieldCheck,
  Clock,
  FolderCheck,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
const labels: Record<string, string> = {
  candidate: 'Ứng viên',
  employer: 'Nhà tuyển dụng',
  admin: 'Quản trị viên',
  active: 'Đang tuyển',
  pending: 'Chờ duyệt',
  draft: 'Bản nháp',
  closed: 'Đã đóng',
  expired: 'Hết hạn',
  hidden: 'Đã ẩn',
  rejected: 'Từ chối',
  submitted: 'Đã nộp',
  viewed: 'Đã xem',
  shortlisted: 'Phù hợp',
  interview: 'Phỏng vấn',
  hired: 'Trúng tuyển',
  verified: 'Đã xác minh',
  blocked: 'Đã khóa',
  locked: 'Đã khóa',
};
const date = (d: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');
const blank = {
  user: null,
  jobs: [],
  categories: [],
  companies: [],
  saved: [],
  applications: [],
  resumes: [],
  notifications: [],
  managedJobs: [],
  users: [],
  allCategories: [],
  audit: [],
  total: 0,
  needsSetup: false,
  profile: null,
  company: null,
  stats: {},
};
const experiences = [
  'Chưa có kinh nghiệm',
  'Dưới 1 năm',
  '1–3 năm',
  '3–5 năm',
  'Trên 5 năm',
];
function Pick({
  value,
  onChange,
  options,
  label,
  empty,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  label: string;
  empty?: string;
}) {
  const items = options.map((x) =>
    typeof x === 'string' ? { value: x, label: x } : x,
  );
  if (empty) items.unshift({ value: '', label: empty });
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v ?? '')}
      items={items}
    >
      <SelectTrigger aria-label={label} className="picker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((x) => (
          <SelectItem key={x.value} value={x.value}>
            {x.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  wide = false,
  children,
}: {
  label: string;
  name: string;
  value?: any;
  onChange?: (v: string) => void;
  type?: string;
  required?: boolean;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <label className={'field ' + (wide ? 'wide' : '')}>
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children ||
        (type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
            maxLength={10000}
          />
        ) : (
          <input
            name={name}
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
            min={type === 'number' ? 0 : undefined}
            maxLength={type === 'password' ? 128 : 500}
            minLength={type === 'password' ? 8 : undefined}
          />
        ))}
    </label>
  );
}
function Badge({ status }: { status: string }) {
  return <span className={'badge ' + status}>{labels[status] || status}</span>;
}
function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <FolderCheck size={33} />
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
async function api(path: string, body?: any) {
  const r = await fetch(
    path,
    body
      ? {
          method: 'POST',
          headers:
            body instanceof FormData
              ? undefined
              : { 'Content-Type': 'application/json' },
          body: body instanceof FormData ? body : JSON.stringify(body),
        }
      : undefined,
  );
  const data: any = await r.json();
  if (!r.ok) throw new Error(data.error || 'Không thể kết nối với hệ thống.');
  return data;
}
export default function RecruitmentApp() {
  const [data, setData] = useState<any>(blank),
    [view, setView] = useState('jobs'),
    [ready, setReady] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState<{ text: string; error?: boolean } | null>(
      null,
    );
  useEffect(() => {
    if (message?.error || message?.text !== 'Đăng nhập thành công.') return;
    const timer = window.setTimeout(() => {
      setMessage(current => current === message ? null : current);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [message]);
  const [q, setQ] = useState(''),
    [query, setQuery] = useState(''),
    [location, setLocation] = useState(''),
    [category, setCategory] = useState(''),
    [experience, setExperience] = useState(''),
    [type, setType] = useState(''),
    [salary, setSalary] = useState(''),
    [sort, setSort] = useState('newest'),
    [page, setPage] = useState(1),
    [mobileFilters, setMobileFilters] = useState(false),
    [statusFilter, setStatusFilter] = useState(''),
    [appJob, setAppJob] = useState('');
  const [modal, setModal] = useState<string | null>(null),
    [form, setForm] = useState<any>({}),
    [selected, setSelected] = useState<any>(null),
    [confirm, setConfirm] = useState<any>(null),
    [upload, setUpload] = useState<File | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  useEffect(() => {
    setSearchSuggestions([]);
    if (q.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/data?q=' + encodeURIComponent(q.trim()), { signal: controller.signal });
        if (!res.ok) return;
        const result: any = await res.json();
        if (!controller.signal.aborted) {
          setSearchSuggestions([...new Set<string>((result.jobs || []).map((job: any) => job.title))]);
        }
      } catch { /* Typing and searching remain available when suggestions cannot load. */ }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [q]);
  const [communicationTarget, setCommunicationTarget] = useState<{
    applicationId: string;
    create?: boolean;
  } | null>(null);
  function communicate(v: string, a: any) {
    navigate(v);
    setCommunicationTarget({ applicationId: a.id, create: v === 'interviews' });
  }
  const generation = useRef(0);
  const u = data.user;
  const [avatarRevision, setAvatarRevision] = useState(0);
  async function changeAvatar(file?: File) {
    setBusy(true);
    try {
      let body: FormData | undefined;
      if (file) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP, tối đa 2 MB.');
        // Decode and re-encode before upload to remove metadata and cap dimensions.
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Không thể xử lý ảnh.');
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (!blob) throw new Error('Không thể đọc ảnh.');
        body = new FormData(); body.append('file', blob, 'avatar.jpg');
      }
      const res = await fetch('/api/avatar', { method: file ? 'POST' : 'DELETE', body });
      const result: any = await res.json();
      if (!res.ok) throw new Error(result.error || 'Không thể cập nhật ảnh.');
      setAvatarRevision(v => v + 1);
      setMessage({ text: file ? 'Đã cập nhật ảnh đại diện.' : 'Đã xóa ảnh đại diện.' });
    } catch (e) { setMessage({ text: (e as Error).message, error: true }); }
    finally { setBusy(false); }
  }
  const load = useCallback(async () => {
    const n = ++generation.current;
    setLoading(true);
    try {
      const p = new URLSearchParams({
        q: query,
        location,
        category,
        experience,
        type,
        salary,
        sort,
        page: String(page),
        saved: view === 'saved' ? '1' : '0',
      });
      const d = await api('/api/data?' + p);
      if (n === generation.current) setData(d);
    } catch (e) {
      if (n === generation.current)
        setMessage({ text: (e as Error).message, error: true });
    } finally {
      if (n === generation.current) setLoading(false);
    }
  }, [query, location, category, experience, type, salary, sort, page, view]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setView(p.get('view') || 'jobs');
    setQuery(p.get('q') || '');
    setQ(p.get('q') || '');
    setReady(true);
    const back = () =>
      setView(
        new URLSearchParams(window.location.search).get('view') || 'jobs',
      );
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, []);
  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);
  function navigate(v: string) {
    setCommunicationTarget(null);
    setView(v);
    setPage(1);
    setStatusFilter('');
    setMessage(null);
    window.history.pushState({}, '', v === 'jobs' ? '/' : '/?view=' + v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function open(kind: string, values: any = {}) {
    setMessage(null);
    if (kind === 'application' && values.status === 'submitted')
      values = { ...values, status: 'viewed' };
    setForm(values);
    setModal(kind);
    setUpload(null);
  }
  async function run(body: any, text = 'Đã lưu thay đổi.') {
    if (busy) return false;
    setBusy(true);
    setMessage(null);
    try {
      await api('/api/data', body);
      await load();
      setMessage({ text });
      return true;
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true });
      return false;
    } finally {
      setBusy(false);
    }
  }
  const mustLogin = () => {
    if (!u) {
      open('login');
      return false;
    }
    return true;
  };
  function reset() {
    setQ('');
    setQuery('');
    setLocation('');
    setCategory('');
    setExperience('');
    setType('');
    setSalary('');
    setPage(1);
  }
  async function showJob(j: any) {
    setSelected(j);
    try {
      const d = await api('/api/data?job=' + encodeURIComponent(j.id));
      if (d.detail) setSelected(d.detail);
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true });
    }
  }
  function apply(j: any) {
    if (!mustLogin()) return;
    if (u.role !== 'candidate') {
      setMessage({
        text: 'Hãy đăng nhập bằng tài khoản ứng viên để nộp hồ sơ.',
        error: true,
      });
      return;
    }
    if (!data.resumes.length) {
      setSelected(null);
      navigate('profile');
      setMessage({ text: 'Tải lên CV trước khi ứng tuyển.' });
      return;
    }
    open('apply', {
      id: j.id,
      title: j.title,
      resume_id: data.resumes[0].id,
      cover_letter: '',
    });
  }
  async function save(j: any) {
    if (!mustLogin()) return;
    await run(
      { action: 'save', id: j.id, saved: !data.saved.includes(j.id) },
      data.saved.includes(j.id) ? 'Đã bỏ lưu việc làm.' : 'Đã lưu việc làm.',
    );
  }
  async function logout() {
    setBusy(true);
    try {
      await api('/api/auth', { action: 'logout' });
      setData(blank);
      navigate('jobs');
      await load();
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const ctrl = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'search_jobs',
            title: 'Tìm việc làm',
            description:
              'Tìm việc theo từ khóa và cập nhật danh sách việc làm đang hiển thị.',
            inputSchema: {
              type: 'object',
              properties: { query: { type: 'string', maxLength: 150 } },
              required: ['query'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            async execute(input: any) {
              if (
                !input ||
                typeof input.query !== 'string' ||
                input.query.length > 150
              )
                throw new Error('Từ khóa không hợp lệ');
              setQ(input.query);
              setQuery(input.query);
              setPage(1);
              setView('jobs');
              const d = await api(
                '/api/data?q=' + encodeURIComponent(input.query),
              );
              return {
                total: d.total,
                jobs: d.jobs.map((j: any) => ({
                  id: j.id,
                  title: j.title,
                  company: j.company_name,
                })),
              };
            },
          },
          { signal: ctrl.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => ctrl.abort();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage(null);
    if (['login', 'register', 'setup'].includes(modal || '')) {
      setBusy(true);
      try {
        const d = await api('/api/auth', { ...form, action: modal });
        setModal(null);
        navigate(d.user.role === 'candidate' ? 'jobs' : 'dashboard');
        await load();
        setMessage({ text: 'Đăng nhập thành công.' });
      } catch (e) {
        setMessage({ text: (e as Error).message, error: true });
      } finally {
        setBusy(false);
      }
      return;
    }
    if (modal === 'upload') {
      if (!upload) {
        setMessage({ text: 'Vui lòng chọn tệp PDF.', error: true });
        return;
      }
      setBusy(true);
      try {
        const b = new FormData();
        b.set('file', upload);
        b.set('title', form.title || upload.name);
        await api('/api/resumes', b);
        setModal(null);
        await load();
        setMessage({ text: 'Đã tải lên CV.' });
      } catch (e) {
        setMessage({ text: (e as Error).message, error: true });
      } finally {
        setBusy(false);
      }
      return;
    }
    const actions: any = {
      profile: 'profile',
      company: 'company',
      job: 'job-save',
      apply: 'apply',
      application: 'application-status',
      moderate: 'moderate',
      category: 'category',
      companyStatus: 'company-status',
    };
    if (
      await run(
        { ...form, action: actions[modal || ''] },
        modal === 'apply'
          ? 'Đã nộp hồ sơ thành công.'
          : modal === 'job'
            ? 'Tin đã được lưu. Tin gửi duyệt sẽ xuất hiện sau khi quản trị viên phê duyệt.'
            : 'Đã lưu thay đổi.',
      )
    ) {
      setModal(null);
      if (modal === 'apply' || modal === 'moderate') setSelected(null);
    }
  }
  const set = (name: string) => (value: string) =>
    setForm((f: any) => ({ ...f, [name]: value }));
  const categoryOptions = data.categories.map((c: any) => c.name);
  const countUnread = data.notifications.filter((n: any) => !n.is_read).length;
  const navItems: uNav[] =
    u?.role === 'admin'
      ? [
          ['dashboard', 'Tổng quan'],
          ['manage-jobs', 'Duyệt tin'],
          ['users', 'Người dùng'],
          ['manage-companies', 'Doanh nghiệp'],
          ['categories', 'Danh mục'],
          ['audit', 'Nhật ký'],
          ['email', 'Email'],
        ]
      : u?.role === 'employer'
        ? [
            ['dashboard', 'Tổng quan'],
            ['manage-jobs', 'Tin tuyển dụng'],
            ['applications', 'Ứng viên'],
            ['company', 'Doanh nghiệp'],
            ['chat', 'Tin nhắn'],
            ['interviews', 'Lịch phỏng vấn'],
            ['email', 'Email'],
          ]
        : [
            ['jobs', 'Tìm việc làm'],
            ['companies', 'Công ty'],
            ['profile', 'Hồ sơ & CV'],
            ...(u
              ? ([
                  ['saved', 'Đã lưu'],
                  ['applications', 'Ứng tuyển'],
                  ['chat', 'Tin nhắn'],
                  ['interviews', 'Lịch phỏng vấn'],
                  ['email', 'Email'],
                ] as uNav[])
              : []),
          ];
  const managed = data.managedJobs.filter(
    (j: any) => !statusFilter || j.status === statusFilter,
  );
  const applications = data.applications.filter(
    (a: any) =>
      (!statusFilter || a.status === statusFilter) &&
      (!appJob || a.job_id === appJob),
  );
  const filters = (
    <>
      <div className="row">
        <h3>
          <SlidersHorizontal size={17} /> Bộ lọc
        </h3>
        <button className="text-button" onClick={reset}>
          Đặt lại
        </button>
      </div>
      <hr />
      <h4>Ngành nghề</h4>
      {categoryOptions.map((c: string) => (
        <label className="filter-option" key={c}>
          <Checkbox
            checked={category === c}
            onCheckedChange={(v) => {
              setCategory(v ? c : '');
              setPage(1);
            }}
          />
          {c}
        </label>
      ))}
      <hr />
      <h4>Mức lương</h4>
      <Pick
        value={salary}
        onChange={(v) => {
          setSalary(v);
          setPage(1);
        }}
        options={[
          { value: '10', label: 'Từ 10 triệu' },
          { value: '20', label: 'Từ 20 triệu' },
          { value: '30', label: 'Từ 30 triệu' },
        ]}
        empty="Tất cả mức lương"
        label="Mức lương"
      />
      <hr />
      <h4>Kinh nghiệm</h4>
      {experiences.map((c) => (
        <label className="filter-option" key={c}>
          <Checkbox
            checked={experience === c}
            onCheckedChange={(v) => {
              setExperience(v ? c : '');
              setPage(1);
            }}
          />
          {c}
        </label>
      ))}
      <hr />
      <h4>Hình thức làm việc</h4>
      <Pick
        value={type}
        onChange={(v) => {
          setType(v);
          setPage(1);
        }}
        options={['Toàn thời gian', 'Bán thời gian', 'Thực tập', 'Hợp đồng']}
        empty="Tất cả hình thức"
        label="Hình thức làm việc"
      />
    </>
  );
  const jobCard = (j: any) => (
    <article className="job-card" key={j.id}>
      <div className="company-logo" style={{ background: j.color }}>
        {j.initials}
      </div>
      <div className="job-info">
        <div className="company-name">
          {j.company_name}
          {j.company_status === 'verified' && <ShieldCheck size={14} />}
        </div>
        <h3>
          <button onClick={() => showJob(j)}>{j.title}</button>
        </h3>
        <div className="job-meta">
          <span>
            <MapPin />
            {j.location}
          </span>
          <span>
            <BriefcaseBusiness />
            {j.experience}
          </span>
        </div>
        <div className="tags">
          {j.tags.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
          {j.is_demo === 1 && <span>Mẫu minh họa</span>}
        </div>
      </div>
      <div className="job-right">
        {(!u || u.role === 'candidate') && (
          <button
            className={
              'icon-button ' + (data.saved.includes(j.id) ? 'saved' : '')
            }
            aria-label={
              data.saved.includes(j.id) ? 'Bỏ lưu ' + j.title : 'Lưu ' + j.title
            }
            disabled={busy}
            onClick={() => save(j)}
          >
            <Bookmark
              size={19}
              fill={data.saved.includes(j.id) ? 'currentColor' : 'none'}
            />
          </button>
        )}
        <strong>
          {j.salary_min}–{j.salary_max} triệu
        </strong>
        <span>Hạn {date(j.deadline)}</span>
      </div>
    </article>
  );
  const appTable = (
    <>
      {applications.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {u?.role === 'employer' ? 'Ứng viên' : 'Vị trí tuyển dụng'}
              </TableHead>
              <TableHead>CV đã nộp</TableHead>
              <TableHead>Ngày nộp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell>
                  <strong>
                    {u?.role === 'employer' ? a.candidate_name : a.title}
                  </strong>
                  <div className="muted">
                    {u?.role === 'employer' ? a.title : a.company_name}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    className="text-button"
                    href={'/api/resumes/' + a.resume_id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} /> {a.resume_title}
                  </a>
                </TableCell>
                <TableCell>{date(a.applied_at)}</TableCell>
                <TableCell>
                  <Badge status={a.status} />
                </TableCell>
                <TableCell>
                  {u?.role === 'employer' ? (
                    <button
                      className="outline-button"
                      onClick={() => open('application', a)}
                    >
                      Xử lý hồ sơ
                    </button>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => open('applicationDetail', a)}
                    >
                      Chi tiết
                    </button>
                  )}
                  <div className="application-contact-actions">
                    <button
                      className="text-button"
                      onClick={() => communicate('chat', a)}
                    >
                      Nhắn tin
                    </button>
                    {u?.role === 'employer' && (
                      <button
                        className="text-button"
                        onClick={() => communicate('interviews', a)}
                      >
                        Hẹn phỏng vấn
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty title="Chưa có hồ sơ ứng tuyển">
          {u?.role === 'candidate' ? (
            <button className="primary" onClick={() => navigate('jobs')}>
              Khám phá việc làm
            </button>
          ) : (
            'Hồ sơ mới sẽ xuất hiện tại đây khi ứng viên nộp CV.'
          )}
        </Empty>
      )}
    </>
  );
  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('jobs');
          }}
        >
          <span className="brand-icon">t↗</span>talent<span>hub</span>
        </a>
        {u?.role !== 'candidate' && <nav aria-label="Điều hướng chính">
          {u?.role === 'employer' || u?.role === 'admin' ? (
            <>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('jobs');
                }}
              >
                Tìm việc làm
              </a>
              <a
                className={view !== 'jobs' ? 'active' : ''}
                href="/?view=dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('dashboard');
                }}
              >
                {labels[u.role]}
              </a>
            </>
          ) : (
            navItems.slice(0, 3).map(([v, t]) => (
              <a
                key={v}
                className={view === v ? 'active' : ''}
                href={'/?view=' + v}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(v);
                }}
              >
                {t}
              </a>
            ))
          )}
        </nav>}
        <div className="header-actions">
          {u ? (
            <>
              <button
                className="notification-button"
                aria-label={`Thông báo: ${countUnread} chưa đọc`}
                onClick={() => navigate('notifications')}
              >
                <Bell size={20} />
                {countUnread > 0 && <b>{countUnread}</b>}
              </button>
              <button
                className="user-pill"
                onClick={() =>
                  navigate(u.role === 'candidate' ? 'profile' : 'dashboard')
                }
              >
                <UserAvatar key={u.id + avatarRevision} name={u.name} revision={avatarRevision} />
                <span>{u.name.split(' ').slice(-2).join(' ')}</span>
              </button>
              <button
                className="logout-button"
                aria-label="Đăng xuất"
                title="Đăng xuất"
                disabled={busy}
                onClick={logout}
              >
                <LogOut size={17} /> <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => open('login')}>Đăng nhập</button>
              <button
                className="primary"
                onClick={() => open('register', { role: 'candidate' })}
              >
                Đăng ký
              </button>
              <span className="separator" />
              <button onClick={() => open('register', { role: 'employer' })}>
                Nhà tuyển dụng <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </div>
      </header>
      {u && (
        <div className="workspace-nav">
          <div className="container">
            {navItems.map(([v, t]) => (
              <button
                key={v}
                className={view === v ? 'active' : ''}
                onClick={() => navigate(v)}
              >
                {t}
                {v === 'saved' && <small>{data.saved.length}</small>}
              </button>
            ))}
          </div>
        </div>
      )}
      {message && !modal && (
        <div
          className={'container feedback ' + (message.error ? 'error' : '')}
          role={message.error ? 'alert' : 'status'}
        >
          {message.text}
          <button aria-label="Đóng thông báo" onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      {!loading && data.needsSetup && (
        <div className="container setup-banner">
          <ShieldCheck size={19} />
          <span>
            Khởi tạo tài khoản quản trị để thiết lập danh mục và dữ liệu của
            website.
          </span>
          <button className="primary" onClick={() => open('setup')}>
            Thiết lập hệ thống
          </button>
        </div>
      )}
      {view === 'jobs' || view === 'saved' ? (
        <>
          <section className="search-zone">
            <div className="container">
              <div className="career-hero">
              <div className="career-copy">
              <div className="eyebrow"><span className="hero-dot" /> CƠ HỘI MỚI, HÀNH TRÌNH MỚI</div>
              <h1>
                {view === 'saved' ? (
                  <>
                    Những cơ hội <em>bạn đã lưu.</em>
                  </>
                ) : (
                  <>
                    Tìm công việc <em>đúng với bạn.</em>
                  </>
                )}
              </h1>
              <p>
                Kết nối với doanh nghiệp phù hợp. Bắt đầu bước tiến tiếp theo.
              </p>
              </div>
              <img className="career-art" src="/career-illustration.svg" alt="Minh họa không gian làm việc với cây xanh và những cơ hội nghề nghiệp mới" width="560" height="350" />
              </div>
              <form
                className="searchbar"
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuery(q);
                  setPage(1);
                }}
              >
                <Search size={22} />
                <input
                  aria-label="Từ khóa tìm việc"
                  list="job-title-suggestions"
                  autoComplete="off"
                  placeholder="Vị trí tuyển dụng, kỹ năng hoặc công ty"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <datalist id="job-title-suggestions">
                  {searchSuggestions.map(title => <option key={title} value={title} />)}
                </datalist>
                <div className="location">
                  <MapPin size={19} />
                  <Pick
                    value={location}
                    onChange={(v) => {
                      setLocation(v);
                      setPage(1);
                    }}
                    options={locations}
                    empty="Tất cả địa điểm"
                    label="Địa điểm"
                  />
                </div>
                <button className="primary" type="submit">
                  Tìm việc <ArrowRight size={17} />
                </button>
              </form>
              <div className="trending">
                <span>Tìm kiếm nhanh:</span>
                {['React', 'UI/UX', 'Marketing', 'Java'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setQ(t);
                      setQuery(t);
                      setPage(1);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <main className="container job-layout">
            <aside
              className={
                'filter-panel ' + (mobileFilters ? 'show-filters' : '')
              }
            >
              {filters}
            </aside>
            <section>
              <div className="results-heading">
                <div>
                  <h2>
                    {view === 'saved'
                      ? 'Việc làm đã lưu'
                      : 'Việc làm dành cho bạn'}
                  </h2>
                  <p>
                    <strong>{data.total}</strong> cơ hội đang chờ bạn khám phá
                  </p>
                </div>
                <Pick
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'salary', label: 'Lương cao nhất' },
                  ]}
                  label="Sắp xếp"
                />
              </div>
              <button
                className="mobile-filter outline-button"
                onClick={() => setMobileFilters(!mobileFilters)}
              >
                <SlidersHorizontal size={16} /> Bộ lọc{' '}
                {mobileFilters ? '−' : '+'}
              </button>
              <div className="job-list">
                {loading ? (
                  <>
                    {[1, 2, 3].map((n) => (
                      <Skeleton key={n} className="h-40 rounded-xl" />
                    ))}
                  </>
                ) : data.jobs.length ? (
                  data.jobs.map(jobCard)
                ) : (
                  <Empty title="Chưa tìm thấy việc làm phù hợp">
                    <p>Thử từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                    <button className="outline-button" onClick={reset}>
                      Xóa bộ lọc
                    </button>
                  </Empty>
                )}
              </div>
              {data.total > 6 && (
                <Pagination className="pages">
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        className="outline-button"
                        aria-label="Trang trước"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft size={17} />
                      </button>
                    </PaginationItem>
                    <PaginationItem>
                      <span>
                        Trang {page} / {Math.ceil(data.total / 6)}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <button
                        className="outline-button"
                        aria-label="Trang sau"
                        disabled={page * 6 >= data.total}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight size={17} />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </section>
            <aside className="right-rail">
              <div className="profile-promo">
                <div className="promo-icon">
                  <BriefcaseBusiness size={26} />
                </div>
                <span className="eyebrow">SẴN SÀNG CHO CƠ HỘI MỚI</span>
                <h2>
                  Hồ sơ tốt.
                  <br />
                  Khởi đầu tốt.
                </h2>
                <p>
                  Chuẩn bị CV để ứng tuyển nhanh và theo dõi mọi cơ hội tại một
                  nơi.
                </p>
                <button
                  onClick={() => {
                    if (mustLogin()) navigate('profile');
                  }}
                >
                  {u ? 'Quản lý hồ sơ' : 'Tạo hồ sơ ngay'}{' '}
                  <ArrowRight size={17} />
                </button>
                <div className="promo-foot">
                  <Check size={14} /> Miễn phí dành cho ứng viên
                </div>
              </div>
              <div className="note">
                <h4>Một hành trình rõ ràng</h4>
                <p>
                  Tìm việc phù hợp, gửi CV và cập nhật trạng thái ứng tuyển ngay
                  trên TalentHub.
                </p>
              </div>
              <p className="sample-note">
                Các tin có nhãn “Mẫu minh họa” sử dụng doanh nghiệp giả lập phục
                vụ đề án.
              </p>
            </aside>
          </main>
        </>
      ) : (
        <main className={'container workspace' + (view === 'chat' ? ' chat-page' : '')}>
          {u && ['chat', 'interviews', 'email'].includes(view) && (
            <CommunicationPanel
              key={view + u.id}
              view={view}
              user={u}
              applications={data.applications}
              target={communicationTarget}
              onChanged={() => void load()}
            />
          )}
          {view === 'companies' && (
            <>
              <div className="page-heading">
                <div className="eyebrow">KHÁM PHÁ DOANH NGHIỆP</div>
                <h1>Tìm nơi bạn muốn gắn bó.</h1>
                <p>Thông tin doanh nghiệp và cơ hội tuyển dụng.</p>
              </div>
              <div className="company-grid">
                {data.companies.map((c: any) => (
                  <article className="panel" key={c.id}>
                    <div className="company-logo">
                      <Building2 />
                    </div>
                    <h2>{c.name}</h2>
                    <p className="muted">{c.address}</p>
                    {c.status === 'verified' && <Badge status="verified" />}
                    <p>{c.description}</p>
                    {c.is_demo === 1 && (
                      <p className="sample-note">Doanh nghiệp giả lập</p>
                    )}
                    <button
                      className="text-button"
                      onClick={() => {
                        setQuery(c.name);
                        setQ(c.name);
                        navigate('jobs');
                      }}
                    >
                      Xem việc làm <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
              {!data.companies.length && (
                <Empty title="Chưa có doanh nghiệp">
                  Thông tin doanh nghiệp sẽ xuất hiện khi nhà tuyển dụng hoàn
                  thiện hồ sơ.
                </Empty>
              )}
            </>
          )}
          {!u && !['companies'].includes(view) && (
            <Empty title="Đăng nhập để tiếp tục">
              <p>Quản lý hồ sơ, lưu việc làm và theo dõi ứng tuyển của bạn.</p>
              <button className="primary" onClick={() => open('login')}>
                Đăng nhập
              </button>
            </Empty>
          )}
          {u && view === 'profile' && (
            <>
              <div className="page-heading row">
                <div>
                  <div className="eyebrow">HỒ SƠ CÁ NHÂN</div>
                  <h1>Xin chào, {u.name}.</h1>
                  <p>Cập nhật thông tin để sẵn sàng cho cơ hội tiếp theo.</p>
                </div>
                <button
                  className="outline-button"
                  onClick={() =>
                    open('profile', { ...data.profile, name: u.name })
                  }
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
              <div className="profile-grid">
                <section className="panel">
                  <UserAvatar key={u.id + avatarRevision} name={u.name} revision={avatarRevision} large />
                  <div className="avatar-controls">
                    <label className="outline-button avatar-upload">
                      Đổi ảnh đại diện
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} aria-label="Chọn ảnh đại diện" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void changeAvatar(f); }} />
                    </label>
                    <button className="text-button" disabled={busy} onClick={() => void changeAvatar()}>Xóa ảnh</button>
                  </div>
                  <p className="muted">Chọn ảnh đang dùng trên Google hoặc ảnh từ máy. JPG, PNG, WebP; tối đa 2 MB.</p>
                  <h2>{u.name}</h2>
                  <p>
                    {data.profile?.headline || 'Chưa có tiêu đề nghề nghiệp'}
                  </p>
                  <div className="profile-details">
                    <p>{u.email}</p>
                    <p>{data.profile?.phone || 'Chưa có số điện thoại'}</p>
                    <p>{normalizeLocation(data.profile?.location || '') || 'Chưa có địa điểm'}</p>
                  </div>
                  <h3>Kỹ năng</h3>
                  <p className="preline">
                    {data.profile?.skills || 'Chưa cập nhật'}
                  </p>
                  <h3>Kinh nghiệm</h3>
                  <p className="preline">
                    {data.profile?.experience_summary || 'Chưa cập nhật'}
                  </p>
                </section>
                <section className="panel">
                  <div className="row">
                    <div>
                      <h2>CV của bạn</h2>
                      <p className="muted">PDF, tối đa 5 MB mỗi tệp.</p>
                    </div>
                    {u.role === 'candidate' && (
                      <button
                        className="primary"
                        onClick={() => open('upload')}
                      >
                        <Plus size={18} /> Tải lên CV
                      </button>
                    )}
                  </div>
                  {data.resumes.map((r: any) => (
                    <div className="resume-card" key={r.id}>
                      <FileText size={28} />
                      <div>
                        <strong>{r.title}</strong>
                        <p className="muted">
                          {Math.ceil(r.size / 1024)} KB · {date(r.created_at)}
                        </p>
                        {r.is_default === 1 && <Badge status="CV mặc định" />}
                      </div>
                      <div className="resume-actions">
                        <a
                          href={'/api/resumes/' + r.id}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={'Tải CV ' + r.title}
                        >
                          <Download size={18} />
                        </a>
                        {!r.is_default && (
                          <button
                            className="text-button"
                            disabled={busy}
                            onClick={() =>
                              run({ action: 'resume-default', id: r.id })
                            }
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          aria-label={'Xóa CV ' + r.title}
                          onClick={() =>
                            setConfirm({
                              title: 'Xóa CV khỏi hồ sơ?',
                              description:
                                'CV đã dùng trong hồ sơ ứng tuyển vẫn được giữ lại để bảo toàn lịch sử.',
                              body: { action: 'resume-delete', id: r.id },
                            })
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!data.resumes.length && (
                    <Empty title="Chưa có CV">
                      Tải lên CV đầu tiên để bắt đầu ứng tuyển.
                    </Empty>
                  )}
                </section>
              </div>
            </>
          )}
          {u && view === 'notifications' && (
            <>
              <div className="page-heading row">
                <div>
                  <div className="eyebrow">CẬP NHẬT CỦA BẠN</div>
                  <h1>Thông báo</h1>
                </div>
                <button
                  className="outline-button"
                  disabled={busy || !countUnread}
                  onClick={() =>
                    run(
                      { action: 'notifications-read' },
                      'Đã đánh dấu tất cả là đã đọc.',
                    )
                  }
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              <div className="panel">
                {data.notifications.map((n: any) => (
                  <div
                    className={
                      'notification-row ' + (!n.is_read ? 'unread' : '')
                    }
                    key={n.id}
                  >
                    <Bell size={20} />
                    <div>
                      <p>{n.content}</p>
                      <span className="muted">
                        {new Date(n.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {!n.is_read && <span className="dot" />}
                  </div>
                ))}
                {!data.notifications.length && (
                  <Empty title="Bạn đã xem hết cập nhật">
                    Thông báo mới sẽ xuất hiện tại đây.
                  </Empty>
                )}
              </div>
            </>
          )}
          {u && view === 'applications' && (
            <>
              <div className="page-heading">
                <div className="eyebrow">
                  {u.role === 'employer'
                    ? 'QUẢN LÝ TUYỂN DỤNG'
                    : 'HÀNH TRÌNH ỨNG TUYỂN'}
                </div>
                <h1>
                  {u.role === 'employer'
                    ? 'Hồ sơ ứng viên'
                    : 'Việc làm đã ứng tuyển'}
                </h1>
                <p>Theo dõi từng hồ sơ từ khi nộp đến khi có kết quả.</p>
              </div>
              <div className="toolbar">
                <Pick
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    'submitted',
                    'viewed',
                    'shortlisted',
                    'interview',
                    'rejected',
                    'hired',
                  ].map((s) => ({ value: s, label: labels[s] }))}
                  empty="Tất cả trạng thái"
                  label="Trạng thái hồ sơ"
                />
                {u.role === 'employer' && (
                  <Pick
                    value={appJob}
                    onChange={setAppJob}
                    options={data.managedJobs.map((j: any) => ({
                      value: j.id,
                      label: j.title,
                    }))}
                    empty="Tất cả vị trí"
                    label="Vị trí tuyển dụng"
                  />
                )}
              </div>
              <div className="panel table-panel">{appTable}</div>
            </>
          )}
          {u?.role === 'employer' && view === 'company' && (
            <>
              <div className="page-heading row">
                <div>
                  <div className="eyebrow">HỒ SƠ DOANH NGHIỆP</div>
                  <h1>
                    {data.company?.name || 'Giới thiệu doanh nghiệp của bạn'}
                  </h1>
                </div>
                <button
                  className="primary"
                  onClick={() => open('company', data.company || {})}
                >
                  {data.company ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ doanh nghiệp'}
                </button>
              </div>
              {data.company ? (
                <section className="panel company-profile">
                  <Building2 size={40} />
                  <Badge status={data.company.status} />
                  <h2>{data.company.name}</h2>
                  <p className="preline">{data.company.description}</p>
                  <p>
                    <strong>Địa chỉ:</strong> {data.company.address}
                  </p>
                  <p>
                    <strong>Mã số thuế:</strong>{' '}
                    {data.company.tax_code || 'Chưa cập nhật'}
                  </p>
                  <p>
                    <strong>Website:</strong>{' '}
                    {data.company.website || 'Chưa cập nhật'}
                  </p>
                </section>
              ) : (
                <Empty title="Hoàn thiện hồ sơ trước khi đăng tin">
                  Thông tin doanh nghiệp sẽ hiển thị cùng với tin tuyển dụng của
                  bạn.
                </Empty>
              )}
            </>
          )}
          {u &&
            ['employer', 'admin'].includes(u.role) &&
            view === 'dashboard' && (
              <>
                <div className="page-heading row">
                  <div>
                    <div className="eyebrow">
                      {u.role === 'admin'
                        ? 'QUẢN TRỊ HỆ THỐNG'
                        : 'KHÔNG GIAN NHÀ TUYỂN DỤNG'}
                    </div>
                    <h1>Tổng quan tuyển dụng</h1>
                    <p>
                      Xin chào {u.name}, đây là hoạt động tuyển dụng hiện tại.
                    </p>
                  </div>
                  {u.role === 'employer' ? (
                    <button
                      className="primary"
                      onClick={() =>
                        open('job', {
                          type: 'Toàn thời gian',
                          experience: '1–3 năm',
                          category: categoryOptions[0] || '',
                        })
                      }
                    >
                      <Plus size={18} /> Đăng tin mới
                    </button>
                  ) : (
                    <button
                      className="outline-button"
                      onClick={() => navigate('categories')}
                    >
                      Quản lý danh mục
                    </button>
                  )}
                </div>
                <div className="stats-grid">
                  {(u.role === 'admin'
                    ? [
                        [Users, 'Người dùng', data.users.length],
                        [
                          Clock,
                          'Tin chờ duyệt',
                          data.managedJobs.filter(
                            (j: any) => j.status === 'pending',
                          ).length,
                        ],
                        [
                          BriefcaseBusiness,
                          'Tin đang tuyển',
                          data.managedJobs.filter(
                            (j: any) => j.status === 'active',
                          ).length,
                        ],
                        [
                          FileText,
                          'Hồ sơ ứng tuyển',
                          data.stats?.applications || 0,
                        ],
                      ]
                    : [
                        [
                          BriefcaseBusiness,
                          'Tin đang tuyển',
                          data.managedJobs.filter(
                            (j: any) => j.status === 'active',
                          ).length,
                        ],
                        [
                          FileText,
                          'Hồ sơ mới',
                          data.applications.filter(
                            (a: any) => a.status === 'submitted',
                          ).length,
                        ],
                        [
                          Users,
                          'Đang phỏng vấn',
                          data.applications.filter(
                            (a: any) => a.status === 'interview',
                          ).length,
                        ],
                        [
                          FolderCheck,
                          'Trúng tuyển',
                          data.applications.filter(
                            (a: any) => a.status === 'hired',
                          ).length,
                        ],
                      ]
                  ).map(([Icon, title, count]: any) => (
                    <div className="stat" key={title}>
                      <Icon size={21} />
                      <span>{title}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
                {u.role === 'employer' ? (
                  <section className="panel table-panel">
                    <div className="panel-heading row">
                      <h2>Hồ sơ ứng tuyển</h2>
                      <button
                        className="text-button"
                        onClick={() => navigate('applications')}
                      >
                        Xem tất cả <ArrowRight size={16} />
                      </button>
                    </div>
                    {appTable}
                  </section>
                ) : (
                  <section className="panel">
                    <div className="row">
                      <h2>Hàng đợi kiểm duyệt</h2>
                      <button
                        className="text-button"
                        onClick={() => {
                          navigate('manage-jobs');
                          setStatusFilter('pending');
                        }}
                      >
                        Xem hàng đợi <ArrowRight size={16} />
                      </button>
                    </div>
                    {data.managedJobs
                      .filter((j: any) => j.status === 'pending')
                      .slice(0, 5)
                      .map((j: any) => (
                        <div className="notification-row" key={j.id}>
                          <BriefcaseBusiness />
                          <div>
                            <strong>{j.title}</strong>
                            <p className="muted">{j.company_name}</p>
                          </div>
                          <button
                            className="outline-button"
                            onClick={() => showJob(j)}
                          >
                            Xem nội dung
                          </button>
                        </div>
                      ))}
                    {!data.managedJobs.some(
                      (j: any) => j.status === 'pending',
                    ) && (
                      <Empty title="Không có tin chờ duyệt">
                        Tin mới của nhà tuyển dụng sẽ xuất hiện tại đây.
                      </Empty>
                    )}
                  </section>
                )}
              </>
            )}
          {u &&
            ['employer', 'admin'].includes(u.role) &&
            view === 'manage-jobs' && (
              <>
                <div className="page-heading row">
                  <div>
                    <div className="eyebrow">QUẢN LÝ NỘI DUNG</div>
                    <h1>
                      {u.role === 'admin'
                        ? 'Kiểm duyệt tin tuyển dụng'
                        : 'Tin tuyển dụng của bạn'}
                    </h1>
                    <p>
                      {u.role === 'admin'
                        ? 'Kiểm tra nội dung và quyết định trạng thái công khai.'
                        : 'Theo dõi tin, chỉnh sửa nội dung và tiếp nhận hồ sơ.'}
                    </p>
                  </div>
                  {u.role === 'employer' && (
                    <button
                      className="primary"
                      onClick={() =>
                        open('job', {
                          type: 'Toàn thời gian',
                          experience: '1–3 năm',
                          category: categoryOptions[0] || '',
                        })
                      }
                    >
                      <Plus size={18} /> Đăng tin mới
                    </button>
                  )}
                </div>
                <div className="toolbar">
                  <Pick
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      'draft',
                      'pending',
                      'active',
                      'rejected',
                      'closed',
                      'expired',
                      'hidden',
                    ].map((s) => ({ value: s, label: labels[s] }))}
                    empty="Tất cả trạng thái"
                    label="Trạng thái tin"
                  />
                </div>
                <div className="panel table-panel">
                  {managed.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vị trí tuyển dụng</TableHead>
                          <TableHead>Hạn nộp</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managed.map((j: any) => (
                          <TableRow key={j.id}>
                            <TableCell>
                              <button
                                className="table-title"
                                onClick={() => showJob(j)}
                              >
                                {j.title}
                              </button>
                              <p className="muted">{j.company_name}</p>
                              {j.reason && <p className="reason">{j.reason}</p>}
                            </TableCell>
                            <TableCell>{date(j.deadline)}</TableCell>
                            <TableCell>
                              <Badge status={j.status} />
                            </TableCell>
                            <TableCell>
                              <div className="actions">
                                {u.role === 'employer' ? (
                                  <>
                                    <button
                                      className="text-button"
                                      onClick={() =>
                                        open('job', {
                                          ...j,
                                          tags: j.tags.join(', '),
                                          draft: false,
                                        })
                                      }
                                    >
                                      Chỉnh sửa
                                    </button>
                                    <button
                                      className="text-button"
                                      onClick={() =>
                                        setConfirm({
                                          title: 'Đóng tin tuyển dụng?',
                                          description:
                                            'Tin ngừng nhận hồ sơ mới. Lịch sử ứng tuyển vẫn được giữ lại.',
                                          body: {
                                            action: 'job-close',
                                            id: j.id,
                                          },
                                        })
                                      }
                                    >
                                      Đóng tin
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="text-button"
                                      onClick={() => showJob(j)}
                                    >
                                      Xem
                                    </button>
                                    {j.status === 'pending' && (
                                      <button
                                        className="text-button"
                                        onClick={() =>
                                          open('moderate', {
                                            id: j.id,
                                            title: j.title,
                                            status: 'active',
                                          })
                                        }
                                      >
                                        Duyệt
                                      </button>
                                    )}
                                    <button
                                      className="text-button"
                                      onClick={() =>
                                        open('moderate', {
                                          id: j.id,
                                          title: j.title,
                                          status:
                                            j.status === 'pending'
                                              ? 'rejected'
                                              : 'hidden',
                                        })
                                      }
                                    >
                                      {j.status === 'pending'
                                        ? 'Từ chối'
                                        : 'Ẩn tin'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Empty title="Chưa có tin tuyển dụng">
                      {u.role === 'employer'
                        ? 'Hoàn thiện hồ sơ doanh nghiệp và tạo tin tuyển dụng đầu tiên.'
                        : 'Không có tin phù hợp với bộ lọc.'}
                    </Empty>
                  )}
                </div>
              </>
            )}
          {u?.role === 'admin' && view === 'users' && (
            <>
              <div className="page-heading">
                <div className="eyebrow">QUẢN TRỊ TÀI KHOẢN</div>
                <h1>Người dùng</h1>
                <p>
                  Khóa tài khoản sẽ thu hồi các phiên đăng nhập đang hoạt động.
                </p>
              </div>
              <div className="panel table-panel">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((x: any) => (
                      <TableRow key={x.id}>
                        <TableCell>
                          <strong>{x.name}</strong>
                          <p className="muted">{x.email}</p>
                        </TableCell>
                        <TableCell>{labels[x.role]}</TableCell>
                        <TableCell>{date(x.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            status={
                              x.status === 'active' ? 'Hoạt động' : 'locked'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {x.role !== 'admin' && (
                            <button
                              className="outline-button"
                              onClick={() =>
                                setConfirm({
                                  title:
                                    x.status === 'active'
                                      ? 'Khóa tài khoản?'
                                      : 'Mở khóa tài khoản?',
                                  description: x.name + ' · ' + x.email,
                                  body: {
                                    action: 'user-status',
                                    id: x.id,
                                    status:
                                      x.status === 'active'
                                        ? 'locked'
                                        : 'active',
                                  },
                                })
                              }
                            >
                              {x.status === 'active' ? 'Khóa' : 'Mở khóa'}
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          {u?.role === 'admin' && view === 'manage-companies' && (
            <>
              <div className="page-heading">
                <div className="eyebrow">QUẢN TRỊ DOANH NGHIỆP</div>
                <h1>Doanh nghiệp</h1>
                <p>Xác minh thông tin và quản lý trạng thái doanh nghiệp.</p>
              </div>
              <div className="company-grid">
                {data.companies.map((c: any) => (
                  <article className="panel" key={c.id}>
                    <h2>{c.name}</h2>
                    <Badge status={c.status} />
                    <p>{c.description}</p>
                    <p className="muted">{c.address}</p>
                    <p className="muted">
                      Mã số thuế: {c.tax_code || 'Chưa có'}
                    </p>
                    <button
                      className="outline-button"
                      onClick={() =>
                        open('companyStatus', {
                          id: c.id,
                          title: c.name,
                          status: c.status,
                        })
                      }
                    >
                      Cập nhật trạng thái
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {u?.role === 'admin' && view === 'categories' && (
            <>
              <div className="page-heading row">
                <div>
                  <div className="eyebrow">DỮ LIỆU DÙNG CHUNG</div>
                  <h1>Danh mục nghề nghiệp</h1>
                </div>
                <button
                  className="primary"
                  onClick={() => open('category', { is_active: true })}
                >
                  <Plus size={18} /> Thêm danh mục
                </button>
              </div>
              <div className="panel">
                {data.allCategories.map((c: any) => (
                  <div className="notification-row" key={c.id}>
                    <BriefcaseBusiness size={19} />
                    <strong>{c.name}</strong>
                    <Badge status={c.is_active ? 'Đang sử dụng' : 'Đã ẩn'} />
                    <button
                      className="text-button"
                      onClick={() =>
                        open('category', { ...c, is_active: !!c.is_active })
                      }
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                ))}
                {!data.allCategories.length && (
                  <Empty title="Chưa có danh mục">
                    Thêm ngành nghề để nhà tuyển dụng có thể đăng tin.
                  </Empty>
                )}
              </div>
            </>
          )}
          {u?.role === 'admin' && view === 'audit' && (
            <>
              <div className="page-heading">
                <div className="eyebrow">TRUY VẾT THAO TÁC</div>
                <h1>Nhật ký quản trị</h1>
                <p>50 thao tác quản trị gần nhất.</p>
              </div>
              <div className="panel table-panel">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người thực hiện</TableHead>
                      <TableHead>Thao tác</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.audit.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.actor_name}</TableCell>
                        <TableCell>{a.action}</TableCell>
                        <TableCell>{a.reason || '—'}</TableCell>
                        <TableCell>
                          {new Date(a.created_at).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </main>
      )}
      <footer className="container">
        <span>© 2026 TalentHub · Kết nối con người với cơ hội.</span>
        <button className="text-button" onClick={() => open('about')}>
          Thông tin phiên bản
        </button>
      </footer>
      <Sheet
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <SheetContent className="job-sheet" side="right">
          <SheetHeader>
            <SheetTitle>{selected?.title}</SheetTitle>
            <SheetDescription>
              {selected?.company_name} · {selected?.location}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="detail-content">
              <div className="detail-summary">
                <strong>
                  {selected.salary_min}–{selected.salary_max} triệu / tháng
                </strong>
                <Badge status={selected.status} />
                <span>
                  <Clock size={16} /> Hạn nộp: {date(selected.deadline)}
                </span>
                <span>
                  <BriefcaseBusiness size={16} /> {selected.type} ·{' '}
                  {selected.experience}
                </span>
              </div>
              {selected.is_demo === 1 && (
                <p className="sample-note">
                  Tin minh họa của doanh nghiệp giả lập, dùng để thử quy trình.
                </p>
              )}
              {[
                ['Mô tả công việc', 'description'],
                ['Yêu cầu ứng viên', 'requirements'],
                ['Quyền lợi', 'benefits'],
                ['Thông tin doanh nghiệp', 'company_description'],
              ].map(([title, key]) => (
                <section key={key}>
                  <h3>{title}</h3>
                  <p className="preline">
                    {selected[key] || 'Chưa có thông tin.'}
                  </p>
                </section>
              ))}
              {selected.reason && (
                <p className="reason">Lý do kiểm duyệt: {selected.reason}</p>
              )}
              <div className="detail-actions">
                {u?.role === 'admin' ? (
                  <>
                    {selected.status === 'pending' && (
                      <button
                        className="primary"
                        onClick={() =>
                          open('moderate', {
                            id: selected.id,
                            title: selected.title,
                            status: 'active',
                          })
                        }
                      >
                        Phê duyệt tin
                      </button>
                    )}
                    <button
                      className="outline-button"
                      onClick={() =>
                        open('moderate', {
                          id: selected.id,
                          title: selected.title,
                          status:
                            selected.status === 'pending'
                              ? 'rejected'
                              : 'hidden',
                        })
                      }
                    >
                      Từ chối / Ẩn
                    </button>
                  </>
                ) : u?.role === 'employer' ? (
                  <p className="muted">
                    Đăng nhập bằng tài khoản ứng viên để nộp hồ sơ.
                  </p>
                ) : (
                  <>
                    <button
                      className="primary"
                      disabled={
                        selected.status !== 'active' ||
                        data.applications.some(
                          (a: any) => a.job_id === selected.id,
                        )
                      }
                      onClick={() => apply(selected)}
                    >
                      {data.applications.some(
                        (a: any) => a.job_id === selected.id,
                      )
                        ? 'Đã ứng tuyển'
                        : selected.status === 'active'
                          ? 'Ứng tuyển ngay'
                          : 'Tin ngừng nhận hồ sơ'}{' '}
                      <ArrowRight size={17} />
                    </button>
                    <button
                      className="outline-button"
                      disabled={busy || selected.status !== 'active'}
                      onClick={() => save(selected)}
                    >
                      <Bookmark size={18} />
                      {data.saved.includes(selected.id) ? 'Đã lưu' : 'Lưu việc'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!modal}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setModal(null);
            setMessage(null);
          }
        }}
      >
        <DialogContent
          className={
            'app-dialog ' +
            ([
              'job',
              'profile',
              'company',
              'application',
              'applicationDetail',
            ].includes(modal || '')
              ? 'large'
              : '')
          }
        >
          <DialogHeader>
            <DialogTitle>
              {
                (
                  {
                    login: 'Chào mừng bạn trở lại',
                    register: 'Tạo tài khoản TalentHub',
                    setup: 'Khởi tạo quản trị viên',
                    profile: 'Chỉnh sửa hồ sơ',
                    company: 'Hồ sơ doanh nghiệp',
                    upload: 'Tải lên CV',
                    job: form.id
                      ? 'Chỉnh sửa tin tuyển dụng'
                      : 'Đăng tin tuyển dụng',
                    apply: 'Ứng tuyển việc làm',
                    application: 'Xử lý hồ sơ ứng viên',
                    applicationDetail: 'Thông tin ứng tuyển',
                    moderate: 'Kiểm duyệt tin tuyển dụng',
                    category: 'Danh mục nghề nghiệp',
                    companyStatus: 'Trạng thái doanh nghiệp',
                    about: 'Thông tin phiên bản',
                  } as any
                )[modal || '']
              }
            </DialogTitle>
            <DialogDescription>
              {['login', 'register'].includes(modal || '')
                ? 'Một tài khoản cho toàn bộ hành trình nghề nghiệp.'
                : modal === 'setup'
                  ? 'Thiết lập lần đầu trong Site riêng tư của chủ sở hữu.'
                  : form.title || 'Cập nhật thông tin và lưu thay đổi.'}
            </DialogDescription>
          </DialogHeader>
          {message && (
            <div
              className={'feedback ' + (message.error ? 'error' : '')}
              role={message.error ? 'alert' : 'status'}
            >
              {message.text}
            </div>
          )}
          {modal === 'about' ? (
            <div className="preline">
              TalentHub triển khai các nghiệp vụ cốt lõi: hồ sơ và CV PDF, tìm
              việc, lưu việc, ứng tuyển, quản lý doanh nghiệp, duyệt tin, thông
              báo và phân quyền.
              <br />
              <br />
              Đã tích hợp chat, lịch phỏng vấn và hàng đợi email Resend. Gửi
              email thật cần cấu hình dịch vụ. AI matching chưa được tích hợp.
              Các tin mẫu được gắn nhãn minh họa.
            </div>
          ) : modal === 'applicationDetail' ? (
            <div className="form-stack">
              <Badge status={form.status} />
              <p>
                <strong>CV:</strong> {form.resume_title}
              </p>
              <p>
                <strong>Ngày nộp:</strong> {date(form.applied_at)}
              </p>
              <p>
                <strong>Cập nhật:</strong>{' '}
                {new Date(form.updated_at).toLocaleString('vi-VN')}
              </p>
              <h3>Thư giới thiệu</h3>
              <p className="preline">
                {form.cover_letter || 'Không có thư giới thiệu.'}
              </p>
            </div>
          ) : (
            <form className="form-stack" onSubmit={submit}>
              {['login', 'register', 'setup'].includes(modal || '') && (
                <>
                  {modal !== 'login' && (
                    <Field
                      label="Họ và tên"
                      name="name"
                      value={form.name}
                      onChange={set('name')}
                      required
                    />
                  )}
                  {modal === 'register' && (
                    <Field label="Bạn là" name="role">
                      <Pick
                        value={form.role || 'candidate'}
                        onChange={set('role')}
                        options={[
                          { value: 'candidate', label: 'Ứng viên tìm việc' },
                          { value: 'employer', label: 'Nhà tuyển dụng' },
                        ]}
                        label="Loại tài khoản"
                      />
                    </Field>
                  )}
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                  <Field
                    label="Mật khẩu (8–128 ký tự)"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  {modal === 'login' ? (
                    <p className="muted">
                      Chưa có tài khoản?{' '}
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => open('register', { role: 'candidate' })}
                      >
                        Đăng ký ngay
                      </button>
                    </p>
                  ) : modal === 'register' ? (
                    <p className="muted">
                      Đã có tài khoản?{' '}
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => open('login')}
                      >
                        Đăng nhập
                      </button>
                    </p>
                  ) : null}
                </>
              )}
              {modal === 'profile' && (
                <div className="form-grid">
                  <Field
                    label="Họ và tên"
                    name="name"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                  <Field
                    label="Số điện thoại"
                    name="phone"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                  <Field
                    label="Ngày sinh"
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={set('date_of_birth')}
                  />
                  <Field label="Tỉnh / thành phố" name="location">
                    <Pick value={normalizeLocation(form.location || '')} onChange={set('location')} options={locations} empty="Chọn tỉnh / thành phố" label="Tỉnh / thành phố" />
                  </Field>
                  <Field
                    wide
                    label="Tiêu đề nghề nghiệp"
                    name="headline"
                    value={form.headline}
                    onChange={set('headline')}
                  />
                  <Field
                    wide
                    label="Kỹ năng"
                    name="skills"
                    type="textarea"
                    value={form.skills}
                    onChange={set('skills')}
                  />
                  <Field
                    wide
                    label="Kinh nghiệm làm việc"
                    name="experience_summary"
                    type="textarea"
                    value={form.experience_summary}
                    onChange={set('experience_summary')}
                  />
                </div>
              )}
              {modal === 'company' && (
                <>
                  <Field
                    label="Tên doanh nghiệp"
                    name="name"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                  <div className="form-grid">
                    <Field
                      label="Mã số thuế"
                      name="tax_code"
                      value={form.tax_code}
                      onChange={set('tax_code')}
                    />
                    <Field
                      label="Website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={set('website')}
                    />
                  </div>
                  <Field
                    label="Địa chỉ"
                    name="address"
                    value={form.address}
                    onChange={set('address')}
                    required
                  />
                  <Field
                    label="Giới thiệu doanh nghiệp"
                    name="description"
                    type="textarea"
                    value={form.description}
                    onChange={set('description')}
                    required
                  />
                  <p className="muted">
                    Thông tin thay đổi sẽ được gửi lại để quản trị viên xác
                    minh.
                  </p>
                </>
              )}
              {modal === 'upload' && (
                <>
                  <Field
                    label="Tên CV"
                    name="title"
                    value={form.title}
                    onChange={set('title')}
                  />
                  <label className="upload-zone">
                    <Upload size={28} />
                    <strong>Chọn tệp CV từ máy tính</strong>
                    <span>Định dạng PDF · Tối đa 5 MB</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      required
                      onChange={(e) => setUpload(e.target.files?.[0] || null)}
                    />
                    {upload && <span>{upload.name}</span>}
                  </label>
                  <p className="muted">
                    CV chỉ được chia sẻ với nhà tuyển dụng của vị trí bạn ứng
                    tuyển.
                  </p>
                </>
              )}
              {modal === 'job' && (
                <>
                  <Field
                    label="Tên vị trí tuyển dụng"
                    name="title"
                    value={form.title}
                    onChange={set('title')}
                    required
                  />
                  <div className="form-grid">
                    <Field label="Ngành nghề" name="category" required>
                      <Pick
                        value={form.category || ''}
                        onChange={set('category')}
                        options={categoryOptions}
                        empty="Chọn ngành nghề"
                        label="Ngành nghề"
                      />
                    </Field>
                    <Field label="Địa điểm" name="location" required>
                      <Pick
                        value={normalizeLocation(form.location || '')}
                        onChange={set('location')}
                        options={locations}
                        empty="Chọn địa điểm"
                        label="Địa điểm"
                      />
                    </Field>
                    <Field
                      label="Lương từ (triệu đồng)"
                      name="salary_min"
                      type="number"
                      value={form.salary_min}
                      onChange={set('salary_min')}
                      required
                    />
                    <Field
                      label="Lương đến (triệu đồng)"
                      name="salary_max"
                      type="number"
                      value={form.salary_max}
                      onChange={set('salary_max')}
                      required
                    />
                    <Field
                      label="Hạn nộp hồ sơ"
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={set('deadline')}
                      required
                    />
                    <Field label="Kinh nghiệm" name="experience">
                      <Pick
                        value={form.experience || '1–3 năm'}
                        onChange={set('experience')}
                        options={experiences}
                        label="Kinh nghiệm"
                      />
                    </Field>
                    <Field label="Hình thức" name="type">
                      <Pick
                        value={form.type || 'Toàn thời gian'}
                        onChange={set('type')}
                        options={[
                          'Toàn thời gian',
                          'Bán thời gian',
                          'Thực tập',
                          'Hợp đồng',
                        ]}
                        label="Hình thức"
                      />
                    </Field>
                    <Field
                      label="Kỹ năng (phân cách bằng dấu phẩy)"
                      name="tags"
                      value={form.tags}
                      onChange={set('tags')}
                    />
                  </div>
                  {[
                    ['Mô tả công việc', 'description'],
                    ['Yêu cầu ứng viên', 'requirements'],
                    ['Quyền lợi', 'benefits'],
                  ].map(([l, n]) => (
                    <Field
                      key={n}
                      label={l}
                      name={n}
                      type="textarea"
                      value={form[n]}
                      onChange={set(n)}
                      required
                    />
                  ))}
                  <label className="filter-option">
                    <Checkbox
                      checked={!!form.draft}
                      onCheckedChange={(v) => setForm({ ...form, draft: v })}
                    />{' '}
                    Lưu bản nháp, chưa gửi duyệt
                  </label>
                  <p className="muted">
                    Tin mới hoặc tin chỉnh sửa phải được quản trị viên duyệt
                    trước khi công khai.
                  </p>
                </>
              )}
              {modal === 'apply' && (
                <>
                  <Field label="Chọn CV" name="resume_id" required>
                    <Pick
                      value={form.resume_id}
                      onChange={set('resume_id')}
                      options={data.resumes.map((r: any) => ({
                        value: r.id,
                        label: r.title + (r.is_default ? ' (mặc định)' : ''),
                      }))}
                      label="CV ứng tuyển"
                    />
                  </Field>
                  <Field
                    label="Thư giới thiệu (không bắt buộc)"
                    name="cover_letter"
                    type="textarea"
                    value={form.cover_letter}
                    onChange={set('cover_letter')}
                  />
                  <p className="muted">
                    CV đã chọn sẽ được chia sẻ với nhà tuyển dụng của vị trí
                    này.
                  </p>
                </>
              )}
              {modal === 'application' && (
                <>
                  <p>
                    <strong>{form.candidate_name}</strong> ·{' '}
                    {form.candidate_email}
                  </p>
                  <a
                    className="outline-button"
                    href={'/api/resumes/' + form.resume_id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={17} /> Tải CV: {form.resume_title}
                  </a>
                  <h3>Thư giới thiệu</h3>
                  <p className="preline">
                    {form.cover_letter || 'Không có thư giới thiệu.'}
                  </p>
                  <Field label="Trạng thái hồ sơ" name="status">
                    <Pick
                      value={
                        form.status === 'submitted' ? 'viewed' : form.status
                      }
                      onChange={set('status')}
                      options={[
                        'viewed',
                        'shortlisted',
                        'interview',
                        'rejected',
                        'hired',
                      ].map((s) => ({ value: s, label: labels[s] }))}
                      label="Trạng thái hồ sơ"
                    />
                  </Field>
                  <Field
                    label="Ghi chú nội bộ"
                    name="note"
                    type="textarea"
                    value={form.note}
                    onChange={set('note')}
                  />
                  <p className="muted">
                    Ứng viên nhận thông báo khi trạng thái thay đổi. Ghi chú chỉ
                    dành cho nhà tuyển dụng.
                  </p>
                </>
              )}
              {modal === 'moderate' && (
                <>
                  <p>
                    Bạn sắp chuyển tin sang trạng thái{' '}
                    <strong>{labels[form.status]}</strong>.
                  </p>
                  {['rejected', 'hidden'].includes(form.status) && (
                    <Field
                      label="Lý do"
                      name="reason"
                      type="textarea"
                      value={form.reason}
                      onChange={set('reason')}
                      required
                    />
                  )}
                  <p className="muted">
                    Hành động được ghi vào nhật ký quản trị và gửi thông báo cho
                    nhà tuyển dụng.
                  </p>
                </>
              )}
              {modal === 'category' && (
                <>
                  <Field
                    label="Tên ngành nghề"
                    name="name"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                  <label className="filter-option">
                    <Checkbox
                      checked={!!form.is_active}
                      onCheckedChange={(v) =>
                        setForm({ ...form, is_active: v })
                      }
                    />{' '}
                    Đang sử dụng
                  </label>
                </>
              )}
              {modal === 'companyStatus' && (
                <>
                  <Field label="Trạng thái" name="status">
                    <Pick
                      value={form.status}
                      onChange={set('status')}
                      options={['pending', 'verified', 'blocked'].map((s) => ({
                        value: s,
                        label: labels[s],
                      }))}
                      label="Trạng thái doanh nghiệp"
                    />
                  </Field>
                  {form.status === 'blocked' && (
                    <Field
                      label="Lý do khóa"
                      name="reason"
                      type="textarea"
                      value={form.reason}
                      onChange={set('reason')}
                      required
                    />
                  )}
                </>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="outline-button"
                  disabled={busy}
                  onClick={() => setModal(null)}
                >
                  Hủy
                </button>
                <button className="primary" disabled={busy} type="submit">
                  {busy
                    ? 'Đang xử lý…'
                    : modal === 'login'
                      ? 'Đăng nhập'
                      : modal === 'register'
                        ? 'Tạo tài khoản'
                        : modal === 'setup'
                          ? 'Khởi tạo quản trị'
                          : modal === 'apply'
                            ? 'Xác nhận ứng tuyển'
                            : modal === 'job'
                              ? form.draft
                                ? 'Lưu bản nháp'
                                : 'Gửi duyệt'
                              : modal === 'upload'
                                ? 'Tải lên CV'
                                : 'Lưu thay đổi'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirm}
        onOpenChange={(v) => {
          if (!v && !busy) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {message?.error && (
            <p className="feedback error" role="alert">
              {message.text}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel>
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                if (await run(confirm.body)) setConfirm(null);
              }}
            >
              {busy ? 'Đang xử lý…' : 'Xác nhận'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
type uNav = [string, string];
