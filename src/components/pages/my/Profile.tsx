import { useState } from 'react';
import { signOut } from 'next-auth/react';
import styled from '@emotion/styled';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { WithdrawDialog } from '@/components/organisms/my/WithdrawDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useMyAccount } from '@/components/pages/my/MyAccountContext';
import Avatar from '@mui/material/Avatar';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const Profile = () => {
  const { session, isPreview } = useMyAccount();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleGitLogout = async () => {
    await signOut();
  };

  return (
    <S.Card>
      <S.Header onClick={() => setOpen((prev) => !prev)}>
        {!open && (
          <S.HeaderLeft>
            <S.ProfileImg alt="profile-image" src={session?.user.image} />
            <S.Name>{session?.user.name || ''}</S.Name>
          </S.HeaderLeft>
        )}
        {open && <S.HeaderLabel>Profile</S.HeaderLabel>}
        <S.HeaderRight>
          {!open && (
            <S.GitHubLink
              href={`https://github.com/${session?.loginId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}>
              {t.myPage.myGithub}
            </S.GitHubLink>
          )}
          <S.Chevron $isOpen={open} />
        </S.HeaderRight>
      </S.Header>

      <S.Expandable $isOpen={open}>
        <S.DetailInner>
          <S.DetailTop>
            <S.ProfileImgLarge alt="profile-image" src={session?.user.image} />
            <S.Info>
              <S.NameLarge>{session?.user.name || ''}</S.NameLarge>
              <S.LoginId>{session?.loginId || ''}</S.LoginId>
              <S.Bio>{session?.user.bio || '-'}</S.Bio>
            </S.Info>
          </S.DetailTop>

          <S.Meta>
            <S.MetaItem>
              <ApartmentIcon sx={{ fontSize: 16, color: Color.Gray300 }} />
              <span>{session?.user.company || '-'}</span>
            </S.MetaItem>
            <S.MetaItem>
              <AlternateEmailIcon sx={{ fontSize: 16, color: Color.Gray300 }} />
              <span>{session?.user.email || '-'}</span>
            </S.MetaItem>
            <S.MetaItem>
              <LocationOnIcon sx={{ fontSize: 16, color: Color.Gray300 }} />
              <span>{session?.user.location || '-'}</span>
            </S.MetaItem>
          </S.Meta>

          <S.Actions>
            <S.PrimaryButton
              as="a"
              href={`https://github.com/${session?.loginId}`}
              target="_blank"
              rel="noopener noreferrer">
              {t.myPage.myGithub}
            </S.PrimaryButton>
          </S.Actions>

          {/* 자주 쓰지 않는 계정 동작은 작은 글자 버튼으로 아래에 따로 둔다. */}
          <S.AccountLinks>
            <S.TextButton type="button" onClick={() => setLogoutOpen(true)}>
              {t.myPage.logout}
            </S.TextButton>
            <S.TextButton
              type="button"
              data-tone="danger"
              onClick={() => setWithdrawOpen(true)}>
              {t.myPage.withdraw}
            </S.TextButton>
          </S.AccountLinks>
        </S.DetailInner>
      </S.Expandable>

      <ConfirmDialog
        open={logoutOpen}
        title={t.myPage.logoutTitle}
        description={t.myPage.logoutDesc}
        confirmLabel={t.myPage.logout}
        cancelLabel={t.myPage.cancel}
        onConfirm={handleGitLogout}
        onClose={() => setLogoutOpen(false)}
      />
      {session?.loginId && (
        <WithdrawDialog
          preview={isPreview}
          open={withdrawOpen}
          loginId={session.loginId}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </S.Card>
  );
};

/** 내 GitHub · 로그아웃 · 회원 탈퇴 버튼이 같은 크기가 되도록 공통 틀을 쓴다. */
const actionButtonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 40px;
  min-width: 112px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 980px;
`;

const S = {
  Card: styled.div`
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    overflow: hidden;

    /* 왼쪽 칸에서는 스크롤해도 따라 내려온다 */
    @media (min-width: 900px) {
      position: sticky;
      top: 24px;
    }
  `,

  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    @media (max-width: 768px) {
      padding: 14px 20px;
    }

    /* 넓은 화면은 왼쪽 칸에 항상 펼쳐 두므로 접는 머리줄이 필요 없다. */
    @media (min-width: 900px) {
      display: none;
    }
  `,

  HeaderLabel: styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
  `,

  HeaderLeft: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  ProfileImg: styled(Avatar)`
    width: 36px !important;
    height: 36px !important;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    flex-shrink: 0;
  `,

  Name: styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${Color.TextLight};
    letter-spacing: -0.01em;
  `,

  HeaderRight: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  GitHubLink: styled.a`
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border-radius: 980px;
    text-decoration: none;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  Chevron: styled.span<{ $isOpen: boolean }>`
    width: 18px;
    height: 18px;
    position: relative;
    flex-shrink: 0;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 3px;
      width: 8px;
      height: 8px;
      border-right: 2px solid ${Color.TextLight};
      border-bottom: 2px solid ${Color.TextLight};
      transform: rotate(45deg);
    }
  `,

  Expandable: styled.div<{ $isOpen: boolean }>`
    max-height: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    overflow: hidden;
    transition:
      max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease;

    @media (min-width: 900px) {
      max-height: none;
      opacity: 1;
    }
  `,

  DetailInner: styled.div`
    padding: 0 24px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 20px;

    @media (max-width: 768px) {
      padding: 0 20px 20px;
      padding-top: 16px;
    }

    @media (min-width: 900px) {
      padding: 28px 22px 22px;
      border-top: none;
    }
  `,

  DetailTop: styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
      flex-direction: column;
      text-align: center;
    }

    /* 왼쪽 칸: 사진 위, 이름 아래로 세로 정렬 */
    @media (min-width: 900px) {
      flex-direction: column;
      gap: 14px;
      text-align: center;
    }
  `,

  ProfileImgLarge: styled(Avatar)`
    width: 64px !important;
    height: 64px !important;
    border: 2px solid rgba(255, 255, 255, 0.12);
    flex-shrink: 0;
  `,

  Info: styled.div`
    min-width: 0;
  `,

  NameLarge: styled.p`
    font-size: 20px;
    font-weight: 700;
    color: ${Color.TextLight};
    letter-spacing: -0.02em;
  `,

  LoginId: styled.p`
    font-size: 14px;
    font-weight: 400;
    color: ${Color.Gray300};
    margin-top: 2px;
  `,

  Bio: styled.p`
    font-size: 13px;
    font-weight: 400;
    color: ${Color.Gray100};
    margin-top: 6px;
    line-height: 1.5;
  `,

  Meta: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 20px;

    @media (min-width: 900px) {
      flex-direction: column;
      gap: 10px;
    }
  `,

  MetaItem: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${Color.Gray300};
  `,

  // 주요 버튼(내 GitHub)은 카드 너비를 꽉 채운다.
  Actions: styled.div`
    display: flex;

    > * {
      width: 100%;
    }
  `,

  PrimaryButton: styled.a`
    ${actionButtonBase}
    color: #fff;
    background: ${Color.Link};
    border-color: transparent;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  AccountLinks: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  `,

  TextButton: styled.button`
    padding: 4px 2px;
    font-size: 13px;
    font-weight: 500;
    color: ${Color.Gray300};
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: ${Color.TextLight};
      text-decoration: underline;
    }

    &[data-tone='danger'] {
      color: color-mix(in srgb, ${Color.Red100} 75%, ${Color.Gray300});

      &:hover {
        color: ${Color.Red100};
      }
    }
  `,
};
