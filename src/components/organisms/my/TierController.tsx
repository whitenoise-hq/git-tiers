import React from 'react';
import styled from '@emotion/styled';

type TProps = {
  isCard: string;
  isText: string;
  isMode: string;
  setIsCard: React.Dispatch<React.SetStateAction<string>>;
  setIsText: React.Dispatch<React.SetStateAction<string>>;
  setIsMode: React.Dispatch<React.SetStateAction<string>>;
};

interface SegmentOption {
  readonly value: string;
  readonly label: string;
}

const TYPE_OPTIONS: readonly SegmentOption[] = [
  { value: 'image', label: 'Simple' },
  { value: 'card', label: 'Card' },
];

const TEXT_OPTIONS: readonly SegmentOption[] = [
  { value: 'exist', label: 'Show' },
  { value: 'delete', label: 'Hide' },
];

const BG_OPTIONS: readonly SegmentOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
];

export const TierController = ({
  isCard,
  isText,
  isMode,
  setIsCard,
  setIsText,
  setIsMode,
}: TProps) => {
  return (
    <S.Controller>
      <S.Group>
        <S.GroupLabel>Type</S.GroupLabel>
        <S.Segment>
          {TYPE_OPTIONS.map((opt) => (
            <S.SegmentButton
              key={opt.value}
              data-active={isCard === opt.value}
              onClick={() => setIsCard(opt.value)}>
              {opt.label}
            </S.SegmentButton>
          ))}
        </S.Segment>
      </S.Group>

      <S.Group>
        <S.GroupLabel>Tier Text</S.GroupLabel>
        <S.Segment>
          {TEXT_OPTIONS.map((opt) => (
            <S.SegmentButton
              key={opt.value}
              data-active={isText === opt.value}
              onClick={() => setIsText(opt.value)}>
              {opt.label}
            </S.SegmentButton>
          ))}
        </S.Segment>
      </S.Group>

      <S.Group>
        <S.GroupLabel>Background</S.GroupLabel>
        <S.Segment>
          {BG_OPTIONS.map((opt) => (
            <S.SegmentButton
              key={opt.value}
              data-active={isMode === opt.value}
              onClick={() => setIsMode(opt.value)}>
              {opt.label}
            </S.SegmentButton>
          ))}
        </S.Segment>
      </S.Group>
    </S.Controller>
  );
};

const S = {
  Controller: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  `,

  Group: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  GroupLabel: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,

  Segment: styled.div`
    display: flex;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  `,

  SegmentButton: styled.button`
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #86868b;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &[data-active='true'] {
      background: #fff;
      color: #1d1d1f;
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    &:hover:not([data-active='true']) {
      color: #1d1d1f;
    }
  `,
};
