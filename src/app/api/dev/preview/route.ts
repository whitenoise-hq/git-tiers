import { NextRequest, NextResponse } from 'next/server';
import { findUserByLogin } from '../../../../../firebase/users';
import { getContributeCount } from '@/utils/github';
import { isDevPreviewEnabled, parsePreviewLogin } from '@/utils/devPreview';
import type { DevPreviewData, DevPreviewProfile } from '@/types/devPreview';
import type { ImageOptions } from '@/types/api';

interface GithubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
}

const fetchGithubProfile = async (
  login: string,
  token: string
): Promise<DevPreviewProfile | null> => {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const data: GithubUserResponse = await res.json();
  return {
    loginId: data.login,
    name: data.name ?? data.login,
    image: data.avatar_url,
    email: data.email ?? '',
    company: data.company,
    location: data.location,
    bio: data.bio,
  };
};

/** DB 를 읽기만 한다. 사용자가 없거나 Firebase 설정이 없으면 null */
const readImageSettings = async (
  login: string
): Promise<ImageOptions | null> => {
  try {
    const settings = (await findUserByLogin(login))?.data.imageSettings;
    return settings
      ? {
          isCard: settings.isCard,
          isText: settings.isText,
          isMode: settings.isMode,
        }
      : null;
  } catch {
    return null;
  }
};

/**
 * 개발 모드 전용: /my?preview=<아이디> 화면에 쓸 프로필·기여 수·표시 옵션.
 * 읽기 전용이다(기여 수 캐시도 쓰지 않는다). 운영에서는 404 를 돌려준다.
 */
export async function GET(request: NextRequest) {
  if (!isDevPreviewEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const login = parsePreviewLogin(request.nextUrl.searchParams.get('login'));
  if (!login) {
    return NextResponse.json({ error: 'Invalid login' }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN is not configured' },
      { status: 500 }
    );
  }

  try {
    const [profile, count, imageSettings] = await Promise.all([
      fetchGithubProfile(login, token),
      getContributeCount({ accessToken: token, loginId: login }),
      readImageSettings(login),
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: 'GitHub user not found' },
        { status: 404 }
      );
    }

    const body: DevPreviewData = {
      profile,
      contributions: count === 'ERROR' ? null : count,
      imageSettings,
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load preview' },
      { status: 502 }
    );
  }
}
