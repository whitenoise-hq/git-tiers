import React, { useMemo } from 'react';
import styled from '@emotion/styled';

import type { FrameId } from '@/utils/frames/catalog';
import { frameOverlaySvg } from '@/utils/frames/render';

const toDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * 미리보기 배지 위에 테두리를 겹친다. 실제 배지(SVG)와 같은 그림 함수를 쓴다.
 * 부모는 position: relative 이고, width · height 는 배지 바깥 크기(테두리 선 포함)다.
 */
export const FrameOverlay = ({
  frame,
  width,
  height,
  borderWidth = 1,
}: {
  readonly frame: FrameId;
  readonly width: number;
  readonly height: number;
  readonly borderWidth?: number;
}) => {
  const art = useMemo(
    () => frameOverlaySvg(frame, width, height),
    [frame, width, height]
  );
  return (
    <S.Overlay
      src={toDataUri(art.svg)}
      alt=""
      aria-hidden
      style={{
        left: -art.pad.left - borderWidth,
        top: -art.pad.top - borderWidth,
        width: art.width,
        height: art.height,
      }}
    />
  );
};

const THUMB_WIDTH = 60;
const THUMB_HEIGHT = 30;

/** 테두리 고르기 칸에 쓰는 작은 견본(빈 배지 + 테두리) */
export const FrameThumb = ({ frame }: { readonly frame: FrameId }) => (
  <S.ThumbBadge style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}>
    <FrameOverlay
      frame={frame}
      width={THUMB_WIDTH}
      height={THUMB_HEIGHT}
      borderWidth={0}
    />
  </S.ThumbBadge>
);

const S = {
  Overlay: styled.img`
    position: absolute;
    max-width: none;
    pointer-events: none;
  `,

  ThumbBadge: styled.span`
    position: relative;
    display: block;
    margin-top: 4px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.85);
  `,
};
