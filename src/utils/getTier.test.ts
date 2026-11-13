import { describe, expect, it } from 'vitest';
import { getTierImage, getTierText } from './getTier';
import { TIER_THRESHOLDS } from '@/constants/tierThresholds';
import { TIERS } from '@/constants/tiers';

describe('getTierText', () => {
  it.each([
    [0, 'Iron 4'],
    [49, 'Iron 4'],
    [50, 'Iron 3'],
    [199, 'Iron 1'],
    [200, 'Bronze 4'],
    [799, 'Gold 1'],
    [800, 'Platinum 4'],
    [1199, 'Platinum 1'],
    [1200, 'Diamond 4'],
    [4799, 'Grandmaster 1'],
    [4800, 'Challenger 4'],
    [6299, 'Challenger 2'],
    [6300, 'Challenger 1'],
    [100000, 'Challenger 1'],
  ])('%i → %s', (count, expected) => {
    expect(getTierText(count)).toBe(expected);
  });

  it('음수는 가장 낮은 티어로 본다', () => {
    expect(getTierText(-1)).toBe('Iron 4');
  });
});

describe('getTierImage', () => {
  it.each([
    [0, '/tiers/1_iron.png'],
    [199, '/tiers/1_iron.png'],
    [200, '/tiers/2_bronze.png'],
    [4799, '/tiers/8_grandmaster.png'],
    [4800, '/tiers/9_challenger.png'],
    [-1, '/tiers/1_iron.png'],
  ])('%i → %s', (count, expected) => {
    expect(getTierImage(count)).toBe(expected);
  });
});

describe('TIER_THRESHOLDS', () => {
  it('높은 티어부터, 각 티어 안에서도 내림차순이며 티어끼리 겹치지 않는다', () => {
    const all = TIER_THRESHOLDS.flatMap((tier) => [...tier.subTiers]);
    const sorted = [...all].sort((a, b) => b - a);
    expect(all).toEqual(sorted);
    expect(new Set(all).size).toBe(all.length);
  });

  it('가장 낮은 티어는 0부터 시작한다', () => {
    expect(TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1].subTiers.at(-1)).toBe(0);
  });

  it('화면용 TIERS 는 낮은 티어부터 같은 최솟값을 쓴다', () => {
    expect(TIERS.map((t) => [t.name, t.min])).toEqual([
      ['Iron', 0],
      ['Bronze', 200],
      ['Silver', 400],
      ['Gold', 600],
      ['Platinum', 800],
      ['Diamond', 1200],
      ['Master', 2000],
      ['Grandmaster', 3200],
      ['Challenger', 4800],
    ]);
  });
});
