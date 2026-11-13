import { describe, expect, it } from 'vitest';
import { parseNoticeContent } from './noticeContent';

describe('parseNoticeContent', () => {
  it('문단 · 소제목 · 목록으로 나눈다', () => {
    const content =
      '랭킹 페이지가 추가되었습니다.\n\n주요 내용:\n- 상위 3명\n- 매일 갱신\n\n확인해 보세요.\n처리방침도 바뀌었습니다.';
    expect(parseNoticeContent(content)).toEqual([
      { type: 'paragraph', lines: ['랭킹 페이지가 추가되었습니다.'] },
      { type: 'heading', text: '주요 내용' },
      { type: 'list', items: ['상위 3명', '매일 갱신'] },
      {
        type: 'paragraph',
        lines: ['확인해 보세요.', '처리방침도 바뀌었습니다.'],
      },
    ]);
  });

  it('영어 소제목과 목록', () => {
    expect(parseNoticeContent("What's new:\n- A\n- B")).toEqual([
      { type: 'heading', text: "What's new" },
      { type: 'list', items: ['A', 'B'] },
    ]);
  });

  it('빈 줄로 나뉜 같은 문장도 각각 문단', () => {
    expect(parseNoticeContent('같은 줄\n\n같은 줄')).toEqual([
      { type: 'paragraph', lines: ['같은 줄'] },
      { type: 'paragraph', lines: ['같은 줄'] },
    ]);
  });

  it('긴 문장은 콜론으로 끝나도 소제목이 아니다', () => {
    const long =
      '이 문장은 아주 길어서 소제목으로 보기 어렵고 그냥 문단으로 보여야 합니다:';
    expect(parseNoticeContent(long)).toEqual([
      { type: 'paragraph', lines: [long] },
    ]);
  });

  it('빈 본문', () => {
    expect(parseNoticeContent('')).toEqual([]);
  });
});
