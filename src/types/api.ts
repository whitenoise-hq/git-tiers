export type CardType = 'card' | 'image';
export type TextVisibility = 'exist' | 'none';
export type BackgroundMode = 'light' | 'dark' | 'green' | 'red' | 'blue';

export const CARD_TYPES: readonly CardType[] = ['card', 'image'] as const;
export const TEXT_VISIBILITIES: readonly TextVisibility[] = ['exist', 'none'] as const;
export const BACKGROUND_MODES: readonly BackgroundMode[] = ['light', 'dark', 'green', 'red', 'blue'] as const;

export interface ImageSettings {
  isCard: CardType;
  isText: TextVisibility;
  isMode: BackgroundMode | string; // string for custom hex colors
  contributeCount: number;
}

export function isValidImageSettings(value: unknown): value is ImageSettings {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    CARD_TYPES.includes(obj.isCard as CardType) &&
    TEXT_VISIBILITIES.includes(obj.isText as TextVisibility) &&
    typeof obj.isMode === 'string' &&
    (BACKGROUND_MODES.includes(obj.isMode as BackgroundMode) || /^#[0-9a-fA-F]{3,6}$/.test(obj.isMode)) &&
    typeof obj.contributeCount === 'number' &&
    obj.contributeCount >= 0
  );
}

export interface UserData {
  lastUpdated?: string;
  imageSettings?: ImageSettings;
  loginId?: string;
  first_login?: string;
  last_login?: string;
}
