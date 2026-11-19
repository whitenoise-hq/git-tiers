import { isFrameId, type FrameId } from '@/utils/frames/catalog';

/** card: 카드형, image: 엠블럼형, compact: README 배지 줄에 맞춘 작은 가로형 */
export type CardType = 'card' | 'image' | 'compact';
export type TextVisibility = 'exist' | 'none';
export type BackgroundMode = 'light' | 'dark' | 'green' | 'red' | 'blue';

export const CARD_TYPES: readonly CardType[] = ['card', 'image', 'compact'] as const;
export const TEXT_VISIBILITIES: readonly TextVisibility[] = ['exist', 'none'] as const;
export const BACKGROUND_MODES: readonly BackgroundMode[] = ['light', 'dark', 'green', 'red', 'blue'] as const;

/** 사용자가 고르는 표시 옵션. 클라이언트에서 받는 값은 이것뿐이다. */
export interface ImageOptions {
  isCard: CardType;
  isText: TextVisibility;
  isMode: BackgroundMode | string; // string for custom hex colors
  /** 끼운 테두리(없으면 null). 예전 클라이언트는 보내지 않는다. */
  frame?: FrameId | null;
}

export const DEFAULT_IMAGE_OPTIONS: ImageOptions = {
  isCard: 'card',
  isText: 'exist',
  isMode: 'light',
  frame: null,
};

/** 허용한 필드만 골라 새 객체로 만든다(Firestore 는 undefined 를 못 받으므로 frame 은 null). */
export const toImageOptions = (value: ImageOptions): ImageOptions => ({
  isCard: value.isCard,
  isText: value.isText,
  isMode: value.isMode,
  frame: value.frame ?? null,
});

/** users 문서에 저장된 표시 옵션 */
export type ImageSettings = ImageOptions;

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
    (BACKGROUND_MODES.includes(obj.isMode as BackgroundMode) || HEX_COLOR_REGEX.test(obj.isMode)) &&
    (obj.frame === undefined || obj.frame === null || isFrameId(obj.frame))
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
  /** 이벤트로 받은 테두리 id 목록 */
  frames?: string[];
  first_login?: string;
  last_login?: string;
}
