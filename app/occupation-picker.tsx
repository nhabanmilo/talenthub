'use client';
import { useState } from 'react';
import { occupations, occupationSelection, specialties } from '@/lib/occupations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
export default function OccupationPicker({ value, onChange, categories }: { value: string; onChange: (value: string) => void; categories: string[] }) {
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(value), [query, setQuery] = useState('');
  const [groupId, setGroupId] = useState(''), [roleId, setRoleId] = useState('');
  const groups = occupations.filter(g => categories.includes(g.category));
  const group = groups.find(g => g.id === groupId), role = group?.roles.find(r => r.id === roleId);
  const label = (v: string) => occupationSelection(v)?.label || (categories.includes(v) ? v : 'Tất cả nghề');
  const matches = specialties.filter(s => categories.includes(s.category) && (s.name + ' ' + s.roleName + ' ' + s.category).toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  function launch() {
    const leaf = specialties.find(s => value === '@specialty:' + s.id || value === '@role:' + s.roleId);
    setGroupId(leaf?.groupId || groups.find(g => g.category === value)?.id || groups[0]?.id || '');
    setRoleId(leaf?.roleId || ''); setDraft(value); setQuery(''); setOpen(true);
  }
  const choice = (v: string, text: string) => <button type="button" className={'occupation-choice ' + (draft === v ? 'chosen' : '')} aria-pressed={draft === v} onClick={() => setDraft(v)} key={v}>{text}{draft === v && <span aria-hidden="true">✓</span>}</button>;
  return <>
    <button type="button" className="occupation-trigger" onClick={launch}><span>{label(value)}</span><span aria-hidden="true">⌄</span></button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="occupation-dialog">
        <DialogHeader><DialogTitle>Danh mục nghề</DialogTitle><DialogDescription>Chọn nhóm nghề, nghề hoặc vị trí chuyên môn phù hợp.</DialogDescription></DialogHeader>
        <input aria-label="Tìm nhóm nghề, nghề hoặc chuyên môn" placeholder="Tìm nghề, ví dụ: Frontend, Kế toán, SEO…" value={query} onChange={e => setQuery(e.target.value)} />
        {query.trim() ? <div className="occupation-search-results">
          {matches.length ? matches.map(s => <div key={s.id}>{choice('@specialty:' + s.id, s.name)}<small>{s.category} → {s.roleName}</small></div>) : <p>Không tìm thấy chuyên môn. Thử từ khóa khác.</p>}
        </div> : <div className="occupation-columns">
          <section><h3>1. Nhóm nghề</h3><div className="occupation-options">{groups.map(g => <button type="button" key={g.id} aria-pressed={groupId === g.id} className={'occupation-choice ' + (groupId === g.id ? 'browsing' : '')} onClick={() => { setGroupId(g.id); setRoleId(''); }}>{g.category}<span aria-hidden="true">›</span></button>)}{categories.filter(c => !groups.some(g => g.category === c)).map(c => choice(c,c))}</div></section>
          <section><h3>2. Nghề</h3><div className="occupation-options">{group ? <>{choice(group.category,'Tất cả trong nhóm')}{group.roles.map(r => <button type="button" key={r.id} aria-pressed={roleId === r.id} className={'occupation-choice ' + (roleId === r.id ? 'browsing' : '')} onClick={() => setRoleId(r.id)}>{r.name}<span aria-hidden="true">›</span></button>)}</> : <p>Chọn nhóm nghề bên trái.</p>}</div></section>
          <section><h3>3. Vị trí chuyên môn</h3><div className="occupation-options">{role ? <>{choice('@role:' + role.id,'Tất cả chuyên môn của nghề')}{role.specialties.map(s => choice('@specialty:' + s.id,s.name))}</> : <p>Chọn nghề để xem chuyên môn.</p>}</div></section>
        </div>}
        <div className="occupation-selection">Đang chọn: <strong>{label(draft)}</strong></div>
        <DialogFooter><button type="button" className="text-button" onClick={() => setDraft('')}>Bỏ chọn</button><button type="button" className="outline-button" onClick={() => setOpen(false)}>Hủy</button><button type="button" className="primary" onClick={() => { onChange(draft); setOpen(false); }}>Áp dụng</button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
