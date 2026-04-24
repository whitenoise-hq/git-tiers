import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { Color } from '@/styles/color';

interface LogoProps {
  readonly dark?: boolean;
}

export const Logo = ({ dark = false }: LogoProps) => {
  const router = useRouter();

  return (
    <S.Logo onClick={() => router.push('/')} data-dark={dark}>
      Git TIERS
    </S.Logo>
  );
};

const S = {
  Logo: styled.h1`
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: -0.02em;

    &[data-dark='true'] {
      color: ${Color.TextLight};
    }

    &[data-dark='false'] {
      color: ${Color.TextPrimary};
    }
  `,
};