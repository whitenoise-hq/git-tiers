import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '랭킹 | Git TIERS',
  description:
    'Git TIERS 사용자들의 GitHub 기여 티어 랭킹과 티어 분포를 확인하세요.',
};

export default function RankingLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
