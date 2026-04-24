interface TierThreshold {
  readonly name: string;
  readonly image: string;
  readonly subTiers: readonly number[];
}

const TIER_THRESHOLDS: readonly TierThreshold[] = [
  { name: 'Challenger', image: '/tiers/9_challenger.png', subTiers: [6300, 5800, 5300, 4800] },
  { name: 'Grandmaster', image: '/tiers/8_grandmaster.png', subTiers: [4400, 4000, 3600, 3200] },
  { name: 'Master', image: '/tiers/7_master.png', subTiers: [2900, 2600, 2300, 2000] },
  { name: 'Diamond', image: '/tiers/6_diamond.png', subTiers: [1800, 1600, 1400, 1200] },
  { name: 'Platinum', image: '/tiers/5_platinum.png', subTiers: [1100, 1000, 900, 800] },
  { name: 'Gold', image: '/tiers/4_gold.png', subTiers: [750, 700, 650, 600] },
  { name: 'Silver', image: '/tiers/3_silver.png', subTiers: [550, 500, 450, 400] },
  { name: 'Bronze', image: '/tiers/2_bronze.png', subTiers: [350, 300, 250, 200] },
  { name: 'Iron', image: '/tiers/1_iron.png', subTiers: [150, 100, 50, 0] },
];

export const getTierImage = (contributions: number): string => {
  for (const tier of TIER_THRESHOLDS) {
    if (contributions >= tier.subTiers[tier.subTiers.length - 1]) {
      return tier.image;
    }
  }
  return '/tiers/1_iron.png';
};

export const getTierText = (contributions: number): string => {
  for (const tier of TIER_THRESHOLDS) {
    for (let i = 0; i < tier.subTiers.length; i++) {
      if (contributions >= tier.subTiers[i]) {
        return `${tier.name} ${i + 1}`;
      }
    }
  }
  return 'Iron 4';
};