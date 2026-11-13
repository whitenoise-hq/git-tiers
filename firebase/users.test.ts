import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from '../src/types/api';

/** 테스트용 메모리 Firestore(users 컬렉션에서 쓰는 기능만 흉내 낸다). */
const store = new Map<string, UserData>();

const docRef = (id: string) => ({
  id,
  get: async () => snapshot(id),
  set: async (data: UserData, options?: { merge?: boolean }) => {
    const prev = options?.merge ? (store.get(id) ?? {}) : {};
    store.set(id, structuredClone({ ...prev, ...data }));
  },
  delete: async () => {
    store.delete(id);
  },
});

const snapshot = (id: string) => ({
  id,
  exists: store.has(id),
  data: () => (store.has(id) ? structuredClone(store.get(id)) : undefined),
  ref: docRef(id),
});

const query = (field: keyof UserData, value: unknown, max = Infinity) => ({
  limit: (n: number) => query(field, value, n),
  get: async () => ({
    docs: [...store.entries()]
      .filter(([, data]) => data[field] === value)
      .slice(0, max)
      .map(([id]) => snapshot(id)),
  }),
});

vi.mock('./admin', () => ({
  usersCollection: () => ({
    doc: docRef,
    where: (field: keyof UserData, _op: '==', value: unknown) => query(field, value),
  }),
}));

const { findUserByLogin, upsertUserOnLogin, saveImageSettings, getImageSettings } = await import(
  './users'
);

const settings = { isCard: 'card', isText: 'exist', isMode: 'dark', contributeCount: 900 } as const;

describe('users 저장소', () => {
  beforeEach(() => store.clear());

  it('처음 로그인하면 숫자 ID 문서를 만든다', async () => {
    await upsertUserOnLogin({ githubId: '583231', login: 'Octocat' });

    expect(store.get('583231')).toMatchObject({
      github_id: 583231,
      login_id: 'Octocat',
      login_lower: 'octocat',
    });
    expect(store.get('583231')?.first_login).toBeTruthy();
  });

  it('예전 문서(문서 ID = 아이디)를 숫자 ID 문서로 옮기고 지운다', async () => {
    store.set('octocat', {
      login_id: 'octocat',
      first_login: '2025-01-01T00:00:00.000Z',
      imageSettings: settings,
    });

    await upsertUserOnLogin({ githubId: '583231', login: 'octocat' });

    expect(store.has('octocat')).toBe(false);
    expect(store.get('583231')).toMatchObject({
      github_id: 583231,
      first_login: '2025-01-01T00:00:00.000Z',
      imageSettings: settings,
    });
  });

  it('두 문서가 다 있으면 숫자 ID 문서를 우선하고 빈 값만 예전 문서에서 채운다', async () => {
    store.set('octocat', { login_id: 'octocat', first_login: '2025-01-01T00:00:00.000Z', imageSettings: settings });
    store.set('583231', { github_id: 583231, login_id: 'octocat', first_login: '2026-11-13T00:00:00.000Z' });

    await upsertUserOnLogin({ githubId: '583231', login: 'octocat' });

    expect(store.has('octocat')).toBe(false);
    expect(store.get('583231')).toMatchObject({
      first_login: '2025-01-01T00:00:00.000Z',
      imageSettings: settings,
    });
  });

  it('숫자로만 된 아이디라도 다른 사용자의 숫자 ID 문서는 예전 문서로 보지 않는다', async () => {
    store.set('12345', { github_id: 12345, login_id: 'someone', login_lower: 'someone', imageSettings: settings });

    await upsertUserOnLogin({ githubId: '999', login: '12345' });

    expect(store.get('12345')).toMatchObject({ github_id: 12345, imageSettings: settings });
    expect(store.get('999')?.imageSettings).toBeUndefined();
  });

  it('아이디를 바꾸면 같은 문서에서 아이디만 갱신되어 데이터가 이어진다', async () => {
    await upsertUserOnLogin({ githubId: '583231', login: 'octocat' });
    await saveImageSettings({ githubId: '583231', login: 'octocat', imageSettings: settings });

    await upsertUserOnLogin({ githubId: '583231', login: 'octo-renamed' });

    expect(await getImageSettings('583231')).toEqual(settings);
    expect((await findUserByLogin('octo-renamed'))?.docId).toBe('583231');
    expect(await findUserByLogin('octocat')).toBeNull();
  });

  it('다른 사람이 예전 아이디를 가져가면 이전 주인 문서의 아이디를 비운다', async () => {
    await upsertUserOnLogin({ githubId: '1', login: 'taken' });
    // 1번 사용자가 아이디를 바꾸고 아직 다시 로그인하지 않은 상태에서 2번이 'taken' 으로 로그인
    await upsertUserOnLogin({ githubId: '2', login: 'Taken' });

    expect(store.get('1')).toMatchObject({ login_id: null, login_lower: null });
    expect((await findUserByLogin('taken'))?.docId).toBe('2');
  });

  it('배지 조회는 대소문자를 무시하고, 숫자 문서가 없으면 예전 문서를 찾는다', async () => {
    store.set('legacy-user', { login_id: 'legacy-user', imageSettings: settings });
    await upsertUserOnLogin({ githubId: '7', login: 'NewUser' });

    expect((await findUserByLogin('newuser'))?.docId).toBe('7');
    expect((await findUserByLogin('legacy-user'))?.data.imageSettings).toEqual(settings);
    expect(await findUserByLogin('nobody')).toBeNull();
  });

  it('저장할 때 아이디도 함께 기록한다', async () => {
    await saveImageSettings({ githubId: '42', login: 'Answer', imageSettings: settings });

    expect(store.get('42')).toMatchObject({
      github_id: 42,
      login_id: 'Answer',
      login_lower: 'answer',
      imageSettings: settings,
    });
  });
});
