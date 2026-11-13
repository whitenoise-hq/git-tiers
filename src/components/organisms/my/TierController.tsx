import React, { useState } from 'react';
import styled from '@emotion/styled';
import { HexColorPicker } from 'react-colorful';
import { useLanguage } from '@/i18n/LanguageContext';
import { CardType, TextVisibility } from '@/types/api';
import { Color } from '@/styles/color';

type TierControllerProps = {
  isCard: CardType;
  isText: TextVisibility;
  isMode: string;
  setIsCard: React.Dispatch<React.SetStateAction<CardType>>;
  setIsText: React.Dispatch<React.SetStateAction<TextVisibility>>;
  setIsMode: React.Dispatch<React.SetStateAction<string>>;
};

export const TierController = ({
  isCard,
  isText,
  isMode,
  setIsCard,
  setIsText,
  setIsMode,
}: TierControllerProps) => {
  const { t } = useLanguage();
  const isCustomColor = isMode.startsWith('#');
  const [pickerOpen, setPickerOpen] = useState(isCustomColor);
  const [prevMode, setPrevMode] = useState(isMode);

  // 저장된 커스텀 색을 불러오는 등 isMode 가 사용자 색으로 바뀌면 피커를 연다.
  // (effect 대신 렌더 중에 이전 값과 비교해 조정 — React 권장 패턴)
  if (isMode !== prevMode) {
    setPrevMode(isMode);
    if (isCustomColor) {
      setPickerOpen(true);
    }
  }

  const typeOptions = [
    { value: 'image', label: t.tierController.simple },
    { value: 'card', label: t.tierController.card },
  ];
  const textOptions = [
    { value: 'exist', label: t.tierController.show },
    { value: 'none', label: t.tierController.hide },
  ];
  const bgOptions = [
    { value: 'light', label: t.tierController.light },
    { value: 'dark', label: t.tierController.dark },
  ];

  const handlePresetClick = (value: string) => {
    setIsMode(value);
    setPickerOpen(false);
  };

  const handleCustomClick = () => {
    if (!isCustomColor) {
      setIsMode('#333333');
    }
    setPickerOpen((prev) => !prev);
  };

  return (
    <S.Controller>
      <S.Group>
        <S.GroupLabel>{t.tierController.type}</S.GroupLabel>
        <S.Segment>
          {typeOptions.map((opt) => (
            <S.SegmentButton
              key={opt.value}
              data-active={isCard === opt.value}
              onClick={() => setIsCard(opt.value as CardType)}>
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
              onClick={() => setIsText(opt.value as TextVisibility)}>
              {opt.label}
            </S.SegmentButton>
          ))}
        </S.Segment>
      </S.Group>

      <S.Group>
        <S.GroupLabel>{t.tierController.background}</S.GroupLabel>
        {/* Custom 도 같은 칸에 넣어 프리셋 버튼들과 너비를 똑같이 맞춘다. */}
        <S.Segment>
          {bgOptions.map((opt) => (
            <S.SegmentButton
              key={opt.value}
              data-active={isMode === opt.value}
              onClick={() => handlePresetClick(opt.value)}>
              {opt.label}
            </S.SegmentButton>
          ))}
          <S.CustomButton
            data-active={isCustomColor}
            onClick={handleCustomClick}>
            <S.ColorDot
              style={{ background: isCustomColor ? isMode : Color.Gray300 }}
            />
            Custom
          </S.CustomButton>
        </S.Segment>
        {pickerOpen && (
          <S.PickerWrap>
            <HexColorPicker
              color={isCustomColor ? isMode : '#333333'}
              onChange={setIsMode}
            />
            <S.HexValue>{isCustomColor ? isMode : '#333333'}</S.HexValue>
          </S.PickerWrap>
        )}
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
    margin-top: 10px;
  `,

  Group: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  GroupLabel: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
  `,

  Segment: styled.div`
    display: flex;
    flex: 1;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  `,

  SegmentButton: styled.button`
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 500;
    color: ${Color.Gray300};
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 0;

    &[data-active='true'] {
      background: rgba(255, 255, 255, 0.12);
      color: ${Color.TextLight};
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    &:hover:not([data-active='true']) {
      color: ${Color.TextLight};
    }
  `,

  CustomButton: styled.button`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 12px;
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    color: ${Color.Gray300};
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &[data-active='true'] {
      background: rgba(255, 255, 255, 0.12);
      color: ${Color.TextLight};
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    &:hover:not([data-active='true']) {
      color: ${Color.TextLight};
    }
  `,

  ColorDot: styled.span`
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    transition: background 0.15s ease;
  `,

  PickerWrap: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

    .react-colorful {
      width: 100% !important;
      height: 160px !important;
      border-radius: 12px !important;
    }

    .react-colorful__saturation {
      border-radius: 10px 10px 0 0 !important;
    }

    .react-colorful__hue {
      height: 14px !important;
      border-radius: 0 0 10px 10px !important;
    }

    .react-colorful__pointer {
      width: 20px !important;
      height: 20px !important;
      border-width: 3px !important;
    }
  `,

  HexValue: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${Color.Gray300};
    font-family: monospace;
    letter-spacing: 0.03em;
  `,
};
