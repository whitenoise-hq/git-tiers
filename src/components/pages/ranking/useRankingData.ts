'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import type { RankingResponse } from '@/app/api/ranking/route';
import type { MyRankResponse } from '@/app/api/ranking/me/route';
import type { MyRank } from '@/utils/ranking';

export type MyRankState =
  | { readonly status: 'guest' }
  | { readonly status: 'unranked' }
  | { readonly status: 'ranked'; readonly me: MyRank };

export type RankingDataState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'ready';
      readonly ranking: RankingResponse;
      readonly my: MyRankState;
    };

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url} ${res.status}`);
  return res.json() as Promise<T>;
};

/** 공개 랭킹과(로그인했으면) 본인 순위를 함께 불러온다. 둘 다 끝나야 ready. */
export const useRankingData = (): RankingDataState => {
  const { status: sessionStatus } = useSession();
  const [state, setState] = useState<RankingDataState>({ status: 'loading' });

  useEffect(() => {
    if (sessionStatus === 'loading') return undefined;

    let cancelled = false;
    const load = async () => {
      try {
        const loggedIn = sessionStatus === 'authenticated';
        const [ranking, mine] = await Promise.all([
          fetchJson<RankingResponse>('/api/ranking'),
          // 본인 순위를 못 불러와도 공개 랭킹은 보여 준다.
          loggedIn
            ? fetchJson<MyRankResponse>('/api/ranking/me').catch(() => ({
                me: null,
              }))
            : null,
        ]);
        const my: MyRankState = !mine
          ? { status: 'guest' }
          : mine.me
            ? { status: 'ranked', me: mine.me }
            : { status: 'unranked' };
        if (!cancelled) setState({ status: 'ready', ranking, my });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  return state;
};
