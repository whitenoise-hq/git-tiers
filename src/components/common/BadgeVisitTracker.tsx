'use client';

import { useEffect } from 'react';
import { BADGE_REF } from '@/utils/badgeTag';

const SEEN_KEY = 'git-tiers:badge-visit';

/**
 * README 배지를 눌러(?ref=badge) 들어온 방문을 한 번 기록한다.
 * 같은 탭에서 새로고침해도 다시 세지 않는다. 화면에는 아무것도 그리지 않는다.
 */
export const BadgeVisitTracker = () => {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('ref') !== BADGE_REF)
      return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // 저장소를 못 쓰는 환경이면 그냥 한 번 보낸다.
    }
    void fetch('/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: BADGE_REF }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
};
