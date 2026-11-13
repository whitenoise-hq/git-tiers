import type { ImageOptions } from './api';

/** /api/dev/preview 응답 */
export interface DevPreviewProfile {
  readonly loginId: string;
  readonly name: string;
  readonly image: string;
  readonly email: string;
  readonly company: string | null;
  readonly location: string | null;
  readonly bio: string | null;
}

export interface DevPreviewData {
  readonly profile: DevPreviewProfile;
  /** GitHub 조회에 실패하면 null */
  readonly contributions: number | null;
  /** DB 에 저장된 표시 옵션. 가입하지 않았거나 저장한 적 없으면 null */
  readonly imageSettings: ImageOptions | null;
}
