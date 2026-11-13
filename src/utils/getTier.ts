import { TIER_THRESHOLDS, getTierMin } from '@/constants/tierThresholds';

const LOWEST_TIER = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];

export const getTierImage = (contributions: number): string => {
  const tier = TIER_THRESHOLDS.find((t) => contributions >= getTierMin(t));
  return (tier ?? LOWEST_TIER).image;
};

export const getTierText = (contributions: number): string => {
  for (const tier of TIER_THRESHOLDS) {
    const level = tier.subTiers.findIndex((min) => contributions >= min);
    if (level !== -1) {
      return `${tier.name} ${level + 1}`;
    }
  }
  return `${LOWEST_TIER.name} ${LOWEST_TIER.subTiers.length}`;
};
