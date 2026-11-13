import type { TierName } from './tierThresholds';

/** 화면 연출용 티어 대표 색(엠블럼 색감 기준) */
export const TIER_ACCENTS: Record<TierName, string> = {
  Iron: '#8a8f98',
  Bronze: '#c8804f',
  Silver: '#b9c6d3',
  Gold: '#f5c451',
  Platinum: '#3fd0c0',
  Diamond: '#6aa8ff',
  Master: '#b26bff',
  Grandmaster: '#ff5f6d',
  Challenger: '#ffd36b',
};
