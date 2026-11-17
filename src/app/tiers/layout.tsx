import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '티어 표 | Git TIERS',
  description:
    '최근 1년 GitHub 기여 수에 따른 Git TIERS 9개 티어, 36단계 기준표입니다.',
};

export default function TiersLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
