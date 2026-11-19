import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { getTierBg, isLightColor } from '@/utils/getTierBg';
import { CardType, TextVisibility } from '@/types/api';
import { Color } from '@/styles/color';
import type { TierName } from '@/constants/tierThresholds';
import {
  COMPACT_FONT,
  COMPACT_HEIGHT,
  COMPACT_LABEL,
  compactValueText,
  getCompactColors,
} from '@/utils/compactBadge';
import { supportsFrame, type FrameId } from '@/utils/frames/catalog';
import { renderFrame } from '@/utils/frames/render';
import { FrameOverlay } from './FrameOverlay';

type TierImageProps = {
  isMode: string;
  isCard: CardType;
  isText: TextVisibility;
  tierImage: string;
  tierText: string;
  contributeCount: number;
  /** 두른 테두리(작은 배지에서는 무시) */
  frame?: FrameId | null;
};

interface Size {
  readonly width: number;
  readonly height: number;
}

/** 요소의 바깥 크기(테두리 선 포함)를 따라간다. */
const useElementSize = <T extends HTMLElement>() => {
  // 콜백 ref 로 받아, 작은 배지 → 카드처럼 요소가 새로 생겨도 다시 잰다.
  const [el, ref] = useState<T | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize((prev) =>
        prev && prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height }
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return { ref, size };
};

export const TierImage = ({
  isMode,
  isCard,
  isText,
  tierImage,
  tierText,
  contributeCount,
  frame = null,
}: TierImageProps) => {
  const isLight = isLightColor(isMode);
  const { ref: cardRef, size } = useElementSize<HTMLDivElement>();
  const shownFrame = frame && supportsFrame(isCard) ? frame : null;
  // 테두리가 바깥으로 나가는 만큼 자리를 비워 둔다(위 글자와 겹치지 않게).
  const pad = shownFrame ? renderFrame(shownFrame, 1, 1).pad : null;

  if (isCard === 'compact') {
    return (
      <CompactPreview
        isMode={isMode}
        showTier={isText === 'exist'}
        tierImage={tierImage}
        tierText={tierText}
        contributeCount={contributeCount}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '140px',
        padding: pad
          ? `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`
          : undefined,
      }}>
      <S.Card id="tierCard" ref={cardRef} $form={isCard} $mode={isMode}>
        {shownFrame && size && (
          <FrameOverlay
            frame={shownFrame}
            width={size.width}
            height={size.height}
          />
        )}
        <S.IconWrap>
          {tierImage && <img src={tierImage} alt="tier-image" />}
          {isText === 'exist' && isCard === 'image' && (
            <S.SimpleLabel $light={isLight}>{tierText}</S.SimpleLabel>
          )}
        </S.IconWrap>
        {isCard === 'card' && (
          <S.Info>
            {isText === 'exist' && (
              <S.TierLabel $light={isLight}>{tierText}</S.TierLabel>
            )}
            <S.Contributions $light={isLight}>
              <strong>{(contributeCount || 0).toLocaleString()}</strong>{' '}
              contributions
            </S.Contributions>
          </S.Info>
        )}
      </S.Card>
    </div>
  );
};

/**
 * 작은 가로형 배지 미리보기. 실제 배지(SVG)와 같은 색·문구를 쓰고,
 * 화면에서 잘 보이도록 1.6배로 키워 보여 준다.
 */
const CompactPreview = ({
  isMode,
  showTier,
  tierImage,
  tierText,
  contributeCount,
}: {
  isMode: string;
  showTier: boolean;
  tierImage: string;
  tierText: string;
  contributeCount: number;
}) => {
  const colors = getCompactColors(isMode, tierText.split(' ')[0] as TierName);
  const value = compactValueText(tierText, contributeCount || 0, showTier);

  return (
    <S.CompactStage>
      <S.Compact
        style={{ borderColor: colors.border }}
        role="img"
        aria-label={`Git TIERS: ${value}`}>
        <S.CompactLeft
          style={{ background: colors.leftBg, color: colors.leftText }}>
          {tierImage && <img src={tierImage} alt="" />}
          {COMPACT_LABEL}
        </S.CompactLeft>
        <S.CompactRight
          style={{ background: colors.rightBg, color: colors.rightText }}>
          {value}
        </S.CompactRight>
      </S.Compact>
    </S.CompactStage>
  );
};

const S = {
  CompactStage: styled.div`
    display: grid;
    place-items: center;
    min-height: 140px;
  `,

  Compact: styled.div`
    display: inline-flex;
    height: ${COMPACT_HEIGHT}px;
    overflow: hidden;
    border: 1px solid;
    border-radius: 4px;
    font-family: ${COMPACT_FONT} !important;
    font-size: 11px;
    line-height: ${COMPACT_HEIGHT - 2}px;
    white-space: nowrap;
    transform: scale(1.6);

    * {
      font-family: inherit !important;
    }
  `,

  CompactLeft: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px 0 5px;

    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  `,

  CompactRight: styled.span`
    padding: 0 6px;
    font-weight: 700;
  `,

  Card: styled.div<{ $form?: string; $mode?: string }>`
    background-color: ${(props) => getTierBg(props.$mode || 'light')};
    border: 1px solid
      ${(props) =>
        props.$mode === 'light'
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.15)'};
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    position: relative;
    border-radius: 12px;
  `,

  IconWrap: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    img {
      width: 88px;
      height: 88px;
      object-fit: contain;
    }
  `,

  SimpleLabel: styled.span<{ $light: boolean }>`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${(props) => (props.$light ? Color.TextPrimary : Color.TextLight)};
  `,

  Info: styled.div`
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2px;
  `,

  TierLabel: styled.p<{ $light: boolean }>`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${(props) =>
      props.$light ? Color.TextSubtle : 'rgba(255, 255, 255)'};
  `,

  LoginId: styled.p<{ $light: boolean }>`
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${(props) => (props.$light ? Color.TextPrimary : Color.TextLight)};
  `,

  Contributions: styled.p<{ $light: boolean }>`
    font-size: 11px;
    margin-top: 5px;
    color: ${(props) =>
      props.$light ? Color.TextSubtle : 'rgba(255, 255, 255, 0.7)'};

    strong {
      font-weight: 700;
      color: ${(props) => (props.$light ? Color.TextPrimary : Color.TextLight)};
    }
  `,
};
