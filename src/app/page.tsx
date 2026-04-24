'use client';

import React from 'react';
import styled from '@emotion/styled';
import { Color } from '@/styles/color';

import { HeroCont } from '@/components/organisms/main/HeroCont';
import { TierGridCont } from '@/components/organisms/main/TierGridCont';
import { TierProgression } from '@/components/organisms/main/TierProgression';
import { WhatCounts } from '@/components/organisms/main/WhatCounts';
import { Showcase } from '@/components/organisms/main/Showcase';
import { HowToCont } from '@/components/organisms/main/HowToCont';
import { Footer } from '@/components/common/Footer';
import { FloatingActions } from '@/components/common/FloatingActions';

export default function MainPage() {
  return (
    <S.Page>
      <HeroCont />
      <TierProgression />
      <WhatCounts />
      <TierGridCont />
      <Showcase />
      <HowToCont />
      <Footer />
      <FloatingActions />
    </S.Page>
  );
}

const S = {
  Page: styled.div`
    background: #000;
    color: ${Color.TextLight};
    overflow-x: clip;
  `,
};
