'use client';

import React from 'react';
import styled from '@emotion/styled';

import { Color } from '@/styles/color';
import { NoticeBody } from './NoticeBody';

export interface Notice {
  readonly id: number;
  /** 기능 추가·업데이트는 가운데, 버그 수정은 끝자리를 올린다(예: v1.5.0 → v1.5.1). */
  readonly version: string;
  readonly title: string;
  readonly content: string;
  readonly isNew: boolean;
  readonly date: string;
}

interface NoticeEntryProps {
  readonly notice: Notice;
  readonly open: boolean;
  /** 가장 최근 공지(타임라인 점이 빛난다) */
  readonly latest: boolean;
  readonly onToggle: () => void;
}

/** 변경 기록 타임라인의 한 줄: 왼쪽 버전·날짜, 가운데 점, 오른쪽 카드 */
export const NoticeEntry = ({
  notice,
  open,
  latest,
  onToggle,
}: NoticeEntryProps) => {
  const bodyId = `notice-body-${notice.id}`;

  return (
    <S.Entry data-latest={latest}>
      <S.Meta>
        <S.Version>{notice.version}</S.Version>
        <S.Date>{notice.date}</S.Date>
      </S.Meta>

      <S.Dot aria-hidden />

      <S.Card data-open={open}>
        <S.Header
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}>
          <S.TitleRow>
            {notice.isNew && <S.NewBadge>NEW</S.NewBadge>}
            <S.Title>{notice.title}</S.Title>
          </S.TitleRow>
          <S.Chevron data-open={open} aria-hidden />
        </S.Header>

        {/* 높이를 0 ↔ 내용 높이로 부드럽게 펼친다(grid-template-rows 0fr → 1fr) */}
        <S.Collapse id={bodyId} data-open={open}>
          <S.CollapseInner>
            <S.BodyWrap>
              <NoticeBody content={notice.content} />
            </S.BodyWrap>
          </S.CollapseInner>
        </S.Collapse>
      </S.Card>
    </S.Entry>
  );
};

const S = {
  // 왼쪽 메타(120px) · 타임라인 점(24px) · 카드
  Entry: styled.li`
    --accent: #64acff;

    position: relative;
    display: grid;
    grid-template-columns: 120px 24px minmax(0, 1fr);
    column-gap: 12px;
    align-items: start;

    @media (max-width: 640px) {
      grid-template-columns: 24px minmax(0, 1fr);
      grid-template-areas:
        'dot meta'
        'dot card';
      row-gap: 8px;
    }
  `,

  Meta: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    padding-top: 18px;

    @media (max-width: 640px) {
      grid-area: meta;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding-top: 0;
    }
  `,

  Version: styled.span`
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextLight};

    [data-latest='true'] & {
      background: linear-gradient(90deg, #a8d8ff, ${Color.Link});
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `,

  Date: styled.span`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextSecondary};
  `,

  // 타임라인 위의 점. 최신 공지는 빛나며 숨 쉰다.
  Dot: styled.span`
    justify-self: center;
    width: 11px;
    height: 11px;
    margin-top: 23px;
    border-radius: 50%;
    background: #2c2c2e;
    border: 2px solid rgba(255, 255, 255, 0.25);

    [data-latest='true'] & {
      background: var(--accent);
      border-color: rgba(100, 172, 255, 0.4);
      box-shadow:
        0 0 0 5px rgba(100, 172, 255, 0.15),
        0 0 18px rgba(100, 172, 255, 0.6);
    }

    @media (max-width: 640px) {
      grid-area: dot;
      margin-top: 4px;
    }
  `,

  Card: styled.div`
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.02)
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition:
      border-color 0.3s ease,
      background 0.3s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.14);
    }

    &[data-open='true'] {
      border-color: rgba(255, 255, 255, 0.14);
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.07),
        rgba(255, 255, 255, 0.03)
      );
    }

    @media (max-width: 640px) {
      grid-area: card;
    }
  `,

  Header: styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    padding: 16px 20px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
  `,

  TitleRow: styled.span`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  `,

  NewBadge: styled.span`
    flex-shrink: 0;
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #fff;
    background: linear-gradient(135deg, ${Color.Link}, #5e5ce6);
    border-radius: 980px;
  `,

  Title: styled.span`
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${Color.TextLight};
  `,

  Chevron: styled.span`
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-right: 4px;
    border-right: 2px solid ${Color.Gray300};
    border-bottom: 2px solid ${Color.Gray300};
    transform: rotate(45deg) translate(-2px, -2px);
    transition: transform 0.3s ease;

    &[data-open='true'] {
      transform: rotate(-135deg) translate(-2px, -2px);
    }
  `,

  Collapse: styled.div`
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    &[data-open='true'] {
      grid-template-rows: 1fr;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,

  CollapseInner: styled.div`
    overflow: hidden;
  `,

  BodyWrap: styled.div`
    padding: 4px 20px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 16px;
  `,
};
