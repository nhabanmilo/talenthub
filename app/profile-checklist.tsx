'use client';
export default function ProfileChecklist({ profile, hasResume, onEdit }: { profile: any; hasResume: boolean; onEdit: () => void }) {
  const items = [['Số điện thoại', !!profile?.phone?.trim()], ['Tỉnh / thành phố', !!profile?.location?.trim()], ['Tiêu đề nghề nghiệp', !!profile?.headline?.trim()], ['Kỹ năng', !!profile?.skills?.trim()], ['Kinh nghiệm', !!profile?.experience_summary?.trim()], ['CV đã tải lên', hasResume]] as const;
  const percent = Math.round(items.filter(item => item[1]).length / items.length * 100);
  return <section className="panel profile-checklist">
    <div className="row"><h2>Hoàn thiện hồ sơ</h2><strong>{percent}%</strong></div>
    <progress max={100} value={percent} aria-label="Mức độ đầy đủ thông tin hồ sơ" />
    <p className="muted">Mức độ đầy đủ thông tin, không phải điểm đánh giá năng lực.</p>
    <div className="checklist-items">{items.map(([name, done]) => <span key={name} className={done ? 'complete' : ''}>{done ? '✓' : '○'} {name}</span>)}</div>
    {percent < 100 && <button className="text-button" onClick={onEdit}>Bổ sung thông tin hồ sơ</button>}
  </section>;
}
