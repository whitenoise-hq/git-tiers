import { describe, expect, it } from 'vitest';
import { buildTierTable, formatTierRange } from './tierTable';

describe('buildTierTable', () => {
  const table = buildTierTable();

  it('9개 티어를 높은 티어부터, 티어마다 4단계', () => {
    expect(table.map((group) => group.name)).toEqual([
      'Challenger',
      'Grandmaster',
      'Master',
      'Diamond',
      'Platinum',
      'Gold',
      'Silver',
      'Bronze',
      'Iron',
    ]);
    expect(table.every((group) => group.rows.length === 4)).toBe(true);
  });

  it('가장 높은 단계는 상한이 없다', () => {
    expect(table[0].rows[0]).toEqual({
      label: 'Challenger 1',
      min: 6300,
      max: null,
    });
  });

  it('티어 경계를 넘어가는 상한은 바로 위 티어의 최솟값 - 1', () => {
    const master1 = table.find((group) => group.name === 'Master')?.rows[0];
    expect(master1).toEqual({ label: 'Master 1', min: 2900, max: 3199 });
  });

  it('가장 낮은 단계는 0부터', () => {
    expect(table[8].rows[3]).toEqual({ label: 'Iron 4', min: 0, max: 49 });
  });

  it('README 티어 표와 같은 구간', () => {
    const gold = table.find((group) => group.name === 'Gold')?.rows;
    expect(gold?.map(formatTierRange)).toEqual([
      '750 – 799',
      '700 – 749',
      '650 – 699',
      '600 – 649',
    ]);
  });
});

describe('formatTierRange', () => {
  it('상한이 없으면 +', () => {
    expect(formatTierRange({ min: 6300, max: null })).toBe('6,300+');
  });
});

describe('README 티어 표', () => {
  // 경계값을 바꾸고 README 를 깜빡하지 않도록 두 README 의 표를 코드와 대조한다.
  it.each(['README.md', 'README.ko.md'])(
    '%s 의 최소 기여 수가 코드와 같다',
    async (file) => {
      const { readFileSync } = await import('node:fs');
      const readme = readFileSync(file, 'utf8');

      buildTierTable().forEach((group) => {
        const line = readme
          .split('\n')
          .find((l) => l.startsWith('|') && l.includes(`**${group.name}**`));
        const mins = [...group.rows]
          .reverse()
          .map((row) =>
            row.max === null
              ? `${row.min.toLocaleString('en-US')}+`
              : row.min.toLocaleString('en-US')
          );
        expect(line, `${file} ${group.name}`).toBeDefined();
        expect(
          line
            ?.split('|')
            .slice(3, 7)
            .map((cell) => cell.trim())
        ).toEqual(mins);
      });
    }
  );
});
