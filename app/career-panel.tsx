'use client';
import { useEffect, useState } from 'react';
import {
  cvFields,
  CVContent,
  CareerData,
  CareerDocument,
  CareerPreferences,
  CareerJob,
} from '@/lib/career';
import { locations } from '@/lib/locations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const templateNames = {
  professional: 'Chuyên nghiệp',
  modern: 'Hiện đại',
  minimal: 'Tối giản',
};
function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value || '_all'}
      onValueChange={(v) => onChange(!v || v === '_all' ? '' : v)}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue>
          {options.find((o) => o.value === value)?.label || 'Không giới hạn'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value || '_all'} value={o.value || '_all'}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
async function request(body?: unknown) {
  const r = await fetch('/api/career', {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = (await r.json()) as CareerData & {
    error?: string;
    id?: string;
    updated_at?: string;
  };
  if (!r.ok) throw new Error(d.error || 'Không thể tải dữ liệu.');
  return d;
}
export function CVPreview({ content: c }: { content: CVContent }) {
  return (
    <article className={'cv-paper cv-' + c.template}>
      <header>
        <h1>{c.name || 'Họ và tên'}</h1>
        <p className="cv-headline">{c.headline || 'Vị trí mong muốn'}</p>
        <p className="cv-contact">
          {[c.email, c.phone, c.location].filter(Boolean).join(' • ')}
        </p>
      </header>
      {(
        ['summary', 'experience', 'education', 'skills', 'projects'] as const
      ).map(
        (k) =>
          c[k] && (
            <section key={k}>
              <h2>{cvFields[k]}</h2>
              <p>{c[k]}</p>
            </section>
          ),
      )}
    </article>
  );
}
export default function CareerPanel({
  view,
  user,
  profile,
  categories,
  onJob,
}: {
  view: string;
  user: { name: string; email: string };
  profile: Record<string, string> | null;
  categories: { name: string }[];
  onJob: (j: CareerJob) => void;
}) {
  const [data, setData] = useState<CareerData>({
    documents: [],
    preferences: {},
    recommendations: [],
  });
  const [draft, setDraft] = useState<CareerDocument | null>(null),
    [prefs, setPrefs] = useState<CareerPreferences>({});
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false);
  async function load() {
    const d = await request();
    setData(d);
    setPrefs(d.preferences);
    setLoaded(true);
  }
  useEffect(() => {
    let alive = true;
    request()
      .then((d) => {
        if (alive) {
          setData(d);
          setPrefs(d.preferences);
          setLoaded(true);
        }
      })
      .catch((e) => {
        if (alive) setMessage(e.message);
      });
    return () => {
      alive = false;
    };
  }, []);
  async function act(body: unknown) {
    setBusy(true);
    setMessage('');
    try {
      const r = await request(body);
      await load();
      setMessage('Đã lưu thay đổi.');
      return r;
    } catch (e) {
      setMessage((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  function newCV() {
    setDraft({
      title: 'CV của ' + user.name,
      content: {
        template: 'professional',
        name: user.name,
        email: user.email,
        phone: profile?.phone || '',
        location: profile?.location || '',
        headline: profile?.headline || '',
        summary: profile?.summary || '',
        experience: profile?.experience || '',
        education: profile?.education || '',
        skills: profile?.skills || '',
        projects: '',
      },
    });
  }
  return (
    <div className="career-panel">
      <div className="page-heading">
        
        <h1>
          {view === 'cv-builder'
            ? 'Tạo và quản lý CV'
            : 'Việc làm dành cho bạn'}
        </h1>
        <p>
          {view === 'cv-builder'
            ? 'Chọn mẫu, biên tập và lưu PDF để ứng tuyển.'
            : 'Gợi ý từ tin đã duyệt, dựa trên mong muốn bạn cung cấp.'}
        </p>
      </div>
      {message && <output className="panel">{message}</output>}
      {!loaded && !message && <p>Đang tải…</p>}
      {view === 'cv-builder' && (
        <>
          <div className="career-document-list">
            <button
              className="primary"
              onClick={newCV}
              disabled={busy || !loaded}
            >
              + Tạo CV mới
            </button>
            {data.documents.map((d) => (
              <button
                key={d.id}
                className="outline-button"
                disabled={busy}
                onClick={() => {
                  if (
                    !draft ||
                    window.confirm('Mở CV khác? Nội dung chưa lưu sẽ bị bỏ.')
                  )
                    setDraft(d);
                }}
              >
                {d.title}
              </button>
            ))}
          </div>
          {draft ? (
            <div className="cv-editor-layout">
              <section className="panel form-stack">
                <label>
                  Tên bản CV
                  <input
                    value={draft.title}
                    maxLength={150}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </label>
                <div className="career-field">
                  Mẫu thiết kế
                  <Choice
                    label="Mẫu CV"
                    value={draft.content.template}
                    options={Object.entries(templateNames).map(
                      ([value, label]) => ({ value, label }),
                    )}
                    onChange={(template) =>
                      setDraft({
                        ...draft,
                        content: {
                          ...draft.content,
                          template: template as CVContent['template'],
                        },
                      })
                    }
                  />
                </div>
                {(
                  Object.entries(cvFields) as [keyof typeof cvFields, string][]
                ).map(([k, label]) => (
                  <label key={k}>
                    {label}
                    {[
                      'summary',
                      'experience',
                      'education',
                      'skills',
                      'projects',
                    ].includes(k) ? (
                      <textarea
                        rows={4}
                        maxLength={6000}
                        value={draft.content[k]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            content: { ...draft.content, [k]: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <input
                        maxLength={200}
                        value={draft.content[k]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            content: { ...draft.content, [k]: e.target.value },
                          })
                        }
                      />
                    )}
                  </label>
                ))}
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    const r = await act({ ...draft, action: 'save' });
                    if (r) setDraft({ ...draft, ...r });
                  }}
                >
                  Lưu CV
                </button>
                {draft.id && (
                  <>
                    <a
                      className="outline-button"
                      href={'/cv/' + draft.id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mở bản đã lưu · In / lưu PDF
                    </a>
                    <p className="muted">
                      Lưu nội dung trước khi in. Sau khi lưu PDF, tải lên tại Hồ
                      sơ & CV để dùng khi ứng tuyển.
                    </p>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={async () => {
                        if (window.confirm('Xóa bản CV này?')) {
                          const r = await act({
                            action: 'delete',
                            id: draft.id,
                          });
                          if (r) setDraft(null);
                        }
                      }}
                    >
                      Xóa bản CV
                    </button>
                  </>
                )}
              </section>
              <div className="cv-preview-wrap">
                <CVPreview content={draft.content} />
              </div>
            </div>
          ) : (
            loaded && (
              <section className="panel">
                <h2>Ba mẫu, một hồ sơ của riêng bạn</h2>
                <p>
                  Chuyên nghiệp có điểm nhấn xanh; Hiện đại có khung thông tin
                  nổi bật; Tối giản phù hợp hồ sơ ít trang trí. Bạn có thể lưu
                  tối đa 20 bản CV.
                </p>
              </section>
            )
          )}
        </>
      )}
      {view === 'recommendations' && (
        <>
          <form
            className="panel career-preferences"
            onSubmit={async (e) => {
              e.preventDefault();
              await act({ ...prefs, action: 'preferences' });
            }}
          >
            <div className="career-field">
              Ngành nghề
              <Choice
                label="Ngành mong muốn"
                value={prefs.category || ''}
                options={[
                  { value: '', label: 'Không giới hạn' },
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                ]}
                onChange={(category) => setPrefs({ ...prefs, category })}
              />
            </div>
            <div className="career-field">
              Địa điểm
              <Choice
                label="Địa điểm mong muốn"
                value={prefs.location || ''}
                options={[
                  { value: '', label: 'Không giới hạn' },
                  ...locations.map((l) => ({ value: l, label: l })),
                ]}
                onChange={(location) => setPrefs({ ...prefs, location })}
              />
            </div>
            <label>
              Lương tối thiểu (triệu/tháng)
              <input
                type="number"
                min="0"
                max="1000"
                step="0.5"
                value={prefs.salary_min || 0}
                onChange={(e) =>
                  setPrefs({ ...prefs, salary_min: e.target.value })
                }
              />
            </label>
            <div className="career-field">
              Kinh nghiệm
              <Choice
                label="Kinh nghiệm"
                value={prefs.experience || ''}
                options={[
                  '',
                  'Chưa có kinh nghiệm',
                  'Dưới 1 năm',
                  '1–3 năm',
                  '3–5 năm',
                  'Trên 5 năm',
                ].map((value) => ({ value, label: value || 'Không giới hạn' }))}
                onChange={(experience) => setPrefs({ ...prefs, experience })}
              />
            </div>
            <label className="career-wide">
              Kỹ năng (phân cách bằng dấu phẩy)
              <input
                maxLength={2000}
                value={prefs.skills || ''}
                onChange={(e) => setPrefs({ ...prefs, skills: e.target.value })}
                placeholder="Ví dụ: Excel, kế toán, giao tiếp"
              />
            </label>
            <button className="primary" disabled={busy || !loaded}>
              Lưu mong muốn & xem gợi ý
            </button>
          </form>
          <p className="muted">
            Gợi ý theo quy tắc khớp hồ sơ; không phải đánh giá năng lực. Các tin
            bạn đã ứng tuyển được loại khỏi danh sách.
          </p>
          <div className="career-recommendations">
            {data.recommendations.map((j) => (
              <button
                key={j.id}
                className="panel career-job"
                onClick={() => onJob(j)}
              >
                <h3>{j.title}</h3>
                <p>
                  {j.company_name} · {j.location}
                </p>
                <p>
                  {j.salary_min}–{j.salary_max} triệu/tháng
                </p>
                <div>
                  {j.reasons.map((r: string) => (
                    <span key={r}>{r}</span>
                  ))}
                </div>
                <strong>Xem chi tiết →</strong>
              </button>
            ))}
          </div>
          {loaded && !data.recommendations.length && (
            <section className="panel">
              <h3>Chưa có tin phù hợp</h3>
              <p>
                Hãy bổ sung mong muốn. Gợi ý sẽ xuất hiện khi có tin thật đã
                duyệt phù hợp với hồ sơ của bạn.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
