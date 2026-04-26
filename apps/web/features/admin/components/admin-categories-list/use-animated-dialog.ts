"use client";

import { useEffect, useState, type RefObject } from "react";

interface UseAnimatedDialogOptions {
  isOpen: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  focusRef?: RefObject<HTMLElement | null>;
  resetScroll?: boolean;
}

const DIALOG_CLOSE_DELAY_MS = 180;

export function useAnimatedDialog({
  isOpen,
  dialogRef,
  focusRef,
  resetScroll = false,
}: UseAnimatedDialogOptions) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsVisible(false);

    const firstFrameId = requestAnimationFrame(() => {
      dialogRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (resetScroll) {
        dialogRef.current?.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }

      requestAnimationFrame(() => {
        setIsVisible(true);
        focusRef?.current?.focus({
          preventScroll: true,
        });
      });
    });

    return () => {
      cancelAnimationFrame(firstFrameId);
    };
  }, [dialogRef, focusRef, isOpen, resetScroll]);

  const hide = (onHidden?: () => void) => {
    setIsVisible(false);

    window.setTimeout(() => {
      onHidden?.();
    }, DIALOG_CLOSE_DELAY_MS);
  };

  return {
    isVisible,
    hide,
  };
}
