import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import styled from '@emotion/styled';
import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import Avatar from '@mui/material/Avatar';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const Profile = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

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
              <ApartmentIcon sx={{ fontSize: 16, color: Color.TextSecondary }} />
              <span>{session?.user.company || '-'}</span>
            </S.MetaItem>
            <S.MetaItem>
              <AlternateEmailIcon sx={{ fontSize: 16, color: Color.TextSecondary }} />
              <span>{session?.user.email || '-'}</span>
            </S.MetaItem>
            <S.MetaItem>
              <LocationOnIcon sx={{ fontSize: 16, color: Color.TextSecondary }} />
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
            <S.SecondaryButton onClick={handleGitLogout}>
              {t.myPage.logout}
            </S.SecondaryButton>
          </S.Actions>
        </S.DetailInner>
      </S.Expandable>
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  `,

  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    @media (max-width: 768px) {
      padding: 14px 20px;
    }
  `,

  HeaderLabel: styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextSecondary};
  `,

  HeaderLeft: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  ProfileImg: styled(Avatar)`
    width: 36px !important;
    height: 36px !important;
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
  `,

  Name: styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${Color.TextPrimary};
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
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 3px;
      width: 8px;
      height: 8px;
      border-right: 2px solid ${Color.TextSecondary};
      border-bottom: 2px solid ${Color.TextSecondary};
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
  `,

  DetailInner: styled.div`
    padding: 0 24px 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding-top: 20px;

    @media (max-width: 768px) {
      padding: 0 20px 20px;
      padding-top: 16px;
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
  `,

  ProfileImgLarge: styled(Avatar)`
    width: 64px !important;
    height: 64px !important;
    border: 2px solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
  `,

  Info: styled.div`
    min-width: 0;
  `,

  NameLarge: styled.p`
    font-size: 20px;
    font-weight: 700;
    color: ${Color.TextPrimary};
    letter-spacing: -0.02em;
  `,

  LoginId: styled.p`
    font-size: 14px;
    font-weight: 400;
    color: ${Color.TextSecondary};
    margin-top: 2px;
  `,

  Bio: styled.p`
    font-size: 13px;
    font-weight: 400;
    color: ${Color.TextSubtle};
    margin-top: 6px;
    line-height: 1.5;
  `,

  Meta: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
  `,

  MetaItem: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${Color.TextSecondary};
  `,

  Actions: styled.div`
    display: flex;
    gap: 10px;
  `,

  PrimaryButton: styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease;

    &:hover {
      background: ${Color.LinkHover};
    }
  `,

  SecondaryButton: styled.button`
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.TextSecondary};
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 980px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.25);
      color: ${Color.TextPrimary};
    }
  `,
};
