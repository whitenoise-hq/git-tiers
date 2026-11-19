import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관리자 | Git TIERS',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
