import type { FrameId } from './catalog';
import type { FrameArt } from './types';
import { wreathFrame } from './wreath';

const DRAWERS: Record<
  FrameId,
  (width: number, height: number, radius: number) => FrameArt
> = {
  'xmas-2026': wreathFrame,
};

export const BADGE_RADIUS = 12;

export const renderFrame = (
  id: FrameId,
  width: number,
  height: number
): FrameArt => DRAWERS[id](width, height, BADGE_RADIUS);

interface BadgeBody {
  readonly width: number;
  readonly height: number;
  /** <svg> 안쪽 내용 */
  readonly body: string;
}

/** 배지 SVG 를 만든다. 테두리가 있으면 캔버스를 넓혀 잘리지 않게 두른다. */
export const toBadgeSvg = (
  { width, height, body }: BadgeBody,
  frame: FrameId | null
): string => {
  if (!frame) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${body}
</svg>`;
  }

  const { pad, markup } = renderFrame(frame, width, height);
  const outerWidth = width + pad.left + pad.right;
  const outerHeight = height + pad.top + pad.bottom;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <g transform="translate(${pad.left} ${pad.top})">
  ${body}
  ${markup}
  </g>
</svg>`;
};

/** 마이페이지 미리보기용: 테두리만 그린 SVG(배지 크기는 화면에서 잰 값) */
export const frameOverlaySvg = (id: FrameId, width: number, height: number) => {
  const { pad, markup } = renderFrame(id, width, height);
  const outerWidth = width + pad.left + pad.right;
  const outerHeight = height + pad.top + pad.bottom;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}"><g transform="translate(${pad.left} ${pad.top})">${markup}</g></svg>`;
  return { svg, pad, width: outerWidth, height: outerHeight };
};
