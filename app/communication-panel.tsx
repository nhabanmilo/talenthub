'use client';
import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  MessageSquare,
  Send,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Plus,
  Download,
  Mail,
  RefreshCw,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { vi } from 'date-fns/locale';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
async function request(path: string, body?: unknown) {
  const r = await fetch(
    path,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const d: any = await r.json();
  if (!r.ok) throw new Error(d.error || 'Không thể kết nối.');
  return d;
}
function Choice({
  value,
  change,
  items,
  label,
}: {
  value: string;
  change: (v: string) => void;
  items: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => change(v || '')} items={items}>
      <SelectTrigger className="picker" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
const when = (s: string) =>
  new Date(s).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const dayKey = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
const localTime = (s: string) =>
  s
    ? new Date(new Date(s).getTime() + 7 * 3600000).toISOString().slice(0, 16)
    : '';
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <MessageSquare size={30} />
      <div>{children}</div>
    </div>
  );
}
export default function CommunicationPanel({
  view,
  user,
  applications,
  target,
  onChanged,
}: {
  view: string;
  user: any;
  applications: any[];
  target?: { applicationId: string; create?: boolean } | null;
  onChanged: () => void;
}) {
  return view === 'chat' ? (
    <Chat user={user} target={target} />
  ) : view === 'interviews' ? (
    <Interviews
      user={user}
      applications={applications}
      target={target}
      onChanged={onChanged}
    />
  ) : (
    <Email user={user} />
  );
}
function Chat({
  user,
  target,
}: {
  user: any;
  target?: { applicationId: string } | null;
}) {
  const [threads, setThreads] = useState<any[]>([]),
    [active, setActive] = useState(target?.applicationId || ''),
    [messages, setMessages] = useState<any[]>([]),
    [details, setDetails] = useState<any>(null),
    [hasMore, setMore] = useState(false),
    [canWrite, setWrite] = useState(true),
    [drafts, setDrafts] = useState<Record<string, string>>({}),
    [sending, setSending] = useState(false),
    [loading, setLoading] = useState(true),
    [failure, setFailure] = useState(''),
    [filter, setFilter] = useState('');
  const pending = useRef<{
      thread: string;
      body: string;
      client: string;
    } | null>(null),
    scroll = useRef<HTMLDivElement>(null),
    activeRef = useRef(active),
    autoSelected = useRef(false);
  activeRef.current = active;
  async function loadThreads() {
    const d = await request('/api/chat');
    setThreads(d.threads);
    if (!activeRef.current && d.threads.length && !autoSelected.current) {
      autoSelected.current = true;
      setActive(d.threads[0].application_id);
    }
  }
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const d = await request('/api/chat');
        if (!alive) return;
        setThreads(d.threads);
        if (!activeRef.current && d.threads.length && !autoSelected.current) {
          autoSelected.current = true;
          setActive(d.threads[0].application_id);
        }
        setLoading(false);
      } catch (e) {
        if (alive) {
          setFailure((e as Error).message);
          setLoading(false);
        }
      }
    };
    void poll();
    const timer = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (target?.applicationId) setActive(target.applicationId);
  }, [target?.applicationId]);
  useEffect(() => {
    setMessages([]);
    setDetails(null);
    setMore(false);
    setFailure('');
    if (!active) return;
    let alive = true;
    let first = true;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const d = await request(
          '/api/chat?application=' + encodeURIComponent(active),
        );
        if (!alive) return;
        const el = scroll.current;
        const bottom =
          !el || el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setDetails(d.application);
        setWrite(d.canWrite);
        setMessages((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          d.messages.forEach((m: any) => map.set(m.id, m));
          return [...map.values()].sort((a, b) => a.id - b.id);
        });
        if (first) setMore(d.hasMore);
        if (first || bottom)
          requestAnimationFrame(() =>
            scroll.current?.scrollTo({ top: scroll.current.scrollHeight }),
          );
        first = false;
        if (d.messages.length)
          await request('/api/chat', {
            action: 'read',
            application_id: active,
            through: d.messages.at(-1).id,
          });
      } catch (e) {
        if (alive) setFailure((e as Error).message);
      }
    };
    void poll();
    const timer = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [active]);
  async function older() {
    try {
      const d = await request(
        '/api/chat?application=' +
          encodeURIComponent(active) +
          '&before=' +
          messages[0].id,
      );
      const el = scroll.current,
        oldHeight = el?.scrollHeight || 0;
      setMessages((prev) => [...d.messages, ...prev]);
      setMore(d.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - oldHeight;
      });
    } catch (e) {
      setFailure((e as Error).message);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    const text = (drafts[active] || '').trim();
    if (!text || sending) return;
    const thread = active;
    setSending(true);
    setFailure('');
    if (pending.current?.thread !== thread || pending.current.body !== text)
      pending.current = { thread, body: text, client: crypto.randomUUID() };
    try {
      await request('/api/chat', {
        action: 'send',
        application_id: thread,
        body: text,
        client_id: pending.current.client,
      });
      pending.current = null;
      setDrafts((prev) => ({ ...prev, [thread]: '' }));
      if (activeRef.current === thread) {
        const d = await request(
          '/api/chat?application=' + encodeURIComponent(thread),
        );
        setMessages((prev) => {
          const m = new Map(prev.map((x) => [x.id, x]));
          d.messages.forEach((x: any) => m.set(x.id, x));
          return [...m.values()].sort((a, b) => a.id - b.id);
        });
        requestAnimationFrame(() =>
          scroll.current?.scrollTo({ top: scroll.current.scrollHeight }),
        );
      }
      await loadThreads();
    } catch (e) {
      setFailure(
        (e as Error).message + ' Nội dung vẫn được giữ để bạn thử lại.',
      );
    } finally {
      setSending(false);
    }
  }
  const shown = threads.filter((t) =>
    (t.job_title + ' ' + t.company_name + ' ' + t.candidate_name)
      .toLocaleLowerCase('vi')
      .includes(filter.toLocaleLowerCase('vi')),
  );
  return (
    <>
      <div className="page-heading chat-page-heading">
        <div className="eyebrow">TRAO ĐỔI TUYỂN DỤNG</div>
        <h1>Tin nhắn</h1>
        <p>
          Trao đổi trực tiếp với{' '}
          {user.role === 'candidate' ? 'nhà tuyển dụng' : 'ứng viên'} theo từng
          hồ sơ ứng tuyển.
        </p>
      </div>
      {failure && (
        <div className="feedback error" role="alert">
          {failure}
        </div>
      )}
      <div className={'chat-workspace ' + (active ? 'thread-active' : '')}>
        <aside className="thread-list">
          <div className="thread-search">
            <div className="thread-list-heading"><h2>Cuộc trò chuyện</h2><span>{threads.length}</span></div>
            <input
              aria-label="Tìm cuộc trò chuyện"
              placeholder="Tìm người, công ty hoặc vị trí…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          {loading ? (
            <Skeleton className="h-32 m-4" />
          ) : (
            shown.map((t) => (
              <button
                key={t.application_id}
                className={
                  'thread-item ' +
                  (active === t.application_id ? 'selected' : '')
                }
                aria-pressed={active === t.application_id}
                onClick={() => setActive(t.application_id)}
              >
                <div className="thread-avatar">
                  {
                    (user.role === 'employer'
                      ? t.candidate_name
                      : t.company_name)[0]
                  }
                </div>
                <div>
                  <strong>
                    {user.role === 'employer'
                      ? t.candidate_name
                      : t.company_name}
                  </strong>
                  <span>{t.job_title}</span>
                  <p>{t.last_message || 'Bắt đầu cuộc trao đổi'}</p>
                </div>
                {t.unread > 0 && <b className="unread-count">{t.unread}</b>}
              </button>
            ))
          )}
          {!loading && !shown.length && (
            <div className="thread-empty" role="status">
              <MessageSquare size={28} />
              <h3>{filter.trim() ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện'}</h3>
              <p>{filter.trim() ? 'Thử tên người, công ty hoặc vị trí khác.' : user.role === 'candidate' ? 'Sau khi ứng tuyển, bạn có thể trao đổi với nhà tuyển dụng tại đây.' : 'Cuộc trò chuyện sẽ xuất hiện khi có ứng viên nộp hồ sơ.'}</p>
              {filter.trim() ? <button className="text-button" onClick={() => setFilter('')}>Xóa tìm kiếm</button> : user.role === 'candidate' ? <a className="outline-button" href="/?view=jobs">Khám phá việc làm</a> : null}
            </div>
          )}
        </aside>
        <section className="chat-main">
          {active ? (
            <>
              <div className="chat-heading">
                <button
                  className="chat-back"
                  aria-label="Danh sách trò chuyện"
                  onClick={() => setActive('')}
                >
                  <ChevronLeft />
                </button>
                <div>
                  <h2>
                    {user.role === 'employer'
                      ? details?.candidate_name
                      : details?.company_name}
                  </h2>
                  <p>{details?.job_title || 'Đang tải cuộc trao đổi…'}</p>
                </div>
                <span className="muted">Riêng tư</span>
              </div>
              <div
                className="message-scroll"
                ref={scroll}
                aria-label="Nội dung cuộc trò chuyện"
                aria-live="polite"
              >
                {hasMore && (
                  <button
                    className="text-button older-messages"
                    onClick={older}
                  >
                    Tải tin nhắn trước
                  </button>
                )}
                {messages.map((m) => (
                  <div
                    className={
                      'message-row ' + (m.sender_id === user.id ? 'mine' : '')
                    }
                    key={m.id}
                  >
                    <div className="chat-bubble">
                      <p>{m.body}</p>
                      <span>
                        {when(m.created_at)}
                        {m.sender_id === user.id && (
                          <>
                            <CheckCheck size={13} />
                            {m.read_at ? 'Đã đọc' : 'Đã gửi'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                {details && !messages.length && (
                  <Empty>
                    Chưa có tin nhắn. Gửi lời chào để bắt đầu trao đổi.
                  </Empty>
                )}
              </div>
              <form className="message-composer" onSubmit={send}>
                <textarea
                  aria-label="Nội dung tin nhắn"
                  placeholder={
                    canWrite ? 'Nhập tin nhắn…' : 'Cuộc trao đổi đang tạm khóa'
                  }
                  maxLength={4000}
                  value={drafts[active] || ''}
                  disabled={!canWrite || sending}
                  onChange={(e) =>
                    setDrafts({ ...drafts, [active]: e.target.value })
                  }
                />
                <button
                  className="primary"
                  type="submit"
                  disabled={
                    !canWrite || sending || !(drafts[active] || '').trim()
                  }
                >
                  <Send size={18} />
                  {sending ? 'Đang gửi' : 'Gửi'}
                </button>
              </form>
              <p className="chat-footnote">
                Tin nhắn tự động cập nhật. Nội dung chỉ hiển thị cho hai bên
                liên quan.
              </p>
            </>
          ) : (
            <div className="chat-welcome">
              <span className="chat-welcome-icon"><MessageSquare size={32} /></span>
              <h2>Kết nối cho cơ hội tiếp theo</h2>
              <p>Chọn một cuộc trò chuyện bên trái để xem tin nhắn và trao đổi về vị trí ứng tuyển.</p>
              <span className="chat-privacy-note">Nội dung chỉ hiển thị cho bạn và bên tuyển dụng liên quan.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function Interviews({
  user,
  applications,
  target,
  onChanged,
}: {
  user: any;
  applications: any[];
  target?: { applicationId: string; create?: boolean } | null;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState('upcoming'),
    [selectedDay, setDay] = useState<Date | undefined>(),
    [dialog, setDialog] = useState(''),
    [form, setForm] = useState<any>({});
  const consumed = useRef('');
  async function refresh() {
    try {
      const d = await request('/api/interviews');
      setItems(d.interviews);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  useEffect(() => {
    if (
      target?.create &&
      target.applicationId &&
      consumed.current !== target.applicationId
    ) {
      consumed.current = target.applicationId;
      edit(null, target.applicationId);
    }
  }, [target?.applicationId]);
  function edit(i: any, aid = '') {
    setError('');
    setNotice('');
    setForm(
      i
        ? { ...i, start: localTime(i.starts_at), end: localTime(i.ends_at) }
        : {
            application_id: aid || applications[0]?.id || '',
            title: 'Phỏng vấn chuyên môn',
            mode: 'online',
            location: '',
            notes: '',
            start: '',
            end: '',
          },
    );
    setDialog('save');
  }
  function action(type: string, i: any) {
    setError('');
    setNotice('');
    setForm({
      ...i,
      note: '',
      reason: '',
      response: type === 'accept' ? 'accepted' : 'declined',
    });
    setDialog(type);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const b: any = {
        ...form,
        action: ['accept', 'decline'].includes(dialog) ? 'respond' : dialog,
      };
      if (dialog === 'save') {
        if (!form.start || !form.end)
          throw new Error('Vui lòng nhập thời gian bắt đầu và kết thúc.');
        b.starts_at = new Date(form.start + ':00+07:00').toISOString();
        b.ends_at = new Date(form.end + ':00+07:00').toISOString();
      }
      await request('/api/interviews', b);
      setDialog('');
      setNotice(
        'Đã cập nhật lịch phỏng vấn và tạo thông báo cho bên liên quan.',
      );
      await refresh();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  const shown = items
    .filter(
      (i) =>
        (!selectedDay ||
          dayKey(new Date(i.starts_at)) === dayKey(selectedDay)) &&
        (filter === 'all' ||
          (filter === 'cancelled' && i.status === 'cancelled') ||
          (filter === 'upcoming' &&
            i.status === 'scheduled' &&
            Date.parse(i.ends_at) >= Date.now()) ||
          (filter === 'past' &&
            (i.status === 'completed' ||
              (i.status === 'scheduled' &&
                Date.parse(i.ends_at) < Date.now())))),
    )
    .sort((a, b) =>
      filter === 'past'
        ? b.starts_at.localeCompare(a.starts_at)
        : a.starts_at.localeCompare(b.starts_at),
    );
  const dates = items
    .filter((i) => i.status === 'scheduled')
    .map((i) => new Date(i.starts_at));
  const set = (key: string) => (value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <>
      <div className="page-heading row">
        <div>
          <div className="eyebrow">HẸN GẶP CHO CƠ HỘI MỚI</div>
          <h1>Lịch phỏng vấn</h1>
          <p>Tất cả thời gian hiển thị theo giờ Việt Nam (UTC+7).</p>
        </div>
        {user.role === 'employer' && (
          <button
            className="primary"
            onClick={() => edit(null)}
            disabled={!applications.length}
          >
            <Plus size={18} /> Tạo lịch phỏng vấn
          </button>
        )}
      </div>
      {!dialog && error && (
        <div className="feedback error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="feedback" role="status">
          {notice}
        </div>
      )}
      <div className="interview-layout">
        <aside className="panel schedule-calendar">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setDay}
            locale={vi}
            timeZone="Asia/Ho_Chi_Minh"
            modifiers={{ interview: dates }}
            modifiersClassNames={{ interview: 'has-interview' }}
          />
          <button className="text-button" onClick={() => setDay(undefined)}>
            Xem tất cả ngày
          </button>
          <p className="muted">Ngày được đánh dấu có lịch phỏng vấn.</p>
        </aside>
        <section>
          <div className="toolbar row">
            <h2>
              {selectedDay ? 'Ngày ' + dayKey(selectedDay) : 'Lịch của bạn'}{' '}
              <span className="muted">({shown.length})</span>
            </h2>
            <Choice
              value={filter}
              change={setFilter}
              label="Lọc lịch phỏng vấn"
              items={[
                { value: 'upcoming', label: 'Sắp tới' },
                { value: 'past', label: 'Đã qua' },
                { value: 'cancelled', label: 'Đã hủy' },
                { value: 'all', label: 'Tất cả' },
              ]}
            />
            <button
              className="icon-button"
              aria-label="Tải lại lịch"
              onClick={refresh}
            >
              <RefreshCw size={17} />
            </button>
          </div>
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            shown.map((i) => (
              <article className="panel interview-card" key={i.id}>
                <div className="row">
                  <div className="interview-date">
                    <CalendarDays size={21} />
                    {new Date(i.starts_at).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                  <span
                    className={
                      'badge ' +
                      (i.status === 'cancelled'
                        ? 'rejected'
                        : i.status === 'completed'
                          ? 'verified'
                          : 'pending')
                    }
                  >
                    {i.status === 'cancelled'
                      ? 'Đã hủy'
                      : i.status === 'completed'
                        ? 'Hoàn thành'
                        : i.candidate_response === 'accepted'
                          ? 'Đã xác nhận'
                          : i.candidate_response === 'declined'
                            ? 'Ứng viên từ chối'
                            : 'Chờ xác nhận'}
                  </span>
                </div>
                <h2>{i.title}</h2>
                <p>
                  {user.role === 'employer' ? i.candidate_name : i.company_name}{' '}
                  · {i.job_title}
                </p>
                <div className="interview-detail">
                  <span>
                    <Clock size={16} />
                    {when(i.starts_at)} –{' '}
                    {new Date(i.ends_at).toLocaleTimeString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>
                    {i.mode === 'online' ? (
                      <Video size={16} />
                    ) : (
                      <MapPin size={16} />
                    )}{' '}
                    {i.mode === 'online' ? (
                      <a
                        href={i.location}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Mở phòng họp ↗
                      </a>
                    ) : (
                      i.location
                    )}
                  </span>
                </div>
                {i.notes && <p className="preline">{i.notes}</p>}
                {i.response_note && (
                  <p className="reason">Ứng viên: {i.response_note}</p>
                )}
                {i.cancel_reason && (
                  <p className="reason">Lý do hủy: {i.cancel_reason}</p>
                )}
                <div className="interview-actions">
                  <a
                    className="outline-button"
                    href={'/api/interviews/' + i.id + '/calendar'}
                  >
                    <Download size={15} /> Tải lịch .ics
                  </a>
                  {i.status === 'scheduled' &&
                    (user.role === 'employer' ? (
                      <>
                        <button className="text-button" onClick={() => edit(i)}>
                          Đổi lịch
                        </button>
                        <button
                          className="text-button"
                          onClick={() => action('cancel', i)}
                        >
                          Hủy lịch
                        </button>
                        {Date.parse(i.ends_at) <= Date.now() && (
                          <button
                            className="text-button"
                            onClick={() => action('complete', i)}
                          >
                            Hoàn thành
                          </button>
                        )}
                      </>
                    ) : Date.parse(i.starts_at) > Date.now() ? (
                      <>
                        <button
                          className="primary"
                          onClick={() => action('accept', i)}
                          disabled={i.candidate_response === 'accepted'}
                        >
                          Xác nhận tham gia
                        </button>
                        <button
                          className="text-button"
                          onClick={() => action('decline', i)}
                        >
                          Từ chối / đề nghị đổi
                        </button>
                      </>
                    ) : null)}
                </div>
              </article>
            ))
          )}
          {!loading && !shown.length && (
            <Empty>
              Chưa có lịch phù hợp.{' '}
              {user.role === 'employer'
                ? 'Chọn hồ sơ ứng tuyển để đặt lịch.'
                : 'Nhà tuyển dụng có thể gửi lời mời sau khi xem hồ sơ.'}
            </Empty>
          )}
        </section>
      </div>
      <Dialog
        open={!!dialog}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setDialog('');
            setError('');
          }
        }}
      >
        <DialogContent className="app-dialog large">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'save'
                ? form.id
                  ? 'Đổi lịch phỏng vấn'
                  : 'Tạo lịch phỏng vấn'
                : dialog === 'cancel'
                  ? 'Hủy lịch phỏng vấn'
                  : dialog === 'complete'
                    ? 'Hoàn thành phỏng vấn'
                    : dialog === 'accept'
                      ? 'Xác nhận tham gia'
                      : 'Phản hồi lời mời'}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'save'
                ? 'Thời gian theo giờ Việt Nam (UTC+7). Hệ thống sẽ kiểm tra trùng lịch của cả hai bên.'
                : form.title}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="feedback error" role="alert">
              {error}
            </div>
          )}
          <form className="form-stack" onSubmit={submit}>
            {dialog === 'save' ? (
              <>
                {!form.id && (
                  <label className="field">
                    <span>Hồ sơ ứng tuyển *</span>
                    <Choice
                      value={form.application_id}
                      change={set('application_id')}
                      label="Hồ sơ ứng tuyển"
                      items={applications.map((a) => ({
                        value: a.id,
                        label: a.candidate_name + ' · ' + a.title,
                      }))}
                    />
                  </label>
                )}
                <label className="field">
                  <span>Tiêu đề *</span>
                  <input
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(e) => set('title')(e.target.value)}
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Bắt đầu *</span>
                    <input
                      type="datetime-local"
                      required
                      value={form.start}
                      onChange={(e) => set('start')(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Kết thúc *</span>
                    <input
                      type="datetime-local"
                      required
                      value={form.end}
                      onChange={(e) => set('end')(e.target.value)}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Hình thức</span>
                  <Choice
                    value={form.mode}
                    change={set('mode')}
                    label="Hình thức phỏng vấn"
                    items={[
                      { value: 'online', label: 'Trực tuyến' },
                      { value: 'onsite', label: 'Tại văn phòng' },
                    ]}
                  />
                </label>
                <label className="field">
                  <span>
                    {form.mode === 'online'
                      ? 'Liên kết họp HTTPS'
                      : 'Địa chỉ gặp mặt'}{' '}
                    *
                  </span>
                  <input
                    required
                    maxLength={1000}
                    type={form.mode === 'online' ? 'url' : 'text'}
                    value={form.location}
                    onChange={(e) => set('location')(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Nội dung cần chuẩn bị</span>
                  <textarea
                    maxLength={3000}
                    value={form.notes}
                    onChange={(e) => set('notes')(e.target.value)}
                  />
                </label>
                {form.id && (
                  <p className="muted">
                    Đổi lịch sẽ yêu cầu ứng viên xác nhận lại.
                  </p>
                )}
              </>
            ) : dialog === 'cancel' ? (
              <label className="field">
                <span>Lý do hủy *</span>
                <textarea
                  required
                  maxLength={1500}
                  value={form.reason}
                  onChange={(e) => set('reason')(e.target.value)}
                />
              </label>
            ) : dialog === 'complete' ? (
              <p>Xác nhận buổi phỏng vấn đã kết thúc.</p>
            ) : (
              <>
                <p>
                  {dialog === 'accept'
                    ? 'Xác nhận bạn sẽ tham gia đúng lịch hẹn.'
                    : 'Cho nhà tuyển dụng biết lý do hoặc khung giờ thay thế.'}
                </p>
                <label className="field">
                  <span>
                    Lời nhắn {dialog === 'decline' ? '*' : '(không bắt buộc)'}
                  </span>
                  <textarea
                    required={dialog === 'decline'}
                    maxLength={1500}
                    value={form.note}
                    onChange={(e) => set('note')(e.target.value)}
                  />
                </label>
              </>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setDialog('')}
                disabled={busy}
              >
                Hủy thao tác
              </button>
              <button className="primary" type="submit" disabled={busy}>
                {busy
                  ? 'Đang lưu…'
                  : dialog === 'save'
                    ? 'Gửi lịch phỏng vấn'
                    : 'Xác nhận'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Email({ user }: { user: any }) {
  const [data, setData] = useState<any>({
      rows: [],
      configured: false,
      enabled: true,
    }),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  async function load() {
    try {
      setData(await request('/api/email'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function act(b: any) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await request('/api/email', b);
      await load();
      setNotice(
        b.action === 'preference'
          ? 'Đã cập nhật tùy chọn nhận email.'
          : `Đã xử lý ${result.processed || 0} email. Xem trạng thái trong danh sách.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const names: any = {
    pending: data.configured ? 'Chờ gửi' : 'Chờ cấu hình',
    sending: 'Đang gửi',
    sent: 'Resend đã tiếp nhận',
    failed: 'Gửi lỗi',
    skipped: 'Không gửi',
    review: 'Cần kiểm tra',
  };
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">CẬP NHẬT QUA HỘP THƯ</div>
        <h1>Email thông báo</h1>
        <p>Nhận thông báo về tuyển dụng, tin nhắn mới và lịch phỏng vấn.</p>
      </div>
      {error && (
        <div className="feedback error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="feedback" role="status">
          {notice}
        </div>
      )}
      <section className="panel email-settings">
        <div className="row">
          <Mail size={27} />
          <div>
            <h2>Gửi thông báo đến {user.email}</h2>
            <p className="muted">Tắt email vẫn giữ thông báo trong website.</p>
          </div>
          <Switch
            checked={data.enabled}
            onCheckedChange={(enabled) =>
              act({ action: 'preference', enabled })
            }
            disabled={busy || loading}
            aria-label="Nhận email thông báo"
          />
        </div>
        <p className="email-service">
          <span
            className={'badge ' + (data.configured ? 'verified' : 'pending')}
          >
            {data.configured ? 'Resend đã cấu hình' : 'Chờ kết nối Resend'}
          </span>
          {!data.configured &&
            ' Email chưa được gửi ra ngoài. Các sự kiện mới được lưu trong hàng đợi.'}
        </p>
        {user.role === 'admin' && !data.configured && (
          <div className="mail-setup">
            <h3>Cấu hình gửi email</h3>
            <ol>
              <li>
                Tạo API key gửi email trên Resend và xác minh tên miền của bạn.
              </li>
              <li>
                Đặt <code>RESEND_API_KEY</code> dưới dạng secret và{' '}
                <code>EMAIL_FROM</code> là địa chỉ gửi đã xác minh trong cấu
                hình môi trường của Sites.
              </li>
              <li>
                Triển khai lại cấu hình, sau đó dùng nút gửi email kiểm tra.
              </li>
            </ol>
            <p>
              Ví dụ địa chỉ gửi: TalentHub &lt;tuyendung@tenmiencuaban.vn&gt;.
              Không lưu API key trong mã nguồn.
            </p>
          </div>
        )}
        {user.role === 'admin' && (
          <div className="interview-actions">
            <button
              className="primary"
              disabled={busy || !data.configured}
              onClick={() => act({ action: 'process' })}
            >
              <RefreshCw size={16} /> Xử lý hàng đợi
            </button>
            <button
              className="outline-button"
              disabled={busy || !data.configured || !data.enabled}
              onClick={() => act({ action: 'test' })}
            >
              Gửi kiểm tra đến email của tôi
            </button>
          </div>
        )}
      </section>
      <section className="panel table-panel mail-log">
        <div className="panel-heading">
          <h2>Lịch sử gửi email</h2>
          <p className="muted">
            “Resend đã tiếp nhận” xác nhận dịch vụ nhận yêu cầu, chưa xác nhận
            thư đã đến hộp thư người nhận.
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-32" />
        ) : data.rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {user.role === 'admin' ? 'Người nhận' : 'Nội dung'}
                </TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Kết quả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {user.role === 'admin' ? r.recipient : r.subject}
                  </TableCell>
                  <TableCell>{when(r.created_at)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        'badge ' +
                        (r.status === 'sent'
                          ? 'verified'
                          : r.status === 'failed'
                            ? 'rejected'
                            : 'pending')
                      }
                    >
                      {names[r.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="muted">
                      {r.last_error || (r.attempts || 0) + ' lần thử'}
                    </p>
                    {user.role === 'admin' && r.status === 'failed' && (
                      <button
                        className="text-button"
                        disabled={busy || !data.configured}
                        onClick={() => act({ action: 'retry', id: r.id })}
                      >
                        Thử lại
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            Chưa có email được tạo từ khi bật chức năng thông báo email.
          </Empty>
        )}
      </section>
    </>
  );
}
