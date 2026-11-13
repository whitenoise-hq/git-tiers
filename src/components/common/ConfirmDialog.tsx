'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { Color } from '@/styles/color';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => Promise<void> | void;
  readonly onClose: () => void;
}

/**
 * 한 번 더 묻는 확인창(예: 로그아웃).
 * 브라우저 기본 <dialog>(showModal)라 최상위에 뜨고 Esc·바깥 클릭으로 닫힌다.
 */
export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    if (!pending) onClose();
  };

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <S.Dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}>
      <S.Body>
        <S.Title id="confirm-dialog-title">{title}</S.Title>
        {description && <S.Description>{description}</S.Description>}
        <S.Actions>
          <S.Cancel type="button" onClick={handleClose} disabled={pending}>
            {cancelLabel}
          </S.Cancel>
          <S.Confirm
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            autoFocus>
            {confirmLabel}
          </S.Confirm>
        </S.Actions>
      </S.Body>
    </S.Dialog>
  );
};

const S = {
  Dialog: styled.dialog`
    /* 전역 리셋(* { margin: 0 })이 기본 가운데 정렬을 지우므로 다시 지정한다. */
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(360px, calc(100vw - 32px));
    height: fit-content;
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

  Body: styled.div`
    padding: 26px 22px 20px;
  `,

  Title: styled.h3`
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  `,

  Description: styled.p`
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.55;
    color: ${Color.Gray100};
  `,

  Actions: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 22px;
  `,

  Cancel: styled.button`
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    color: ${Color.Gray100};
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 980px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.14);
    }
  `,

  Confirm: styled.button`
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: ${Color.Link};
    border: none;
    border-radius: 980px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: ${Color.LinkHover};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
};
