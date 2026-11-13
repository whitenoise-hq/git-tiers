"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

import { AuroraBackdrop } from "@/components/common/AuroraBackdrop";
import { PageContainer } from "@/components/common/PageContainer";
import {
  NoticeEntry,
  type Notice,
} from "@/components/pages/notice/NoticeEntry";
import { useLanguage } from "@/i18n/LanguageContext";
import { Color } from "@/styles/color";

/** 공지사항: 버전별 변경 기록 타임라인. 최신 공지만 펼쳐서 시작한다. */
export default function NoticePage() {
  const { t } = useLanguage();
  const notices = t.noticeData as Notice[];
  const [openIds, setOpenIds] = useState<ReadonlySet<number>>(
    () => new Set(notices.length > 0 ? [notices[0].id] : []),
  );

  const toggle = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <AuroraBackdrop />
      <S.Wrapper>
        <S.PageLabel>{t.notice.label || "Changelog"}</S.PageLabel>
        <S.PageTitle>{t.notice.title}</S.PageTitle>

        <S.Timeline>
          {notices.map((notice, index) => (
            <NoticeEntry
              key={notice.id}
              notice={notice}
              open={openIds.has(notice.id)}
              latest={index === 0}
              onToggle={() => toggle(notice.id)}
            />
          ))}
        </S.Timeline>
      </S.Wrapper>
    </>
  );
}

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const S = {
  // 본문 너비는 모든 페이지가 같은 틀을 쓴다.
  Wrapper: PageContainer,

  PageLabel: styled.p`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  `,

  PageTitle: styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: ${Color.TextLight};
    letter-spacing: -0.03em;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 28px;
    }
  `,

  // 왼쪽 메타(120px) + 간격(12px) + 점 칸(24px)의 가운데를 지나는 세로선
  Timeline: styled.ol`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    list-style: none;

    &::before {
      content: "";
      position: absolute;
      top: 28px;
      bottom: 28px;
      left: calc(120px + 12px + 12px - 1px);
      width: 2px;
      border-radius: 2px;
      background: linear-gradient(
        180deg,
        rgba(100, 172, 255, 0.6),
        rgba(255, 255, 255, 0.08) 30%,
        rgba(255, 255, 255, 0.04)
      );
    }

    > li {
      animation: ${riseIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    > li:nth-of-type(2) {
      animation-delay: 0.05s;
    }

    > li:nth-of-type(3) {
      animation-delay: 0.1s;
    }

    > li:nth-of-type(n + 4) {
      animation-delay: 0.15s;
    }

    @media (max-width: 640px) {
      &::before {
        left: 11px;
        top: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      > li {
        animation: none;
      }
    }
  `,
};
