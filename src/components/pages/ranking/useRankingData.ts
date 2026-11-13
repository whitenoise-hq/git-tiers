'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import type { RankingResponse } from '@/app/api/ranking/route';
import type { MyRankResponse } from '@/app/api/ranking/me/route';
import type { MyRank } from '@/utils/ranking';
import {
  DEV_PREVIEW_PARAM,
  isDevPreviewEnabled,
  parsePreviewLogin,
} from '@/utils/devPreview';

export type MyRankState =
  | { readonly status: 'guest' }
  | {
      readonly status: 'unranked';
      readonly refreshAvailableAt: number;
    }
  | {
      readonly status: 'ranked';
      readonly me: MyRank;
      readonly refreshAvailableAt: number;
    };

export type RankingDataState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'ready';
      readonly ranking: RankingResponse;
      readonly my: MyRankState;
    };

/** preview: 개발 미리보기라 실제로 갱신하지 않음 */
export type RefreshResult = 'refreshed' | 'cooldown' | 'failed' | 'preview';

const toReadyState = (body: MyRankResponse): RankingDataState => ({
  status: 'ready',
  ranking: {
    podium: body.podium,
    distribution: body.distribution,
  },
  my: body.me
    ? {
        status: 'ranked',
        me: body.me,
        refreshAvailableAt: body.refreshAvailableAt,
      }
    : { status: 'unranked', refreshAvailableAt: body.refreshAvailableAt },
});

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${url} ${res.status}`);
  return res.json() as Promise<T>;
};

/**
 * 랭킹 데이터.
 * - 로그인 안 함: 공개 랭킹(/api/ranking)
 * - 로그인: 포디움과 본인 순위를 같은 시점으로 계산한 /api/ranking/me 하나만 쓴다.
 * - 개발 모드 `?preview=아이디`: 그 사람으로 로그인한 것처럼 본다(읽기 전용).
 */
export const useRankingData = (): {
  readonly data: RankingDataState;
  readonly refresh: () => Promise<RefreshResult>;
  /** 개발 미리보기 대상 아이디(아니면 null) */
  readonly previewLogin: string | null;
} => {
  const { status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const previewLogin = isDevPreviewEnabled()
    ? parsePreviewLogin(searchParams.get(DEV_PREVIEW_PARAM))
    : null;
  const [data, setData] = useState<RankingDataState>({ status: 'loading' });

  useEffect(() => {
    if (!previewLogin && sessionStatus === 'loading') return undefined;

    let cancelled = false;
    const load = async () => {
      try {
        const next: RankingDataState = previewLogin
          ? toReadyState(
              await fetchJson<MyRankResponse>(
                `/api/dev/ranking-preview?login=${encodeURIComponent(previewLogin)}`
              )
            )
          : sessionStatus === 'authenticated'
            ? toReadyState(await fetchJson<MyRankResponse>('/api/ranking/me'))
            : {
                status: 'ready',
                ranking: await fetchJson<RankingResponse>('/api/ranking'),
                my: { status: 'guest' },
              };
        if (!cancelled) setData(next);
      } catch {
        if (!cancelled) setData({ status: 'error' });
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, previewLogin]);

  /** 본인 기여 수를 새로 조회한다. 1분 안에 다시 누르면 cooldown. */
  const refresh = async (): Promise<RefreshResult> => {
    if (previewLogin) return 'preview';
    try {
      const res = await fetch('/api/ranking/me', { method: 'POST' });
      if (res.status === 429) {
        const body: { refreshAvailableAt?: number } = await res.json();
        setData((prev) =>
          prev.status === 'ready' && prev.my.status !== 'guest'
            ? {
                ...prev,
                my: {
                  ...prev.my,
                  refreshAvailableAt: body.refreshAvailableAt ?? Date.now(),
                },
              }
            : prev
        );
        return 'cooldown';
      }
      if (!res.ok) return 'failed';
      setData(toReadyState((await res.json()) as MyRankResponse));
      return 'refreshed';
    } catch {
      return 'failed';
    }
  };

  return { data, refresh, previewLogin };
};
