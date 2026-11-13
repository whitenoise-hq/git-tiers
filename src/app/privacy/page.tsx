'use client';

import styled from '@emotion/styled';

import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import {
  EFFECTIVE_DATE,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_CONTENT,
  PRIVACY_OFFICER,
  PRIVACY_OFFICER_GITHUB,
  type PolicySection,
} from './content';

const Section = ({ section, children }: { section: PolicySection; children?: React.ReactNode }) => (
  <S.Section>
    <S.Heading>{section.heading}</S.Heading>
    {section.paragraphs?.map((paragraph) => <S.Paragraph key={paragraph}>{paragraph}</S.Paragraph>)}
    {section.table && (
      <S.TableWrap>
        <S.Table>
          <thead>
            <tr>
              {section.table.head.map((cell) => (
                <th key={cell} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, index) => (
                  <td key={`${index}-${cell}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </S.Table>
      </S.TableWrap>
    )}
    {section.items && (
      <S.List>
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </S.List>
    )}
    {children}
  </S.Section>
);

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const content = PRIVACY_CONTENT[lang];

  return (
    <S.Wrapper>
      <S.PageLabel>{content.label}</S.PageLabel>
      <S.PageTitle>{content.title}</S.PageTitle>
      <S.Intro>{content.intro}</S.Intro>
      <S.Effective>
        {content.effectiveLabel}: {EFFECTIVE_DATE}
      </S.Effective>

      {content.sections.map((section) => (
        <Section key={section.heading} section={section}>
          {section.showOfficer && (
            <S.Officer>
              <li>{PRIVACY_OFFICER}</li>
              <li>
                {content.contactLabel}:{' '}
                {PRIVACY_CONTACT_EMAIL ? (
                  <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
                ) : (
                  <a href={PRIVACY_OFFICER_GITHUB} target="_blank" rel="noopener noreferrer">
                    {PRIVACY_OFFICER_GITHUB}
                  </a>
                )}
              </li>
            </S.Officer>
          )}
        </Section>
      ))}
    </S.Wrapper>
  );
}

const S = {
  Wrapper: styled.div`
    max-width: 880px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 0 0;

    @media (max-width: 768px) {
      padding: 24px 20px 0;
    }
  `,

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
    margin-bottom: 20px;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  `,

  Intro: styled.p`
    font-size: 15px;
    line-height: 1.7;
    color: ${Color.Gray100};
  `,

  Effective: styled.p`
    margin: 12px 0 40px;
    font-size: 13px;
    color: ${Color.Gray300};
  `,

  Section: styled.section`
    padding: 28px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  `,

  Heading: styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: ${Color.TextLight};
    letter-spacing: -0.01em;
    margin-bottom: 12px;
  `,

  Paragraph: styled.p`
    font-size: 14px;
    line-height: 1.7;
    color: ${Color.Gray100};
    margin-bottom: 10px;
  `,

  List: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 20px;
    font-size: 14px;
    line-height: 1.7;
    color: ${Color.Gray100};
  `,

  TableWrap: styled.div`
    overflow-x: auto;
    margin: 4px 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  `,

  Table: styled.table`
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    font-size: 13px;
    line-height: 1.6;
    color: ${Color.Gray100};

    th,
    td {
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    th {
      font-weight: 600;
      color: ${Color.TextLight};
      background: rgba(255, 255, 255, 0.04);
      white-space: nowrap;
    }

    tr:last-of-type td {
      border-bottom: none;
    }
  `,

  Officer: styled.ul`
    list-style: none;
    font-size: 14px;
    line-height: 1.8;
    color: ${Color.Gray100};

    a {
      color: ${Color.Link};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
};
