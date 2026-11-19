import React from 'react';
import styled from '@emotion/styled';
import BlockIcon from '@mui/icons-material/Block';

import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { FRAME_IDS, type FrameId } from '@/utils/frames/catalog';
import { FrameThumb } from './FrameOverlay';

type FramePickerProps = {
  readonly owned: readonly FrameId[];
  readonly frame: FrameId | null;
  readonly setFrame: (frame: FrameId | null) => void;
  /** 작은 배지처럼 테두리를 못 두르는 유형이면 true */
  readonly disabled: boolean;
};

/** 마이페이지 테두리 고르기. 받은 테두리만 보여 준다(지난 이벤트의 못 받은 테두리는 보이지 않게). */
export const FramePicker = ({
  owned,
  frame,
  setFrame,
  disabled,
}: FramePickerProps) => {
  const { t } = useLanguage();

  return (
    <S.Group>
      <S.GroupLabel>{t.frames.title}</S.GroupLabel>
      <S.Tiles data-disabled={disabled}>
        <S.Tile
          type="button"
          data-active={frame === null}
          disabled={disabled}
          onClick={() => setFrame(null)}>
          <S.Thumb>
            <BlockIcon sx={{ fontSize: 22, color: Color.Gray300 }} />
          </S.Thumb>
          <S.TileName>{t.frames.none}</S.TileName>
        </S.Tile>

        {FRAME_IDS.filter((id) => owned.includes(id)).map((id) => (
          <S.Tile
            key={id}
            type="button"
            data-active={frame === id}
            disabled={disabled}
            onClick={() => setFrame(id)}>
            <S.Thumb>
              <FrameThumb frame={id} />
            </S.Thumb>
            <S.TileName>{t.frames.names[id]}</S.TileName>
          </S.Tile>
        ))}
      </S.Tiles>
      {disabled && <S.Hint>{t.frames.compactHint}</S.Hint>}
    </S.Group>
  );
};

const S = {
  Group: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-top: 16px;
  `,

  GroupLabel: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
  `,

  Tiles: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    &[data-disabled='true'] {
      opacity: 0.45;
    }
  `,

  Tile: styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 116px;
    padding: 10px 8px;
    color: ${Color.Gray300};
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    &[data-active='true'] {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.14);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    &:hover:not(:disabled):not([data-active='true']) {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.1);
    }

    &:disabled {
      cursor: not-allowed;
    }
  `,

  Thumb: styled.span`
    position: relative;
    display: grid;
    place-items: center;
    width: 84px;
    height: 64px;
  `,

  TileName: styled.span`
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
  `,

  Hint: styled.p`
    font-size: 12px;
    color: ${Color.TextSecondary};
    text-align: left;
  `,
};
