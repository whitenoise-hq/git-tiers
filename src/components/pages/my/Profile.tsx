import { signOut, useSession } from 'next-auth/react';
import styled from '@emotion/styled';
import { useLanguage } from '@/i18n/LanguageContext';
import Avatar from '@mui/material/Avatar';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const Profile = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const handleGitLogout = async () => {
    await signOut();
  };

  return (
    <S.Card>
      <S.Top>
        <S.ProfileImg alt="profile-image" src={session?.user.image} />
        <S.Info>
          <S.Name>{session?.user.name || ''}</S.Name>
          <S.LoginId>{session?.loginId || ''}</S.LoginId>
          <S.Bio>{session?.user.bio || '-'}</S.Bio>
        </S.Info>
      </S.Top>

      <S.Meta>
        <S.MetaItem>
          <ApartmentIcon sx={{ fontSize: 16, color: '#86868b' }} />
          <span>{session?.user.company || '-'}</span>
        </S.MetaItem>
        <S.MetaItem>
          <AlternateEmailIcon sx={{ fontSize: 16, color: '#86868b' }} />
          <span>{session?.user.email || '-'}</span>
        </S.MetaItem>
        <S.MetaItem>
          <LocationOnIcon sx={{ fontSize: 16, color: '#86868b' }} />
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
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    @media (max-width: 768px) {
      padding: 24px;
    }
  `,

  Top: styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;

    @media (max-width: 480px) {
      flex-direction: column;
      text-align: center;
    }
  `,

  ProfileImg: styled(Avatar)`
    width: 80px !important;
    height: 80px !important;
    border: 2px solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
  `,

  Info: styled.div`
    min-width: 0;
  `,

  Name: styled.p`
    font-size: 22px;
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.02em;
  `,

  LoginId: styled.p`
    font-size: 15px;
    font-weight: 400;
    color: #86868b;
    margin-top: 2px;
  `,

  Bio: styled.p`
    font-size: 14px;
    font-weight: 400;
    color: #424245;
    margin-top: 8px;
    line-height: 1.5;
  `,

  Meta: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
  `,

  MetaItem: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #86868b;
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
    background: #0071e3;
    border: none;
    border-radius: 980px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease;

    &:hover {
      background: #0077ed;
    }
  `,

  SecondaryButton: styled.button`
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #86868b;
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 980px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.25);
      color: #1d1d1f;
    }
  `,
};