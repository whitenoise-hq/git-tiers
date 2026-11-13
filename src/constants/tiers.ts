import { StaticImageData } from 'next/image';

import IronIcon from '@/assets/images/tiers/1_iron.png';
import BronzeIcon from '@/assets/images/tiers/2_bronze.png';
import SilverIcon from '@/assets/images/tiers/3_silver.png';
import GoldIcon from '@/assets/images/tiers/4_gold.png';
import PlatinumIcon from '@/assets/images/tiers/5_platinum.png';
import DiamondIcon from '@/assets/images/tiers/6_diamond.png';
import MasterIcon from '@/assets/images/tiers/7_master.png';
import GrandmasterIcon from '@/assets/images/tiers/8_grandmaster.png';
import ChallengerIcon from '@/assets/images/tiers/9_challenger.png';

import { TIER_THRESHOLDS, TierName, getTierMin } from './tierThresholds';

export interface TierInfo {
  readonly src: StaticImageData;
  readonly name: TierName;
  readonly min: number;
}

const TIER_ICONS: Record<TierName, StaticImageData> = {
  Iron: IronIcon,
  Bronze: BronzeIcon,
  Silver: SilverIcon,
  Gold: GoldIcon,
  Platinum: PlatinumIcon,
  Diamond: DiamondIcon,
  Master: MasterIcon,
  Grandmaster: GrandmasterIcon,
  Challenger: ChallengerIcon,
};

/** 화면 표시용. 낮은 티어(Iron)부터 정렬한다. 경계값은 tierThresholds.ts 에서 가져온다. */
export const TIERS: readonly TierInfo[] = [...TIER_THRESHOLDS].reverse().map((tier) => ({
  src: TIER_ICONS[tier.name],
  name: tier.name,
  min: getTierMin(tier),
}));
