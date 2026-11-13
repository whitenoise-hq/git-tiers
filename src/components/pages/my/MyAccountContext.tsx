'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import {
  DEV_PREVIEW_PARAM,
  isDevPreviewEnabled,
  parsePreviewLogin,
} from '@/utils/devPreview';
import type { DevPreviewData } from '@/types/devPreview';

type PreviewState =
  | {
      readonly login: string;
      readonly status: 'ready';
      readonly data: DevPreviewData;
    }
  | { readonly login: string; readonly status: 'error' };

interface MyAccount {
  readonly session: Session | null;
  readonly loginId: string | undefined;
  /** 개발 모드 미리보기(/my?preview=아이디). 저장·탈퇴를 하지 않는다. */
  readonly isPreview: boolean;
  /** 미리보기 데이터를 불러오는 중 */
  readonly previewLoading: boolean;
  readonly previewError: boolean;
  readonly previewData: DevPreviewData | null;
}

const MyAccountContext = createContext<MyAccount | null>(null);

const toSession = ({ profile }: DevPreviewData): Session => ({
  loginId: profile.loginId,
  expires: '',
  user: {
    name: profile.name,
    image: profile.image,
    email: profile.email,
    company: profile.company,
    location: profile.location,
    bio: profile.bio,
  },
});

export const MyAccountProvider = ({
  children,
}: {
  readonly children: ReactNode;
}) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const previewLogin = isDevPreviewEnabled()
    ? parsePreviewLogin(searchParams.get(DEV_PREVIEW_PARAM))
    : null;
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    if (!previewLogin) return undefined;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/dev/preview?login=${encodeURIComponent(previewLogin)}`
        );
        if (!res.ok) throw new Error(`Preview request failed: ${res.status}`);
        const data: DevPreviewData = await res.json();
        if (!cancelled)
          setPreview({ login: previewLogin, status: 'ready', data });
      } catch {
        if (!cancelled) setPreview({ login: previewLogin, status: 'error' });
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [previewLogin]);

  const value = useMemo<MyAccount>(() => {
    if (!previewLogin) {
      return {
        session: session ?? null,
        loginId: session?.loginId,
        isPreview: false,
        previewLoading: false,
        previewError: false,
        previewData: null,
      };
    }

    // 아이디를 바꾼 직후에는 이전 아이디의 결과를 쓰지 않는다.
    const current = preview?.login === previewLogin ? preview : null;
    const data = current?.status === 'ready' ? current.data : null;
    return {
      session: data ? toSession(data) : null,
      loginId: data?.profile.loginId,
      isPreview: true,
      previewLoading: current === null,
      previewError: current?.status === 'error',
      previewData: data,
    };
  }, [previewLogin, preview, session]);

  return (
    <MyAccountContext.Provider value={value}>
      {children}
    </MyAccountContext.Provider>
  );
};

export const useMyAccount = (): MyAccount => {
  const value = useContext(MyAccountContext);
  if (!value) {
    throw new Error('useMyAccount must be used inside MyAccountProvider');
  }
  return value;
};
