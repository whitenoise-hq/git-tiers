/** 테두리가 배지 바깥으로 나가는 만큼(px) */
export interface FramePad {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/** 배지 왼쪽 위(0,0) 기준 좌표로 그린 테두리 */
export interface FrameArt {
  readonly pad: FramePad;
  readonly markup: string;
}
