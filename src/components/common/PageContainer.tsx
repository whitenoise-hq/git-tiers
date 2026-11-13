import styled from '@emotion/styled';

/** 랜딩 외 페이지 본문의 너비(좌우 여백 제외) */
export const PAGE_CONTENT_WIDTH = 880;

/**
 * 랜딩 외 페이지(마이페이지·공지사항·랭킹·개인정보 처리방침) 본문 틀.
 * 헤더는 넓게 두고 본문은 읽기 좋은 너비로 가운데에 맞춘다.
 * 오로라 배경(AuroraBackdrop) 위에 오도록 쌓임 순서를 올려 둔다.
 */
export const PageContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: ${PAGE_CONTENT_WIDTH + 48}px;
  margin: 0 auto;
  padding: 40px 24px 0;

  @media (max-width: 768px) {
    padding: 24px 20px 0;
  }
`;
