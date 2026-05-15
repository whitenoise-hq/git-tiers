'use client';

import React from 'react';
import styled from '@emotion/styled';

import { Color } from '@/styles/color';

type TProps = {
  title: string;
  icon?: React.ReactNode;
};

export const Title = ({ title, icon }: TProps) => {
  return (
    <S.Title>
      {icon && <span>{icon}</span>}
      {title}
    </S.Title>
  );
};

const S = {
  Title: styled.h3`
    font-size: 24px;
    color: ${Color.TextLight};
    display: flex;
    align-items: center;
    justify-content: start;

    > span {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;
    }
  `,
};
