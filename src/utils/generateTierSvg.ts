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

  if (isCard === 'card') {
    const width = 280;
    const height = 100;
    const iconSize = 72;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1" />
  <image href="${iconBase64}" x="12" y="${(height - iconSize) / 2}" width="${iconSize}" height="${iconSize}" />
  ${isText === 'exist' ? `<text x="96" y="32" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" font-weight="700" fill="${subColor}" letter-spacing="0.06em" text-transform="uppercase">${tierText.toUpperCase()}</text>` : ''}
  <text x="96" y="${isText === 'exist' ? 52 : 42}" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" fill="${subColor}">
    <tspan font-weight="700" fill="${mainColor}">${contribFormatted}</tspan> contributions
  </text>
</svg>`;
  }

  // Simple mode
  const iconSize = 80;
  const hasText = isText === 'exist';
  const width = iconSize + 24;
  const height = hasText ? iconSize + 36 : iconSize + 16;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" stroke="${borderColor}" stroke-width="1" />
  <image href="${iconBase64}" x="${(width - iconSize) / 2}" y="8" width="${iconSize}" height="${iconSize}" />
  ${hasText ? `<text x="${width / 2}" y="${iconSize + 26}" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" font-weight="700" fill="${mainColor}" text-anchor="middle" letter-spacing="0.06em">${tierText.toUpperCase()}</text>` : ''}
</svg>`;
}
