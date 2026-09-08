import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'TalentHub — Tìm việc và tuyển dụng',
  description: 'Tìm việc làm, quản lý CV và theo dõi ứng tuyển.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
