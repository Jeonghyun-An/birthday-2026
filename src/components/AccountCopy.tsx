'use client';

import { useEffect, useRef, useState } from 'react';
import { script } from '@/config/script';

type CopyStatus = 'idle' | 'copied' | 'fallback';

const COPIED_RESET_MS = 2000;

export function AccountCopy({ number }: { number: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const resetTimer = useRef<number | null>(null);
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  function showCopied() {
    setStatus('copied');
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setStatus('idle'), COPIED_RESET_MS);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      showCopied();
      return;
    } catch {
      // 아래에서 선택 후 execCommand로 다시 시도
    }
    const element = numberRef.current;
    const selection = window.getSelection();
    if (element && selection) selection.selectAllChildren(element);
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    if (copied) showCopied();
    else setStatus('fallback');
  }

  return (
    <div className="space-y-2">
      <span
        ref={numberRef}
        className="block select-all font-title text-xl font-bold tracking-wide text-ink"
      >
        {number}
      </span>
      <button type="button" onClick={copy} className="btn-ghost w-full">
        {status === 'copied' ? script.done.copied : script.done.copy}
      </button>
      <p role="status" className="min-h-5 text-sm text-rose-deep">
        {status === 'fallback' ? script.done.copyFallback : ''}
      </p>
    </div>
  );
}
