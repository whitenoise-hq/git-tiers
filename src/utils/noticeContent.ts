/**
 * 공지 본문(줄바꿈 문자열)을 화면 블록으로 나눈다.
 * - "- " 로 시작하는 줄이 이어지면 목록
 * - ":" 로 끝나는 짧은 줄은 소제목(예: "주요 변경 사항:")
 * - 빈 줄은 문단 구분
 * - 나머지 연속된 줄은 한 문단(줄바꿈 유지)
 */

export type NoticeBlock =
  | { readonly type: 'heading'; readonly text: string }
  | { readonly type: 'list'; readonly items: readonly string[] }
  | { readonly type: 'paragraph'; readonly lines: readonly string[] };

const HEADING_MAX_LENGTH = 30;

const isListLine = (line: string) => /^-\s+/.test(line);
const isHeadingLine = (line: string) =>
  line.endsWith(':') && line.length <= HEADING_MAX_LENGTH && !isListLine(line);

export const parseNoticeContent = (content: string): NoticeBlock[] => {
  const lines = content.split('\n').map((line) => line.trim());

  return lines.reduce<NoticeBlock[]>((blocks, line, index) => {
    if (!line) return blocks;

    const last = blocks[blocks.length - 1];
    const previousLine = index > 0 ? lines[index - 1] : '';

    if (isListLine(line)) {
      const item = line.replace(/^-\s+/, '');
      return last?.type === 'list'
        ? [
            ...blocks.slice(0, -1),
            { type: 'list', items: [...last.items, item] },
          ]
        : [...blocks, { type: 'list', items: [item] }];
    }

    if (isHeadingLine(line)) {
      return [...blocks, { type: 'heading', text: line.slice(0, -1).trim() }];
    }

    // 빈 줄 없이 바로 이어진 문장은 같은 문단으로 묶는다.
    const continuesParagraph =
      last?.type === 'paragraph' && previousLine !== '';
    return continuesParagraph
      ? [
          ...blocks.slice(0, -1),
          { type: 'paragraph', lines: [...last.lines, line] },
        ]
      : [...blocks, { type: 'paragraph', lines: [line] }];
  }, []);
};
