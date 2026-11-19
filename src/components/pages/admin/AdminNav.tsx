'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';

import { Color } from '@/styles/color';

const TABS = [
  { href: '/admin/stats', label: '통계' },
  { href: '/admin/users', label: '사용자' },
] as const;

/** 관리자 페이지 탭 */
export const AdminNav = () => {
  const pathname = usePathname();
  return (
    <S.Nav aria-label="Admin">
      {TABS.map((tab) => (
        <S.Tab
          key={tab.href}
          href={tab.href}
          data-active={pathname === tab.href}>
          {tab.label}
        </S.Tab>
      ))}
    </S.Nav>
  );
};

const S = {
  Nav: styled.nav`
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    margin-bottom: 24px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
  `,

  Tab: styled(Link)`
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-decoration: none;
    border-radius: 9px;
    transition:
      color 0.2s ease,
      background 0.2s ease;

    &:hover {
      color: ${Color.TextLight};
    }

    &[data-active='true'] {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.12);
    }
  `,
};
