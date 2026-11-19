'use client';

import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import type { AdminUserRow } from '../../../../firebase/adminUsers';
import { Color } from '@/styles/color';
import { getTierBg } from '@/utils/getTierBg';

type SortKey = 'lastLogin' | 'firstLogin' | 'contributions';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'lastLogin', label: '최근 로그인' },
  { key: 'firstLogin', label: '최근 가입' },
  { key: 'contributions', label: '기여 수' },
];

const CARD_LABEL: Record<string, string> = {
  card: '카드',
  image: '심플',
  compact: '작은 배지',
};

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('ko-KR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '-';

const compare = (key: SortKey) => (a: AdminUserRow, b: AdminUserRow) => {
  if (key === 'contributions')
    return (b.contributions ?? -1) - (a.contributions ?? -1);
  return (b[key] ?? '').localeCompare(a[key] ?? '');
};

/** 관리자 사용자 목록 — 검색 · 정렬 · 행을 누르면 상세(뱃지 설정 · 미리보기 · 링크). */
export const UserTable = ({ users }: { users: readonly AdminUserRow[] }) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('lastLogin');
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter(
        (u) =>
          !q ||
          (u.login ?? '').toLowerCase().includes(q) ||
          u.githubId.includes(q)
      )
      .sort(compare(sort));
  }, [users, query, sort]);

  return (
    <div>
      <S.Toolbar>
        <S.Search
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="아이디 또는 숫자 ID 검색"
          aria-label="사용자 검색"
        />
        <S.Sorts>
          {SORTS.map((s) => (
            <S.SortButton
              key={s.key}
              type="button"
              data-active={sort === s.key}
              onClick={() => setSort(s.key)}>
              {s.label}
            </S.SortButton>
          ))}
        </S.Sorts>
        <S.Count>{rows.length}명</S.Count>
      </S.Toolbar>

      <S.List>
        {rows.map((u) => {
          const open = openId === u.githubId;
          return (
            <S.Item key={u.githubId} data-open={open}>
              <S.Row
                type="button"
                onClick={() => setOpenId(open ? null : u.githubId)}
                aria-expanded={open}>
                {u.login ? (
                  <S.Avatar
                    src={`https://github.com/${u.login}.png?size=64`}
                    alt=""
                  />
                ) : (
                  <S.Avatar as="span" />
                )}
                <S.Name>
                  <strong>{u.login ?? '(아이디 없음)'}</strong>
                  <span>#{u.githubId}</span>
                </S.Name>
                <S.Cell>{u.tierText ?? '-'}</S.Cell>
                <S.Cell data-num>
                  {u.contributions?.toLocaleString() ?? '-'}
                </S.Cell>
                <S.Cell data-num>{u.rank ? `${u.rank}위` : '-'}</S.Cell>
                <S.Cell data-hide-mobile>{fmt(u.lastLogin)}</S.Cell>
              </S.Row>

              {open && <UserDetail user={u} />}
            </S.Item>
          );
        })}
      </S.List>
    </div>
  );
};

const UserDetail = ({ user }: { user: AdminUserRow }) => {
  const settings = user.imageSettings;
  return (
    <S.Detail>
      <S.Fields>
        <Field label="가입">{fmt(user.firstLogin)}</Field>
        <Field label="최근 로그인">{fmt(user.lastLogin)}</Field>
        <Field label="기여 수 갱신">{fmt(user.contributionsUpdatedAt)}</Field>
        <Field label="설정 저장">{fmt(user.settingsUpdatedAt)}</Field>
        <Field label="배지 유형">
          {settings
            ? (CARD_LABEL[settings.isCard] ?? settings.isCard)
            : '기본(카드)'}
        </Field>
        <Field label="티어 텍스트">
          {settings
            ? settings.isText === 'exist'
              ? '표시'
              : '숨김'
            : '기본(표시)'}
        </Field>
        <Field label="배경">
          {settings ? (
            <S.Swatch>
              <i style={{ background: getTierBg(settings.isMode) }} />
              {settings.isMode}
            </S.Swatch>
          ) : (
            '기본(라이트)'
          )}
        </Field>
      </S.Fields>

      {user.login && (
        <>
          <S.Preview>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/tier/${user.login}`} alt={`${user.login} 배지`} />
          </S.Preview>
          <S.Links>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer">
              GitHub 프로필
            </a>
            <a
              href={`/api/tier/${user.login}`}
              target="_blank"
              rel="noopener noreferrer">
              배지 주소
            </a>
          </S.Links>
        </>
      )}
    </S.Detail>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <S.Field>
    <span>{label}</span>
    <div>{children}</div>
  </S.Field>
);

const S = {
  Toolbar: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  `,

  Search: styled.input`
    flex: 1;
    min-width: 200px;
    height: 38px;
    padding: 0 14px;
    font-size: 14px;
    color: ${Color.TextLight};
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    outline: none;

    &:focus {
      border-color: ${Color.Link};
    }
  `,

  Sorts: styled.div`
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
  `,

  SortButton: styled.button`
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: ${Color.Gray300};
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &[data-active='true'] {
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.12);
    }
  `,

  Count: styled.span`
    margin-left: auto;
    font-size: 12px;
    color: ${Color.TextSecondary};
  `,

  List: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 6px;
    list-style: none;
  `,

  Item: styled.li`
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;

    &[data-open='true'] {
      border-color: rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.05);
    }
  `,

  Row: styled.button`
    display: grid;
    grid-template-columns: 32px minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)) minmax(
        0,
        1.2fr
      );
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 14px;
    text-align: left;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;

    @media (max-width: 640px) {
      grid-template-columns: 32px minmax(0, 1.6fr) repeat(3, minmax(0, 1fr));

      [data-hide-mobile] {
        display: none;
      }
    }
  `,

  Avatar: styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  `,

  Name: styled.span`
    display: flex;
    flex-direction: column;
    min-width: 0;

    strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: ${Color.TextLight};
    }

    span {
      font-size: 11px;
      color: ${Color.TextSecondary};
    }
  `,

  Cell: styled.span`
    font-size: 13px;
    color: ${Color.Gray100};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-num] {
      font-variant-numeric: tabular-nums;
    }
  `,

  Detail: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 14px 18px 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  `,

  Fields: styled.dl`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 24px;
    flex: 1;
    min-width: 260px;
  `,

  Field: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
    color: ${Color.TextLight};

    > span {
      font-size: 11px;
      color: ${Color.TextSecondary};
    }
  `,

  Swatch: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;

    i {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `,

  Preview: styled.div`
    display: flex;
    align-items: center;

    img {
      display: block;
      max-width: 240px;
    }
  `,

  Links: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;

    a {
      font-size: 13px;
      color: ${Color.Link};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
};
