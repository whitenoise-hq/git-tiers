import { Color } from '@/styles/color';
import { BackgroundMode } from '@/types/api';

const BG_COLOR_MAP: Record<BackgroundMode, string> = {
  light: Color.TierBgLight,
  dark: Color.TierBgDark,
  green: Color.TierBgGreen,
  red: Color.TierBgRed,
  blue: Color.TierBgBlue,
};

export const getTierBg = (mode: BackgroundMode | string): string => {
  if (mode.startsWith('#')) return mode;
  return BG_COLOR_MAP[mode as BackgroundMode] ?? Color.TierBgLight;
};

export const isLightColor = (color: string): boolean => {
  let hex = color;

  if (!hex.startsWith('#')) {
    switch (hex) {
      case 'light': return true;
      default: return false;
    }
  }

  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};
