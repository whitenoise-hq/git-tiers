import { describe, expect, it } from 'vitest';
import {
  COMPACT_HEIGHT,
  compactValueText,
  generateCompactSvg,
  getCompactColors,
  getCompactLayout,
  measureText,
} from './compactBadge';
import { TIER_ACCENTS } from '@/constants/tierAccents';

describe('compactValueText', () => {
  it('티어 텍스트를 보이면 대문자 티어와 기여 수', () => {
    expect(compactValueText('Master 2', 2736, true)).toBe('MASTER 2 · 2,736');
  });

  it('숨기면 기여 수만', () => {
    expect(compactValueText('Master 2', 2736, false)).toBe('2,736');
  });
});

describe('getCompactLayout', () => {
  it('글자가 길수록 배지가 넓어지고, 칸 경계는 왼쪽 글자 뒤에 온다', () => {
    const short = getCompactLayout('12');
    const long = getCompactLayout('GRANDMASTER 4 · 3,456');
    expect(long.width).toBeGreaterThan(short.width);
    expect(short.leftWidth).toBe(long.leftWidth);
    expect(long.valueX).toBeGreaterThan(long.leftWidth);
    expect(long.width).toBeGreaterThanOrEqual(long.valueX + long.valueWidth);
  });

  it('글자 폭 근사', () => {
    expect(measureText('2,736')).toBeGreaterThan(measureText('12'));
  });
});

describe('getCompactColors', () => {
  it('오른쪽 칸은 티어 색, 밝은 배경이면 왼쪽 글자는 어둡게', () => {
    const light = getCompactColors('light', 'Gold');
    expect(light.rightBg).toBe(TIER_ACCENTS.Gold);
    expect(light.leftText).not.toBe(getCompactColors('dark', 'Gold').leftText);
  });
});

describe('generateCompactSvg', () => {
  const svg = generateCompactSvg({
    iconHref: 'data:image/png;base64,AAA',
    tierName: 'Master',
    tierText: 'Master 2',
    contributeCount: 2736,
    isMode: 'dark',
    showTier: true,
  });

  it('높이 20px 의 SVG', () => {
    expect(svg).toContain(`height="${COMPACT_HEIGHT}"`);
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('티어 색 · 문구 · 접근성 이름을 담는다', () => {
    expect(svg).toContain(TIER_ACCENTS.Master);
    expect(svg).toContain('MASTER 2 · 2,736');
    expect(svg).toContain('aria-label="Git TIERS: MASTER 2 · 2,736"');
  });
});
