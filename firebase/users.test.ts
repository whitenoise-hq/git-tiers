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

const { findUserByLogin, upsertUserOnLogin, saveImageSettings, getImageSettings, deleteUserData } =
  await import('./users');

const settings = { isCard: 'card', isText: 'exist', isMode: 'dark' } as const;

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

  it('아이디를 바꾸면 같은 문서에서 아이디만 갱신되어 데이터가 이어진다', async () => {
    await upsertUserOnLogin({ githubId: '583231', login: 'octocat' });
    await saveImageSettings({ githubId: '583231', login: 'octocat', options: settings });

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

  it('배지 조회는 대소문자를 무시한다', async () => {
    await upsertUserOnLogin({ githubId: '7', login: 'NewUser' });

    expect((await findUserByLogin('newuser'))?.docId).toBe('7');
    expect(await findUserByLogin('nobody')).toBeNull();
  });

  it('다시 로그인해도 첫 로그인 시각은 그대로다', async () => {
    store.set('7', { github_id: 7, login_id: 'a', first_login: '2025-01-01T00:00:00.000Z' });
    await upsertUserOnLogin({ githubId: '7', login: 'a' });
    expect(store.get('7')?.first_login).toBe('2025-01-01T00:00:00.000Z');
  });

  it('저장할 때 아이디도 함께 기록하고, 표시 옵션 외 필드는 저장하지 않는다', async () => {
    await saveImageSettings({
      githubId: '42',
      login: 'Answer',
      options: { ...settings, extra: 99999 } as typeof settings,
    });

    expect(store.get('42')).toMatchObject({
      github_id: 42,
      login_id: 'Answer',
      login_lower: 'answer',
    });
    expect(store.get('42')?.imageSettings).toEqual(settings);
  });
});

describe('deleteUserData (회원 탈퇴)', () => {
  beforeEach(() => store.clear());

  it('내 숫자 ID 문서를 지운다', async () => {
    await upsertUserOnLogin({ githubId: '583231', login: 'octocat' });
    expect(await deleteUserData({ githubId: '583231', login: 'octocat' })).toEqual(['583231']);
    expect(store.has('583231')).toBe(false);
    expect(await findUserByLogin('octocat')).toBeNull();
  });

  it('지울 문서가 없어도 오류 없이 끝난다', async () => {
    expect(await deleteUserData({ githubId: '1', login: 'ghost' })).toEqual([]);
  });
});
