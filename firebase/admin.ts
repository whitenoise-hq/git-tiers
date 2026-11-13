import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * 서버 전용 Firestore (Admin SDK).
 * 서비스 계정으로 접근하므로 Firestore 보안 규칙을 모두 막아 두어도 동작한다.
 * 브라우저 번들에 들어가면 안 되므로 API 라우트에서만 import 한다.
 */

const readEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

const createAdminApp = (): App => {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: readEnv('FIREBASE_PROJECT_ID'),
      clientEmail: readEnv('FIREBASE_CLIENT_EMAIL'),
      // .env 에는 줄바꿈이 \n 문자열로 들어가므로 실제 줄바꿈으로 되돌린다.
      privateKey: readEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
};

let db: Firestore | null = null;

/** 첫 호출 때 초기화한다(빌드 시점에 환경 변수가 없어도 깨지지 않게). */
export const getAdminDb = (): Firestore => {
  if (!db) {
    db = getFirestore(createAdminApp());
  }
  return db;
};

export const usersCollection = () => getAdminDb().collection('users');
