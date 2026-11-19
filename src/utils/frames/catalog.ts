import type { CardType } from '@/types/api';

/**
 * 배지 테두리 목록. 테두리는 이벤트 기간 동안 사이트에 로그인해 들어온 사용자에게 지급된다.
 * 새 이벤트는 여기에 한 줄 추가하고(그림은 frames/render.ts), 이름은 i18n frames 에 넣는다.
 */
/** 테두리를 새로 받았을 때 화면끼리 알리는 window 이벤트(detail: FrameId[]) */
export const FRAMES_GRANTED_EVENT = 'git-tiers:frames-granted';

export const FRAME_IDS = ['xmas-2026'] as const;
export type FrameId = (typeof FRAME_IDS)[number];

export interface FrameEvent {
  readonly id: FrameId;
  /** 지급 시작(포함) */
  readonly startsAt: string;
  /** 지급 끝(미포함) */
  readonly endsAt: string;
}

export const FRAME_EVENTS: readonly FrameEvent[] = [
  // 크리스마스 리스 — 12월 1일 0시 ~ 12월 25일 24시(한국 시간)
  {
    id: 'xmas-2026',
    startsAt: '2026-12-01T00:00:00+09:00',
    endsAt: '2026-12-26T00:00:00+09:00',
  },
];

export const isFrameId = (value: unknown): value is FrameId =>
  typeof value === 'string' && (FRAME_IDS as readonly string[]).includes(value);

/** 지금 지급 중인 테두리 */
export const activeFrameIds = (now: number): FrameId[] =>
  FRAME_EVENTS.filter(
    (event) =>
      Date.parse(event.startsAt) <= now && now < Date.parse(event.endsAt)
  ).map((event) => event.id);

/** 작은 가로형 배지는 높이가 20px 이라 테두리를 두르지 않는다. */
export const supportsFrame = (cardType: CardType): boolean =>
  cardType !== 'compact';

/** 저장된 값 중 실제로 가진 테두리 id 만 남긴다(모르는 값은 버린다). */
export const ownedFrameIds = (value: unknown): FrameId[] =>
  Array.isArray(value) ? FRAME_IDS.filter((id) => value.includes(id)) : [];
