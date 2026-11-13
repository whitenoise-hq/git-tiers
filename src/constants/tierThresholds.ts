/**
 * 티어 경계값의 유일한 출처.
 * 화면용 TIERS(constants/tiers.ts)와 티어 계산(utils/getTier.ts)이 모두 여기서 파생된다.
 * 값을 바꾸면 README.md · README.ko.md 의 티어 표도 함께 고친다.
 *
 * - 높은 티어부터 정렬한다.
 * - subTiers[0] 이 1단계(가장 높음), 마지막 값이 그 티어의 최소 기여 수다.
 */

export type TierName =
  | 'Challenger'
  | 'Grandmaster'
  | 'Master'
  | 'Diamond'
  | 'Platinum'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'Iron';

export interface TierThreshold {
  readonly name: TierName;
  /** public/ 기준 경로. 배지 SVG 생성(서버)에서 쓴다. */
  readonly image: string;
  readonly subTiers: readonly [number, number, number, number];
}

export const TIER_THRESHOLDS: readonly TierThreshold[] = [
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

/** 해당 티어에 들어가는 최소 기여 수(4단계 기준). */
export const getTierMin = (tier: TierThreshold): number => tier.subTiers[tier.subTiers.length - 1];
