export type CardType = 'card' | 'image';
export type TextVisibility = 'exist' | 'none';
export type BackgroundMode = 'light' | 'dark' | 'green' | 'red' | 'blue';

export const CARD_TYPES: readonly CardType[] = ['card', 'image'] as const;
export const TEXT_VISIBILITIES: readonly TextVisibility[] = ['exist', 'none'] as const;
export const BACKGROUND_MODES: readonly BackgroundMode[] = ['light', 'dark', 'green', 'red', 'blue'] as const;

/** 사용자가 고르는 표시 옵션. 클라이언트에서 받는 값은 이것뿐이다. */
export interface ImageOptions {
  isCard: CardType;
  isText: TextVisibility;
  isMode: BackgroundMode | string; // string for custom hex colors
}

export const DEFAULT_IMAGE_OPTIONS: ImageOptions = {
  isCard: 'card',
  isText: 'exist',
  isMode: 'light',
};

/**
 * users 문서에 저장된 표시 옵션.
 * contributeCount 는 자동 갱신 도입(2026-11) 전에 저장하던 값으로, 새로 쓰지 않고 캐시가 없을 때 대체값으로만 읽는다.
 */
export interface ImageSettings extends ImageOptions {
  contributeCount?: number;
}

/** 서버 토큰으로 조회한 기여 수 캐시 */
export interface ContributionsCache {
  count: number;
  /** ISO 시각 */
  updatedAt: string;
}

/** #RGB 또는 #RRGGBB 만 허용한다(4·5자리는 SVG 에서 잘못된 색으로 나온다). */
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidImageOptions(value: unknown): value is ImageOptions {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    CARD_TYPES.includes(obj.isCard as CardType) &&
    TEXT_VISIBILITIES.includes(obj.isText as TextVisibility) &&
    typeof obj.isMode === 'string' &&
    (BACKGROUND_MODES.includes(obj.isMode as BackgroundMode) || HEX_COLOR_REGEX.test(obj.isMode))
  );
}

/**
 * users 컬렉션 문서. 문서 ID 는 GitHub 숫자 ID(아이디를 바꿔도 유지된다).
 * 2026-11 이전 문서는 GitHub 아이디(login)가 문서 ID 였다(legacy).
 */
export interface UserData {
  github_id?: number;
  /** 현재 GitHub 아이디. 다른 사람이 이 아이디를 가져가면 null 이 된다. */
  login_id?: string | null;
  /** 대소문자 무시 조회용 */
  login_lower?: string | null;
  lastUpdated?: string;
  imageSettings?: ImageSettings;
  contributions?: ContributionsCache;
  first_login?: string;
  last_login?: string;
}
