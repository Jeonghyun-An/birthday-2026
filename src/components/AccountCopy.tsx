'use client';

import { useRef, useState } from 'react';
import { script } from '@/config/script';

type CopyStatus = 'idle' | 'copied' | 'fallback';

export function AccountCopy({ number }: { number: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<CopyStatus>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      setStatus('copied');
    } catch {
      const element = numberRef.current;
      const selection = window.getSelection();
      if (element && selection) selection.selectAllChildren(element);
      setStatus('fallback');
    }
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
      {status === 'fallback' && (
        <p role="status" className="text-sm text-rose-deep">
          {script.done.copyFallback}
        </p>
      )}
    </div>
  );
}
