import { TIER_THRESHOLDS, type TierName } from '@/constants/tierThresholds';

export interface TierTableRow {
  /** 예: "Master 2" */
  readonly label: string;
  readonly min: number;
  /** 가장 높은 단계(Challenger 1)는 상한이 없다 */
  readonly max: number | null;
}

export interface TierTableGroup {
  readonly name: TierName;
  readonly image: string;
  /** 1단계(높음)부터 4단계(낮음)까지 */
  readonly rows: readonly TierTableRow[];
}

/**
 * 티어 표(높은 티어부터). 경계값은 tierThresholds.ts 에서만 가져온다.
 * 각 단계의 상한은 바로 위 단계의 최솟값 - 1 이다.
 */
export const buildTierTable = (): TierTableGroup[] => {
  const steps = TIER_THRESHOLDS.flatMap((tier) =>
    tier.subTiers.map((min, i) => ({
      tier,
      label: `${tier.name} ${i + 1}`,
      min,
    }))
  );

  return TIER_THRESHOLDS.map((tier) => ({
    name: tier.name,
    image: tier.image,
    rows: steps
      .filter((step) => step.tier === tier)
      .map((step) => {
        const index = steps.indexOf(step);
        const above = index > 0 ? steps[index - 1] : null;
        return {
          label: step.label,
          min: step.min,
          max: above ? above.min - 1 : null,
        };
      }),
  }));
};

/** "2,900 – 3,199" / "6,300+" */
export const formatTierRange = ({
  min,
  max,
}: Pick<TierTableRow, 'min' | 'max'>): string =>
  max === null
    ? `${min.toLocaleString()}+`
    : `${min.toLocaleString()} – ${max.toLocaleString()}`;
