'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import type { CareerDocument, CareerData } from '@/lib/career';
import { CVPreview } from '@/app/career-panel';
export default function CVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params),
    [document, setDocument] = useState<CareerDocument | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    fetch('/api/career')
      .then(async (r) => {
        const d = (await r.json()) as CareerData & { error?: string };
        if (!r.ok) throw new Error(d.error);
        const cv = d.documents.find((v) => v.id === id);
        if (!cv)
          throw new Error('Không tìm thấy CV hoặc bạn không có quyền xem.');
        if (alive) setDocument(cv);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [id]);
  return (
    <main className="cv-print-page">
      <div className="cv-print-toolbar">
        <Link href="/?view=cv-builder">← Quay lại trình tạo CV</Link>
        {document && (
          <button className="primary" onClick={() => window.print()}>
            In / lưu PDF
          </button>
        )}
        <p>
          Trong cửa sổ in, chọn “Lưu dưới dạng PDF”, giấy A4 và tắt đầu
          trang/chân trang của trình duyệt.
        </p>
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : document ? (
        <CVPreview content={document.content} />
      ) : (
        <p>Đang tải CV…</p>
      )}
    </main>
  );
}
