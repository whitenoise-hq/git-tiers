'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import toast from 'react-hot-toast';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';
import { formatMessage } from '@/utils/formatMessage';
import type { RefreshResult } from './useRankingData';

interface RefreshButtonProps {
  /** 다시 누를 수 있는 시각(epoch ms, 서버가 정함) */
  readonly availableAt: number;
  readonly onRefresh: () => Promise<RefreshResult>;
}

/**
 * 내 기여 수 갱신 버튼(로그인한 사람에게만 보인다).
 * 갱신 뒤 1분 동안은 남은 초를 보여 주며 비활성화한다. 서버도 같은 제한을 둔다.
 */
export const RefreshButton = ({
  availableAt,
  onRefresh,
}: RefreshButtonProps) => {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);

  const remainingSeconds = Math.max(0, Math.ceil((availableAt - now) / 1000));
  const coolingDown = remainingSeconds > 0;

  // 대기 중일 때만 1초마다 남은 시간을 갱신한다.
  useEffect(() => {
    if (availableAt <= Date.now()) return undefined;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= availableAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [availableAt]);

  const handleClick = async () => {
    setPending(true);
    const result = await onRefresh();
    setPending(false);
    setNow(Date.now());

    if (result === 'refreshed') toast.success(t.ranking.refreshed);
    if (result === 'failed') toast.error(t.ranking.refreshFailed);
    if (result === 'preview')
      toast('개발 미리보기라 실제로 갱신하지 않았습니다.');
  };

  const label = pending
    ? t.ranking.refreshing
    : coolingDown
      ? formatMessage(t.ranking.refreshCooldown, { seconds: remainingSeconds })
      : t.ranking.refresh;

  return (
    <S.Button
      type="button"
      onClick={handleClick}
      disabled={pending || coolingDown}
      data-pending={pending}
      aria-live="polite">
      <RefreshIcon sx={{ fontSize: 16 }} aria-hidden />
      <span>{label}</span>
    </S.Button>
  );
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const S = {
  Button: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${Color.TextLight};
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition:
      background 0.2s ease,
      opacity 0.2s ease;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.14);
    }

    &:disabled {
      cursor: not-allowed;
      color: ${Color.TextSecondary};
    }

    &[data-pending='true'] svg {
      animation: ${spin} 0.8s linear infinite;
    }
  `,
};
