'use client';

import { useEffect, useState } from 'react';
import type { GiftTitle } from '@/config/script';
import { nextIndex } from '@/lib/rotation';

const ROTATE_MS = 3500;

/** 선물의 '보물 이름'과 한마디를 몇 초마다 다른 톤으로 바꿔 보여 준다. */
export function GiftTitleRotator({ titles }: { titles: GiftTitle[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (titles.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => nextIndex(i, titles.length)), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [titles.length]);

  const current = titles[index];

  return (
    <div className="min-h-36">
      <div key={index} className="title-swap">
        <h1 className="font-title text-2xl leading-snug font-bold">{current.title}</h1>
        <p className="mt-2 text-ink-soft">“{current.quote}”</p>
      </div>
    </div>
  );
}
