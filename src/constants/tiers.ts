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

export interface TierInfo {
  readonly src: StaticImageData;
  readonly name: string;
  readonly min: number;
}

export const TIERS: readonly TierInfo[] = [
  { src: IronIcon, name: 'Iron', min: 0 },
  { src: BronzeIcon, name: 'Bronze', min: 200 },
  { src: SilverIcon, name: 'Silver', min: 400 },
  { src: GoldIcon, name: 'Gold', min: 600 },
  { src: PlatinumIcon, name: 'Platinum', min: 800 },
  { src: DiamondIcon, name: 'Diamond', min: 1200 },
  { src: MasterIcon, name: 'Master', min: 2000 },
  { src: GrandmasterIcon, name: 'Grandmaster', min: 3200 },
  { src: ChallengerIcon, name: 'Challenger', min: 4800 },
];