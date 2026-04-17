import { Color } from '@/styles/color';

export const getTierBg = (type: string) => {
  if (type.startsWith('#')) return type;

  switch (type) {
    case 'light':
      return Color.TierBgLight;
    case 'dark':
      return Color.TierBgDark;
    case 'green':
      return Color.TierBgGreen;
    case 'red':
      return Color.TierBgRed;
    case 'blue':
      return Color.TierBgBlue;
    default:
      return Color.TierBgLight;
  }
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
