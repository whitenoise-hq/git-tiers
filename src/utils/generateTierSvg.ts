import fs from 'fs';
import path from 'path';
import { getTierImage, getTierText } from './getTier';
import { getTierBg, isLightColor } from './getTierBg';
import { ImageOptions } from '@/types/api';
import { Color } from '@/styles/color';

const iconCache = new Map<string, string>();

function getIconBase64(tierImagePath: string): string {
  if (iconCache.has(tierImagePath)) {
    return iconCache.get(tierImagePath)!;
  }

  const filename = tierImagePath.replace('/tiers/', '');
  const filePath = path.join(process.cwd(), 'public', 'tiers', filename);
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const result = `data:image/png;base64,${base64}`;
  iconCache.set(tierImagePath, result);
  return result;
}

/**
 * 아직 티어를 저장하지 않았거나 없는 사용자용 배지.
 * README 에 깨진 이미지 대신 이 배지가 보이게 한다.
 */
export function generatePlaceholderSvg(): string {
  const width = 222;
  const height = 100;
  const r = 12;
  const font = '-apple-system,Helvetica,Arial,sans-serif';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="${Color.TierBgLight}" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
  <text x="${width / 2}" y="44" font-family="${font}" font-size="13" font-weight="700" fill="${Color.TextPrimary}" text-anchor="middle" letter-spacing="0.7">NOT RANKED YET</text>
  <text x="${width / 2}" y="64" font-family="${font}" font-size="11" fill="${Color.TextSecondary}" text-anchor="middle">Sign in to Git TIERS</text>
</svg>`;
}

interface TierSvgParams {
  contributeCount: number;
  settings: ImageOptions;
}

export function generateTierSvg({ contributeCount, settings }: TierSvgParams): string {
  const { isCard, isText, isMode } = settings;
  const bgColor = getTierBg(isMode);
  const isLight = isLightColor(isMode);
  const tierImagePath = getTierImage(contributeCount);
  const tierText = getTierText(contributeCount);
  const iconBase64 = getIconBase64(tierImagePath);

  const mainColor = isLight ? Color.TextPrimary : Color.TextLight;
  const subColor = isLight ? Color.TextSubtle : 'rgba(255,255,255,0.7)';
  const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';

  const contribFormatted = contributeCount.toLocaleString();

  const r = 12; // border-radius

  // Card mode — match TierImage.tsx: padding 6px 12px, icon 88px, gap 10px
  if (isCard === 'card') {
    const pad = 6;
    const padX = 12;
    const iconSize = 88;
    const gap = 10;
    const textX = padX + iconSize + gap;

    const tierLabel = tierText.toUpperCase();
    const width = 222;
    const height = iconSize + pad * 2;
    const centerY = height / 2;

    // 2 lines: tierLabel + contrib, total ~22px block (11px each + 5px gap between)
    // 1 line: contrib only
    const tierLabelY = isText === 'exist' ? centerY - 4 : centerY + 4;
    const contribY = isText === 'exist' ? centerY + 14 : centerY + 4;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1" />
  <image href="${iconBase64}" x="${padX}" y="${pad}" width="${iconSize}" height="${iconSize}" />
  ${isText === 'exist' ? `<text x="${textX}" y="${tierLabelY}" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" font-weight="700" fill="${subColor}" letter-spacing="0.7">${tierLabel}</text>` : ''}
  <text x="${textX}" y="${contribY}" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" fill="${subColor}">
    <tspan font-weight="700" fill="${mainColor}">${contribFormatted}</tspan> contributions
  </text>
</svg>`;
  }

  // Simple mode — match TierImage.tsx: padding 6px 12px, icon 88px
  const pad = 6;
  const padX = 12;
  const iconSize = 88;
  const hasText = isText === 'exist';
  const width = iconSize + padX * 2;
  const height = hasText ? iconSize + pad + 24 : iconSize + pad * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1" />
  <image href="${iconBase64}" x="${padX}" y="${pad}" width="${iconSize}" height="${iconSize}" />
  ${hasText ? `<text x="${width / 2}" y="${iconSize + pad + 16}" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" font-weight="700" fill="${mainColor}" text-anchor="middle" letter-spacing="0.7">${tierText.toUpperCase()}</text>` : ''}
</svg>`;
}
