'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import type { ClaimFramesResponse } from '@/app/api/frames/claim/route';
import { useLanguage } from '@/i18n/LanguageContext';
import { activeFrameIds, FRAMES_GRANTED_EVENT } from '@/utils/frames/catalog';
import { formatMessage } from '@/utils/formatMessage';

const CLAIMED_KEY = 'git-tiers:frames-claimed';

/**
 * 이벤트 기간에 로그인한 상태로 사이트에 들어오면 테두리를 받는다.
 * 같은 탭에서는 한 번만 요청하고, 새로 받았을 때만 알림을 띄운다. 화면에는 아무것도 그리지 않는다.
 * (기간은 서버가 다시 판단한다. 여기서는 이벤트가 없을 때 요청하지 않으려고만 본다.)
 */
export const FrameClaimer = () => {
  const { status } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const active = activeFrameIds(Date.now());
    if (active.length === 0) return;

    const key = `${CLAIMED_KEY}:${active.join(',')}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // 저장소를 못 쓰는 환경이면 그냥 요청한다(서버가 중복 지급을 막는다).
    }

    const claim = async () => {
      try {
        const res = await fetch('/api/frames/claim', { method: 'POST' });
        if (!res.ok) return;
        const { granted } = (await res.json()) as ClaimFramesResponse;
        if (granted.length === 0) return;
        window.dispatchEvent(
          new CustomEvent(FRAMES_GRANTED_EVENT, { detail: granted })
        );
        granted.forEach((id) => {
          toast.success(
            formatMessage(t.frames.granted, { name: t.frames.names[id] }),
            {
              duration: 6000,
            }
          );
        });
      } catch {
        // 받기에 실패해도 다음 방문 때 다시 시도된다.
      }
    };
    void claim();
    // t 는 알림 문구에만 쓰므로 언어가 바뀌어도 다시 요청하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return null;
};
