'use client';

import { useState } from 'react';
import styled from '@emotion/styled';

import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

type TNotice = {
  id: number;
  title: string;
  content: string;
  isNew: boolean;
  date: string;
};

export default function NoticePage() {
  const { t } = useLanguage();
  const noticeList = t.noticeData as TNotice[];
  const [openItems, setOpenItems] = useState<Set<number>>(
    new Set(noticeList.length > 0 ? [noticeList[0].id] : [])
  );

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <S.Wrapper>
      <S.PageLabel>{t.notice.label}</S.PageLabel>
      <S.PageTitle>{t.notice.title}</S.PageTitle>

      <S.List>
        {noticeList.map((notice: TNotice) => {
          const isOpen = openItems.has(notice.id);
          return (
            <S.Item key={notice.id} $isOpen={isOpen}>
              <S.Header onClick={() => toggleItem(notice.id)}>
                <S.TitleRow>
                  {notice.isNew && <S.NewBadge>N</S.NewBadge>}
                  <S.ItemTitle $isOpen={isOpen}>{notice.title}</S.ItemTitle>
                </S.TitleRow>
                <S.HeaderRight>
                  <S.Date>{notice.date}</S.Date>
                  <S.Chevron $isOpen={isOpen} />
                </S.HeaderRight>
              </S.Header>
              <S.Content $isOpen={isOpen}>
                <S.ContentInner>{notice.content}</S.ContentInner>
              </S.Content>
            </S.Item>
          );
        })}
      </S.List>
    </S.Wrapper>
  );
}

const S = {
  Wrapper: styled.div`
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px 0;

    @media (max-width: 768px) {
      padding: 24px 20px 0;
    }
  `,

  PageLabel: styled.p`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  `,

  PageTitle: styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: ${Color.TextPrimary};
    letter-spacing: -0.03em;
    margin-bottom: 48px;

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 32px;
    }
  `,

  List: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
  `,

  Item: styled.li<{ $isOpen: boolean }>`
    background: ${({ $isOpen }) => ($isOpen ? '#fff' : 'rgba(0, 0, 0, 0.02)')};
    border: 1px solid
      ${({ $isOpen }) =>
        $isOpen ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: ${({ $isOpen }) =>
      $isOpen ? '0 2px 12px rgba(0, 0, 0, 0.06)' : 'none'};

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  `,

  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    cursor: pointer;
    gap: 16px;

    @media (max-width: 768px) {
      padding: 16px 20px;
    }
  `,

  TitleRow: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  `,

  NewBadge: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ff3b30;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    line-height: 1;
  `,

  ItemTitle: styled.span<{ $isOpen: boolean }>`
    font-size: 17px;
    font-weight: 600;
    color: ${({ $isOpen }) => ($isOpen ? '${Color.Link}' : '${Color.TextPrimary}')};
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
  `,

  HeaderRight: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  `,

  Date: styled.span`
    font-size: 13px;
    font-weight: 400;
    color: ${Color.TextSecondary};
  `,

  Chevron: styled.span<{ $isOpen: boolean }>`
    width: 20px;
    height: 20px;
    position: relative;
    flex-shrink: 0;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

    &::before {
      content: '';
      position: absolute;
      top: 5px;
      left: 4px;
      width: 8px;
      height: 8px;
      border-right: 2px solid ${Color.TextSecondary};
      border-bottom: 2px solid ${Color.TextSecondary};
      transform: rotate(45deg);
    }
  `,

  Content: styled.div<{ $isOpen: boolean }>`
    overflow: hidden;
    max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition:
      max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease,
      padding 0.3s ease;
  `,

  ContentInner: styled.p`
    font-size: 15px;
    white-space: pre-wrap;
    line-height: 1.7;
    margin: 0;
    padding: 0 24px 24px;
    color: ${Color.TextSubtle};
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding-top: 20px;

    @media (max-width: 768px) {
      padding: 0 20px 20px;
      padding-top: 16px;
    }
  `,
};
