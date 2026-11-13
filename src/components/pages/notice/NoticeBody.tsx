'use client';

import React from 'react';
import styled from '@emotion/styled';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { Color } from '@/styles/color';
import { parseNoticeContent } from '@/utils/noticeContent';

/** 공지 본문: 소제목·체크 목록·문단으로 정돈해 보여 준다. */
export const NoticeBody = ({ content }: { readonly content: string }) => (
  <S.Body>
    {parseNoticeContent(content).map((block, i) => {
      if (block.type === 'heading') {
        return <S.Heading key={i}>{block.text}</S.Heading>;
      }
      if (block.type === 'list') {
        return (
          <S.List key={i}>
            {block.items.map((item) => (
              <li key={item}>
                <CheckRoundedIcon sx={{ fontSize: 15 }} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </S.List>
        );
      }
      return (
        <S.Paragraph key={i}>
          {block.lines.map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </S.Paragraph>
      );
    })}
  </S.Body>
);

const S = {
  Body: styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  Heading: styled.h4`
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${Color.TextSecondary};
  `,

  List: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;

    li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      line-height: 1.55;
      color: ${Color.Gray100};
    }

    svg {
      flex-shrink: 0;
      margin-top: 3px;
      color: var(--accent);
    }
  `,

  Paragraph: styled.p`
    font-size: 14px;
    line-height: 1.7;
    color: ${Color.Gray100};
  `,
};
