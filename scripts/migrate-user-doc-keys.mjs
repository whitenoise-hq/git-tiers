/**
 * users 문서 키를 GitHub 아이디 → GitHub 숫자 ID 로 옮기는 일회성 스크립트.
 *
 * 로그인할 때도 자동으로 옮겨지지만(firebase/users.ts upsertUserOnLogin),
 * 다시 로그인하지 않는 사용자까지 한 번에 정리할 때 쓴다.
 *
 * 사용법 (기본은 미리보기만 한다):
 *   node --env-file=.env.local scripts/migrate-user-doc-keys.mjs           # dry-run
 *   node --env-file=.env.local scripts/migrate-user-doc-keys.mjs --apply   # 실제 반영
 *
 * 필요한 환경 변수:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY  (서비스 계정)
 *   GITHUB_TOKEN  (권한 없는 개인 토큰이면 충분. 없으면 GitHub API 가 시간당 60회로 제한된다)
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const APPLY = process.argv.includes('--apply');

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`환경 변수 ${name} 가 없습니다.`);
    process.exit(1);
  }
  return value;
};

const db = getFirestore(
  initializeApp({
    credential: cert({
      projectId: requireEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  }),
);
const users = db.collection('users');

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/** @returns {Promise<{id:number, login:string} | null>} 없는 아이디(바꿨거나 탈퇴)는 null */
const fetchGithubUser = async (login) => {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: githubHeaders,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(
      `GitHub API ${res.status} (${login})${reset ? `, 제한 해제: ${new Date(Number(reset) * 1000).toLocaleString()}` : ''}`,
    );
  }
  const data = await res.json();
  return { id: data.id, login: data.login };
};

const earlier = (a, b) => (!a ? b : !b ? a : a < b ? a : b);

const main = async () => {
  console.log(APPLY ? '▶ 실제 반영 모드' : '▶ 미리보기(dry-run) — 반영하려면 --apply');

  const all = await users.get();
  const legacyDocs = all.docs.filter((doc) => typeof doc.data().github_id !== 'number');
  console.log(`전체 ${all.size}건 중 옮길 예전 문서 ${legacyDocs.length}건\n`);

  const summary = { moved: 0, merged: 0, notFound: [], failed: [] };

  for (const legacy of legacyDocs) {
    const legacyData = legacy.data();
    const login = legacyData.login_id || legacy.id;

    try {
      const gh = await fetchGithubUser(login);
      if (!gh) {
        summary.notFound.push(login);
        console.log(`  - ${login}: GitHub 에 없는 아이디(변경·탈퇴) → 그대로 둠`);
        continue;
      }

      const targetRef = users.doc(String(gh.id));
      const target = await targetRef.get();
      const targetData = target.exists ? target.data() : undefined;

      const merged = {
        ...legacyData,
        ...(targetData ?? {}),
        first_login: earlier(targetData?.first_login, legacyData.first_login) ?? new Date().toISOString(),
        github_id: gh.id,
        // 숫자 문서에 더 최근 아이디가 있으면 유지, 없으면 GitHub 현재 아이디
        login_id: targetData?.login_id ?? gh.login,
        login_lower: (targetData?.login_id ?? gh.login).toLowerCase(),
      };

      const action = target.exists ? '합치기' : '옮기기';
      console.log(`  - ${legacy.id} → ${gh.id} (${action}${gh.login !== login ? `, 현재 아이디 ${gh.login}` : ''})`);

      if (APPLY) {
        const batch = db.batch();
        batch.set(targetRef, merged, { merge: true });
        batch.delete(legacy.ref);
        await batch.commit();
      }

      if (target.exists) summary.merged += 1;
      else summary.moved += 1;
    } catch (error) {
      summary.failed.push(login);
      console.error(`  ! ${login}: ${error.message}`);
      if (String(error.message).startsWith('GitHub API 403') || String(error.message).startsWith('GitHub API 429')) {
        console.error('GitHub API 호출 제한에 걸려 중단합니다. GITHUB_TOKEN 을 넣고 다시 실행하세요.');
        break;
      }
    }
  }

  console.log('\n결과');
  console.log(`  옮김 ${summary.moved}건, 합침 ${summary.merged}건${APPLY ? '' : ' (미리보기라 반영 안 됨)'}`);
  console.log(`  GitHub 에 없음 ${summary.notFound.length}건${summary.notFound.length ? `: ${summary.notFound.join(', ')}` : ''}`);
  console.log(`  실패 ${summary.failed.length}건${summary.failed.length ? `: ${summary.failed.join(', ')}` : ''}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
