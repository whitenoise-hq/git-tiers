import React from 'react';
import { useSession } from 'next-auth/react';

import styled from '@emotion/styled';
import { getTierBg } from '@/utils/getTierBg';

type TProps = {
  isMode: string;
  isCard: string;
  isText: string;
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
}: TProps) => {
  const { data: session } = useSession();
  const isLight = isMode === 'light';

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
            <S.LoginId $light={isLight}>{session?.loginId}</S.LoginId>
            <S.Contributions $light={isLight}>
              <strong>{(contributeCount || 0).toLocaleString()}</strong> contributions
            </S.Contributions>
            <S.Footer $light={isLight}>Created by Git TIERS</S.Footer>
          </S.Info>
        )}
      </S.Card>
    </div>
  );
};

const S = {
  Card: styled.div<{ $form?: string; $mode?: string }>`
    background-color: ${(props) => getTierBg(props.$mode || 'light')};
    border: 1px solid ${(props) =>
      props.$mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)'};
    padding: 16px 20px;
    display: inline-flex;
    align-items: center;
    gap: 20px;
    position: relative;
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
    color: ${(props) => (props.$light ? '#424245' : 'rgba(255, 255, 255, 0.7)')};
  `,

  LoginId: styled.p<{ $light: boolean }>`
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${(props) => (props.$light ? '#1d1d1f' : '#f5f5f7')};
  `,

  Contributions: styled.p<{ $light: boolean }>`
    font-size: 11px;
    margin-top: 12px;
    color: ${(props) => (props.$light ? '#424245' : 'rgba(255, 255, 255, 0.7)')};

    strong {
      font-weight: 700;
      color: ${(props) => (props.$light ? '#1d1d1f' : '#f5f5f7')};
    }
  `,

  Footer: styled.p<{ $light: boolean }>`
    font-size: 9px;
    font-weight: 400;
    margin-top: 10px;
    color: ${(props) => (props.$light ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)')};
    letter-spacing: 0.02em;
  `,
};
