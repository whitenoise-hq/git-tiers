import fs from 'fs';
import path from 'path';
import { getTierImage, getTierText } from './getTier';
import { getTierBg, isLightColor } from './getTierBg';
import { ImageSettings } from '@/types/api';

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

interface TierSvgParams {
  contributeCount: number;
  settings: ImageSettings;
}

export function generateTierSvg({ contributeCount, settings }: TierSvgParams): string {
  const { isCard, isText, isMode } = settings;
  const bgColor = getTierBg(isMode);
  const isLight = isLightColor(isMode);
  const tierImagePath = getTierImage(contributeCount);
  const tierText = getTierText(contributeCount);
  const iconBase64 = getIconBase64(tierImagePath);

  const mainColor = isLight ? '#1d1d1f' : '#f5f5f7';
  const subColor = isLight ? '#424245' : 'rgba(255,255,255,0.7)';
  const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';

  const contribFormatted = contributeCount.toLocaleString();

  const r = 12; // border-radius

  // Estimate text width: ~6.5px per character at font-size 11
  const charWidth = 6.5;

  // Card mode — match TierImage.tsx: padding 6px 12px, icon 88px, gap 10px
  if (isCard === 'card') {
    const pad = 6;
    const padX = 12;
    const iconSize = 88;
    const gap = 10;
    const textX = padX + iconSize + gap;

    // Calculate text width based on longest text line
    const contribText = `${contribFormatted} contributions`;
    const tierLabel = tierText.toUpperCase();
    const longestText = isText === 'exist'
      ? Math.max(contribText.length, tierLabel.length)
      : contribText.length;
    const textWidth = Math.ceil(longestText * charWidth);

    const width = textX + textWidth + padX;
    const height = iconSize + pad * 2;

    const tierLabelY = isText === 'exist' ? pad + 28 : pad + 38;
    const contribY = isText === 'exist' ? pad + 48 : pad + 38;

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
