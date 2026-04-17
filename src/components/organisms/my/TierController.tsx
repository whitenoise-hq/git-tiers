import React from 'react';
import styled from '@emotion/styled';
import { useLanguage } from '@/i18n/LanguageContext';

type TProps = {
  isCard: string;
  isText: string;
  isMode: string;
  setIsCard: React.Dispatch<React.SetStateAction<string>>;
  setIsText: React.Dispatch<React.SetStateAction<string>>;
  setIsMode: React.Dispatch<React.SetStateAction<string>>;
};

export const TierController = ({
  isCard,
  isText,
  isMode,
  setIsCard,
  setIsText,
  setIsMode,
}: TProps) => {
  const { t } = useLanguage();

  const typeOptions = [
    { value: 'image', label: t.tierController.simple },
    { value: 'card', label: t.tierController.card },
  ];
  const textOptions = [
    { value: 'exist', label: t.tierController.show },
    { value: 'delete', label: t.tierController.hide },
  ];
  const bgOptions = [
    { value: 'light', label: t.tierController.light },
    { value: 'dark', label: t.tierController.dark },
    { value: 'blue', label: t.tierController.blue },
    { value: 'green', label: t.tierController.green },
    { value: 'red', label: t.tierController.red },
  ];

  return (
    <S.Controller>
      <S.Group>
        <S.GroupLabel>{t.tierController.type}</S.GroupLabel>
        <S.Segment>
          {typeOptions.map((opt) => (
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
        <S.GroupLabel>{t.tierController.tierText}</S.GroupLabel>
        <S.Segment>
          {textOptions.map((opt) => (
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
        <S.GroupLabel>{t.tierController.background}</S.GroupLabel>
        <S.Segment>
          {bgOptions.map((opt) => (
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
