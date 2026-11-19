import { FieldValue } from 'firebase-admin/firestore';
import { usersCollection } from './admin';
import type { UserData } from '../src/types/api';
import {
  activeFrameIds,
  ownedFrameIds,
  type FrameId,
} from '../src/utils/frames/catalog';

/** 가진 테두리 목록 */
export const getOwnedFrames = async (githubId: string): Promise<FrameId[]> => {
  const snap = await usersCollection().doc(githubId).get();
  return ownedFrameIds((snap.data() as UserData | undefined)?.frames);
};

/**
 * 지금 진행 중인 이벤트 테두리 중 아직 없는 것을 지급한다.
 * 이벤트가 없으면 DB 를 읽지도 않는다. 가입한 사용자(문서가 있는 사용자)만 받는다.
 * @returns 이번에 새로 받은 테두리
 */
export const claimActiveFrames = async (
  githubId: string,
  now: number = Date.now()
): Promise<FrameId[]> => {
  const active = activeFrameIds(now);
  if (active.length === 0) return [];

  const ref = usersCollection().doc(githubId);
  const snap = await ref.get();
  if (!snap.exists) return [];

  const owned = ownedFrameIds((snap.data() as UserData).frames);
  const missing = active.filter((id) => !owned.includes(id));
  if (missing.length === 0) return [];

  await ref.update({ frames: FieldValue.arrayUnion(...missing) });
  return missing;
};
