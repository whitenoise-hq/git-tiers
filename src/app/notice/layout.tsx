import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '공지사항 | Git TIERS',
  description: 'Git TIERS 버전별 업데이트와 변경 사항을 확인하세요.',
};

export default function NoticeLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
