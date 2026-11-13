import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | Git TIERS',
  description: 'Git TIERS 가 처리하는 개인정보 항목, 목적, 보유 기간과 파기, 이용자 권리를 안내합니다.',
};

export default function PrivacyLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
