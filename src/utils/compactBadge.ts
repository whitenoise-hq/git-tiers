import type { TierName } from '@/constants/tierThresholds';
import { TIER_ACCENTS } from '@/constants/tierAccents';
import { Color } from '@/styles/color';
import { getTierBg, isLightColor } from './getTierBg';

/**
 * 작은 가로형 배지(shields.io 배지와 같은 높이 20px).
 * [엠블럼 Git TIERS | MASTER 2 · 2,736]
 * 왼쪽은 사용자가 고른 배경색, 오른쪽은 티어 색.
 */

export const COMPACT_HEIGHT = 20;
const ICON_SIZE = 14;
const PAD_X = 6;
const ICON_GAP = 4;
export const COMPACT_LABEL = 'Git TIERS';
export const COMPACT_FONT = 'Verdana,Geneva,DejaVu Sans,sans-serif';

/** Verdana 11px 기준 글자 폭 근사(px). 실제 폭은 SVG textLength 로 맞춘다. */
const charWidth = (char: string): number => {
  if (/[0-9]/.test(char)) return 7;
  if (/[A-Z]/.test(char)) return 7.5;
  if (/[a-z]/.test(char)) return 6.1;
  if (char === ' ') return 3.9;
  if (char === ',' || char === '.') return 3.7;
  if (char === '·') return 4.4;
  return 6.5;
};

/** 굵은 글씨는 보통 글씨보다 넓다(Verdana Bold 기준 약 1.12배). */
const BOLD_RATIO = 1.12;

export const measureText = (text: string, bold = false): number =>
  Math.round(
    [...text].reduce((sum, char) => sum + charWidth(char), 0) *
      (bold ? BOLD_RATIO : 1) *
      10
  ) / 10;

/** 오른쪽 칸 글자: 티어 텍스트를 보이면 "MASTER 2 · 2,736", 숨기면 "2,736" */
export const compactValueText = (
  tierText: string,
  contributeCount: number,
  showTier: boolean
): string => {
  const count = contributeCount.toLocaleString('en-US');
  return showTier ? `${tierText.toUpperCase()} · ${count}` : count;
};

export interface CompactLayout {
  readonly width: number;
  readonly leftWidth: number;
  readonly labelX: number;
  readonly labelWidth: number;
  readonly valueX: number;
  readonly valueWidth: number;
}

export const getCompactLayout = (value: string): CompactLayout => {
  const labelWidth = measureText(COMPACT_LABEL);
  const valueWidth = measureText(value, true);
  const labelX = PAD_X + ICON_SIZE + ICON_GAP;
  const leftWidth = Math.ceil(labelX + labelWidth + PAD_X);
  const valueX = leftWidth + PAD_X;
  const width = Math.ceil(valueX + valueWidth + PAD_X);
  return { width, leftWidth, labelX, labelWidth, valueX, valueWidth };
};

/** 미리보기(화면)와 SVG 가 같은 색을 쓰도록 한곳에서 정한다. */
export const getCompactColors = (isMode: string, tierName: TierName) => {
  const light = isLightColor(isMode);
  return {
    leftBg: getTierBg(isMode),
    leftText: light ? Color.TextPrimary : Color.TextLight,
    border: light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
    rightBg: TIER_ACCENTS[tierName],
    rightText: '#111111',
  };
};

interface CompactSvgParams {
  readonly iconHref: string;
  readonly tierName: TierName;
  readonly tierText: string;
  readonly contributeCount: number;
  readonly isMode: string;
  readonly showTier: boolean;
}

export const generateCompactSvg = ({
  iconHref,
  tierName,
  tierText,
  contributeCount,
  isMode,
  showTier,
}: CompactSvgParams): string => {
  const value = compactValueText(tierText, contributeCount, showTier);
  const layout = getCompactLayout(value);
  const colors = getCompactColors(isMode, tierName);
  const h = COMPACT_HEIGHT;
  const textY = 14;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${h}" viewBox="0 0 ${layout.width} ${h}" role="img" aria-label="Git TIERS: ${value}">
  <title>Git TIERS: ${value}</title>
  <clipPath id="r"><rect width="${layout.width}" height="${h}" rx="4" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="${layout.leftWidth}" height="${h}" fill="${colors.leftBg}" />
    <rect x="${layout.leftWidth}" width="${layout.width - layout.leftWidth}" height="${h}" fill="${colors.rightBg}" />
  </g>
  <rect x="0.5" y="0.5" width="${layout.width - 1}" height="${h - 1}" rx="3.5" fill="none" stroke="${colors.border}" />
  <image href="${iconHref}" x="${PAD_X}" y="${(h - ICON_SIZE) / 2}" width="${ICON_SIZE}" height="${ICON_SIZE}" />
  <g font-family="${COMPACT_FONT}" font-size="11">
    <text x="${layout.labelX}" y="${textY}" fill="${colors.leftText}" textLength="${layout.labelWidth}" lengthAdjust="spacingAndGlyphs">${COMPACT_LABEL}</text>
    <text x="${layout.valueX}" y="${textY}" fill="${colors.rightText}" font-weight="700" textLength="${layout.valueWidth}" lengthAdjust="spacingAndGlyphs">${value}</text>
  </g>
</svg>`;
};
