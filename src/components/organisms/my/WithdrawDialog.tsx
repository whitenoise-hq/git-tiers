'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

import { useLanguage } from '@/i18n/LanguageContext';
import { Color } from '@/styles/color';

interface WithdrawDialogProps {
  readonly open: boolean;
  readonly loginId: string;
  readonly onClose: () => void;
}

/**
 * 회원 탈퇴 확인창.
 * 브라우저 기본 <dialog>(showModal)를 써서 최상위 레이어에 띄운다
 * (프로필 카드의 backdrop-filter·overflow 에 잘리지 않고, Esc·포커스 가두기를 기본 제공).
 * 실수로 탈퇴하지 않도록 GitHub 아이디를 직접 입력해야 버튼이 켜진다.
 */
export const WithdrawDialog = ({ open, loginId, onClose }: WithdrawDialogProps) => {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);

  const canWithdraw = !pending && typed.trim().toLowerCase() === loginId.toLowerCase();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    if (pending) return;
    setTyped('');
    onClose();
  };

  const handleWithdraw = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWithdraw) return;

    setPending(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      const data: { githubRevoked?: boolean } = await res.json();

      toast.success(t.toast.withdrawn);
      if (data.githubRevoked === false) {
        toast(t.toast.withdrawRevokeManual, { duration: 8000 });
      }
      await signOut({ callbackUrl: '/' });
    } catch {
      toast.error(t.toast.withdrawFailed);
      setPending(false);
    }
  };

  return (
    <S.Dialog
      ref={dialogRef}
      aria-labelledby="withdraw-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        // 바깥(배경) 클릭으로 닫기
        if (event.target === event.currentTarget) handleClose();
      }}>
      <S.Form onSubmit={handleWithdraw}>
        <S.Title id="withdraw-title">{t.myPage.withdrawTitle}</S.Title>
        <S.Points>
          {t.myPage.withdrawPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </S.Points>
        <S.PolicyLink>
          <Link href="/privacy" target="_blank">
            {t.footer.privacy} &rarr;
          </Link>
        </S.PolicyLink>

        <S.Label htmlFor="withdraw-login">
          {t.myPage.withdrawConfirmLabel} <strong>({loginId})</strong>
        </S.Label>
        <S.Input
          id="withdraw-login"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
        />

        <S.Actions>
          <S.CancelButton type="button" onClick={handleClose} disabled={pending}>
            {t.myPage.cancel}
          </S.CancelButton>
          <S.DangerButton type="submit" disabled={!canWithdraw}>
            {pending ? t.myPage.withdrawing : t.myPage.withdrawConfirm}
          </S.DangerButton>
        </S.Actions>
      </S.Form>
    </S.Dialog>
  );
};

const S = {
  Dialog: styled.dialog`
    /* 전역 리셋(* { margin: 0 })이 기본 가운데 정렬(margin: auto)을 지우므로 다시 지정한다. */
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(440px, calc(100vw - 32px));
    height: fit-content;
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    background: #1c1c1e;
    color: ${Color.TextLight};
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);

    &::backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
  `,

  Form: styled.form`
    padding: 28px 24px 24px;
  `,

  Title: styled.h3`
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 14px;
  `,

  Points: styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 18px;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.55;
    color: ${Color.Gray100};
  `,

  PolicyLink: styled.p`
    margin-bottom: 20px;

    a {
      font-size: 13px;
      color: ${Color.Link};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `,

  Label: styled.label`
    display: block;
    font-size: 13px;
    color: ${Color.Gray300};
    margin-bottom: 8px;

    strong {
      color: ${Color.TextLight};
      font-weight: 600;
    }
  `,

  Input: styled.input`
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    color: ${Color.TextLight};
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    outline: none;

    &:focus {
      border-color: ${Color.Red100};
    }
  `,

  Actions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  `,

  CancelButton: styled.button`
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray300};
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 980px;
    cursor: pointer;

    &:hover:not(:disabled) {
      color: ${Color.TextLight};
      border-color: rgba(255, 255, 255, 0.25);
    }
  `,

  DangerButton: styled.button`
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Red200};
    border: none;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.2s ease, opacity 0.2s ease;

    &:hover:not(:disabled) {
      background: ${Color.Red100};
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
};
