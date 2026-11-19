'use client';

import { useState } from 'react';
import styled from '@emotion/styled';

type AvatarProps = {
  readonly src?: string | null;
  readonly alt: string;
  /** 가로세로 px. 기본 40 */
  readonly size?: number;
  readonly className?: string;
};

/** 동그란 프로필 사진. 주소가 없거나 불러오지 못하면 빈 회색 원을 보인다. */
export const Avatar = ({ src, alt, size = 40, className }: AvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <S.Root className={className} style={{ width: size, height: size }}>
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt}
          onError={() => setFailedSrc(src ?? null)}
        />
      )}
    </S.Root>
  );
};

const S = {
  Root: styled.span`
    display: inline-flex;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
};
