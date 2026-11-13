import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from '../src/types/api';

const mocks = vi.hoisted(() => ({
  getContributeCount: vi.fn(),
  set: vi.fn(),
  doc: vi.fn(),
  getAll: vi.fn(),
}));

vi.mock('./admin', () => ({ usersCollection: () => ({ doc: mocks.doc, get: mocks.getAll }) }));
vi.mock('../src/utils/github', () => ({ getContributeCount: mocks.getContributeCount }));

const { getContributionCount, refreshAllContributions, CONTRIBUTIONS_TTL_MS } = await import(
  './contributions'
);

const NOW = Date.parse('2026-11-13T12:00:00.000Z');
const minutesAgo = (m: number) => new Date(NOW - m * 60 * 1000).toISOString();
const user = (data: UserData, docId = '583231') => ({ docId, data });

describe('getContributionCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GITHUB_TOKEN', 'ghp_server');
    mocks.doc.mockReturnValue({ set: mocks.set });
    mocks.set.mockResolvedValue(undefined);
    mocks.getContributeCount.mockResolvedValue(1500);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('캐시가 신선하면 GitHub 를 조회하지 않는다', async () => {
    const count = await getContributionCount(
      user({ login_id: 'octocat', contributions: { count: 900, updatedAt: minutesAgo(30) } }),
      NOW,
    );
    expect(count).toBe(900);
    expect(mocks.getContributeCount).not.toHaveBeenCalled();
  });

  it('캐시가 만료되면 서버 토큰으로 다시 조회하고 캐시를 갱신한다', async () => {
    const expired = minutesAgo(CONTRIBUTIONS_TTL_MS / 60000 + 1);
    const count = await getContributionCount(
      user({ login_id: 'octocat', contributions: { count: 900, updatedAt: expired } }),
      NOW,
    );

    expect(count).toBe(1500);
    expect(mocks.getContributeCount).toHaveBeenCalledWith({
      accessToken: 'ghp_server',
      loginId: 'octocat',
    });
    expect(mocks.doc).toHaveBeenCalledWith('583231');
    expect(mocks.set).toHaveBeenCalledWith(
      { contributions: { count: 1500, updatedAt: new Date(NOW).toISOString() } },
      { merge: true },
    );
  });

  it('캐시가 없으면 조회한다', async () => {
    expect(await getContributionCount(user({ login_id: 'octocat' }), NOW)).toBe(1500);
  });

  it('조회에 실패하면 마지막 캐시 값을 쓴다', async () => {
    mocks.getContributeCount.mockResolvedValue('ERROR');
    const count = await getContributionCount(
      user({ login_id: 'octocat', contributions: { count: 900, updatedAt: minutesAgo(600) } }),
      NOW,
    );
    expect(count).toBe(900);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('캐시도 없으면 예전에 저장한 기여 수를 대신 쓴다', async () => {
    mocks.getContributeCount.mockResolvedValue('ERROR');
    const count = await getContributionCount(
      user({
        login_id: 'octocat',
        imageSettings: { isCard: 'card', isText: 'exist', isMode: 'light', contributeCount: 321 },
      }),
      NOW,
    );
    expect(count).toBe(321);
  });

  it('알던 값이 하나도 없고 조회도 실패하면 null', async () => {
    mocks.getContributeCount.mockResolvedValue('ERROR');
    expect(await getContributionCount(user({ login_id: 'octocat' }), NOW)).toBeNull();
  });

  it('서버 토큰이 없으면 조회하지 않고 마지막 값을 쓴다', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    const count = await getContributionCount(
      user({ login_id: 'octocat', contributions: { count: 77, updatedAt: minutesAgo(600) } }),
      NOW,
    );
    expect(count).toBe(77);
    expect(mocks.getContributeCount).not.toHaveBeenCalled();
  });

  it('예전 문서는 문서 ID 를 아이디로 써서 조회한다', async () => {
    await getContributionCount(user({}, 'legacy-user'), NOW);
    expect(mocks.getContributeCount).toHaveBeenCalledWith({
      accessToken: 'ghp_server',
      loginId: 'legacy-user',
    });
  });

  it('다른 사람이 아이디를 가져가 아이디가 비면 조회하지 않는다', async () => {
    const count = await getContributionCount(
      user({ github_id: 1, login_id: null, contributions: { count: 5, updatedAt: minutesAgo(600) } }, '1'),
      NOW,
    );
    expect(count).toBe(5);
    expect(mocks.getContributeCount).not.toHaveBeenCalled();
  });

  it('캐시 저장이 실패해도 조회한 값은 돌려준다', async () => {
    mocks.set.mockRejectedValue(new Error('firestore down'));
    expect(await getContributionCount(user({ login_id: 'octocat' }), NOW)).toBe(1500);
  });
});

describe('refreshAllContributions', () => {
  const docs = (items: { id: string; data: UserData }[]) => ({
    docs: items.map(({ id, data }) => ({ id, data: () => data })),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GITHUB_TOKEN', 'ghp_server');
    mocks.doc.mockReturnValue({ set: mocks.set });
    mocks.set.mockResolvedValue(undefined);
    mocks.getContributeCount.mockResolvedValue(1500);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('아이디가 있는 모든 사용자를 캐시와 상관없이 새로 조회해 저장한다', async () => {
    mocks.getAll.mockResolvedValue(
      docs([
        { id: '1', data: { login_id: 'a', contributions: { count: 1, updatedAt: minutesAgo(1) } } },
        { id: '2', data: { login_id: 'b' } },
        { id: '3', data: { login_id: null } },
      ]),
    );

    const summary = await refreshAllContributions(NOW);

    expect(summary).toEqual({ updated: 2, failed: 0, skipped: 1 });
    expect(mocks.getContributeCount).toHaveBeenCalledTimes(2);
    expect(mocks.set).toHaveBeenCalledWith(
      { contributions: { count: 1500, updatedAt: new Date(NOW).toISOString() } },
      { merge: true },
    );
  });

  it('GitHub 조회나 저장이 실패한 사람은 failed 로 센다', async () => {
    mocks.getAll.mockResolvedValue(
      docs([
        { id: '1', data: { login_id: 'a' } },
        { id: '2', data: { login_id: 'b' } },
      ]),
    );
    mocks.getContributeCount.mockResolvedValueOnce('ERROR').mockResolvedValueOnce(10);
    mocks.set.mockRejectedValueOnce(new Error('write failed'));

    expect(await refreshAllContributions(NOW)).toEqual({ updated: 0, failed: 2, skipped: 0 });
  });

  it('GITHUB_TOKEN 이 없으면 오류', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    await expect(refreshAllContributions(NOW)).rejects.toThrow('GITHUB_TOKEN');
  });
});
