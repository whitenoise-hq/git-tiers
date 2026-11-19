import { describe, expect, it } from 'vitest';
import { frameOverlaySvg, renderFrame, toBadgeSvg } from './render';
import { generateTierSvg } from '../generateTierSvg';

const body = {
  width: 100,
  height: 50,
  body: '<rect width="100" height="50"/>',
};

describe('toBadgeSvg', () => {
  it('테두리가 없으면 배지 크기 그대로', () => {
    expect(toBadgeSvg(body, null)).toMatch(/^<svg[^>]*width="100" height="50"/);
  });

  it('테두리가 있으면 바깥 여백만큼 캔버스를 넓히고 배지를 안으로 옮긴다(잘리지 않게)', () => {
    const { pad } = renderFrame('xmas-2026', 100, 50);
    const svg = toBadgeSvg(body, 'xmas-2026');
    expect(svg).toContain(
      `width="${100 + pad.left + pad.right}" height="${50 + pad.top + pad.bottom}"`
    );
    expect(svg).toContain(`translate(${pad.left} ${pad.top})`);
  });

  it('같은 크기면 늘 같은 그림(캐시 · 미리보기와 일치)', () => {
    expect(renderFrame('xmas-2026', 222, 100).markup).toBe(
      renderFrame('xmas-2026', 222, 100).markup
    );
  });

  it('미리보기용 테두리 SVG 도 같은 여백을 쓴다', () => {
    const overlay = frameOverlaySvg('xmas-2026', 100, 50);
    expect(overlay.width).toBe(100 + overlay.pad.left + overlay.pad.right);
    expect(overlay.svg).toContain(renderFrame('xmas-2026', 100, 50).markup);
  });
});

describe('generateTierSvg 테두리', () => {
  const settings = {
    isText: 'exist',
    isMode: 'light',
    frame: 'xmas-2026',
  } as const;

  it('카드 · 심플에는 두르고 작은 배지에는 두르지 않는다', () => {
    expect(
      generateTierSvg({
        contributeCount: 100,
        settings: { ...settings, isCard: 'card' },
      })
    ).toContain('#n0');
    expect(
      generateTierSvg({
        contributeCount: 100,
        settings: { ...settings, isCard: 'image' },
      })
    ).toContain('#n0');
    expect(
      generateTierSvg({
        contributeCount: 100,
        settings: { ...settings, isCard: 'compact' },
      })
    ).not.toContain('#n0');
  });
});
