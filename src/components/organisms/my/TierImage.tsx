import React from 'react';
import styled from '@emotion/styled';
import { getTierBg, isLightColor } from '@/utils/getTierBg';
import { CardType, TextVisibility } from '@/types/api';

type TierImageProps = {
  isMode: string;
  isCard: CardType;
  isText: TextVisibility;
  tierImage: string;
  tierText: string;
  contributeCount: number;
};

export const TierImage = ({
  isMode,
  isCard,
  isText,
  tierImage,
  tierText,
  contributeCount,
}: TierImageProps) => {
  const isLight = isLightColor(isMode);

  return (
    <div style={{ minHeight: '140px' }}>
      <S.Card id="tierCard" $form={isCard} $mode={isMode}>
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

const S = {
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
    color: ${(props) => (props.$light ? '#1d1d1f' : '#f5f5f7')};
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
    color: ${(props) => (props.$light ? '#424245' : 'rgba(255, 255, 255)')};
  `,

  LoginId: styled.p<{ $light: boolean }>`
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${(props) => (props.$light ? '#1d1d1f' : '#f5f5f7')};
  `,

  Contributions: styled.p<{ $light: boolean }>`
    font-size: 11px;
    margin-top: 5px;
    color: ${(props) =>
      props.$light ? '#424245' : 'rgba(255, 255, 255, 0.7)'};

    strong {
      font-weight: 700;
      color: ${(props) => (props.$light ? '#1d1d1f' : '#f5f5f7')};
    }
  `,
};
