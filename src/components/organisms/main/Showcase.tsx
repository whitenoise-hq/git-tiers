'use client';

import React from 'react';
import styled from '@emotion/styled';

import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { useLanguage } from '@/i18n/LanguageContext';
import { TierImage } from '@/components/organisms/my/TierImage';

export const Showcase = () => {
  const labelFade = useScrollFadeIn({ delay: 0 });
  const cardFade = useScrollFadeIn({ delay: 200 });
  const { t } = useLanguage();

  return (
    <S.Section>
      <S.Inner>
        <S.Label ref={labelFade.ref} data-visible={labelFade.isVisible}>
          {t.showcase.label}
        </S.Label>
        <S.Title ref={labelFade.ref} data-visible={labelFade.isVisible}>
          {t.showcase.title}
        </S.Title>
        <S.Subtitle ref={labelFade.ref} data-visible={labelFade.isVisible}>
          {t.showcase.subtitle}
        </S.Subtitle>

        <S.CardWrapper ref={cardFade.ref} data-visible={cardFade.isVisible}>
          <S.MockReadme>
            {/* Mock GitHub README header */}
            <S.ReadmeHeader>
              <S.ReadmeDot style={{ background: '#ff5f57' }} />
              <S.ReadmeDot style={{ background: '#febc2e' }} />
              <S.ReadmeDot style={{ background: '#28c840' }} />
              <S.ReadmeTitle>README.md</S.ReadmeTitle>
            </S.ReadmeHeader>

            <S.ReadmeBody>
              <S.ReadmeH1>devwoodie</S.ReadmeH1>
              <S.ReadmeText>
                {t.showcase.mockBio}
              </S.ReadmeText>

              {/* Tier badge */}
              <S.BadgeWrap>
                <TierImage
                  isMode="dark"
                  isCard="card"
                  isText="exist"
                  tierImage="/tiers/9_challenger.png"
                  tierText="Challenger 1"
                  contributeCount={6300}
                />
              </S.BadgeWrap>

              <S.ReadmeH2>{t.showcase.techStack}</S.ReadmeH2>
              <S.TagRow>
                <S.Tag>TypeScript</S.Tag>
                <S.Tag>React</S.Tag>
                <S.Tag>Next.js</S.Tag>
                <S.Tag>Node.js</S.Tag>
              </S.TagRow>
            </S.ReadmeBody>
          </S.MockReadme>
        </S.CardWrapper>
      </S.Inner>
    </S.Section>
  );
};

const fadeInStyle = `
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  transition: opacity 0.9s ease-out, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  &[data-visible='true'] {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const S = {
  Section: styled.section`
    background: #000;
    padding: 180px 24px;
    text-align: center;
    overflow: hidden;
  `,

  Inner: styled.div`
    max-width: 980px;
    margin: 0 auto;
  `,

  Label: styled.p`
    font-size: 16px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
    ${fadeInStyle}
  `,

  Title: styled.h2`
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #f5f5f7;
    margin-bottom: 12px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 32px;
    }
  `,

  Subtitle: styled.p`
    font-size: 19px;
    color: #86868b;
    margin-bottom: 64px;
    ${fadeInStyle}

    @media (max-width: 768px) {
      font-size: 16px;
    }
  `,

  CardWrapper: styled.div`
    perspective: 1000px;
    ${fadeInStyle}

    &[data-visible='true'] {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  MockReadme: styled.div`
    max-width: 640px;
    margin: 0 auto;
    background: #161b22;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    text-align: left;
    transform: rotateX(2deg);
    transition: transform 0.6s ease;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);

    &:hover {
      transform: rotateX(0deg) translateY(-4px);
      box-shadow: 0 50px 100px rgba(0, 0, 0, 0.6);
    }
  `,

  ReadmeHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    background: #0d1117;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  `,

  ReadmeDot: styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
  `,

  ReadmeTitle: styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #8b949e;
    margin-left: 8px;
  `,

  ReadmeBody: styled.div`
    padding: 32px;
  `,

  ReadmeH1: styled.h3`
    font-size: 28px;
    font-weight: 700;
    color: #f0f6fc;
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  `,

  ReadmeText: styled.p`
    font-size: 15px;
    color: #8b949e;
    margin-bottom: 24px;
    line-height: 1.5;
  `,

  BadgeWrap: styled.div`
    margin-bottom: 28px;
  `,

  ReadmeH2: styled.h4`
    font-size: 20px;
    font-weight: 600;
    color: #f0f6fc;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  `,

  TagRow: styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,

  Tag: styled.span`
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #58a6ff;
    background: rgba(56, 139, 253, 0.1);
    border-radius: 20px;
  `,
};
