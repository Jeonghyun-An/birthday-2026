'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { princess } from '@/config/princess';
import { script, type DialogueLine } from '@/config/script';
import { advance, initialDialogue, isTyping, tick, visibleText } from '@/lib/dialogue';

const TYPE_INTERVAL_MS = 45;

type Props = {
  lines: DialogueLine[];
  onHelp: () => void;
  onListen: () => void;
  onSkip: () => void;
};

export function DialogueScene({ lines, onHelp, onListen, onSkip }: Props) {
  const [state, setState] = useState(initialDialogue);
  const line = lines[state.index];
  const typing = isTyping(state, lines);

  useEffect(() => {
    if (!typing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = window.setTimeout(() => setState((s) => advance(s, lines)), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => setState((s) => tick(s, lines)), TYPE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [typing, state.index, lines]);

  return (
    <section className="royal-frame overflow-hidden">
      <div className="flex justify-end px-4 pt-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-ink-soft underline underline-offset-4"
        >
          {script.dialogue.skip}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setState((s) => advance(s, lines))}
        disabled={state.choosing}
        aria-label={script.dialogue.next}
        className="mt-2 block w-full text-left disabled:cursor-default"
      >
        <div className="relative">
          <Image
            src={princess.images[line.image]}
            alt=""
            width={800}
            height={1000}
            loading="eager"
            className="h-auto w-full"
          />
          {line.showGift && (
            <Image
              src={princess.images.gift}
              alt={princess.gift.name}
              width={600}
              height={600}
              loading="eager"
              className="gift-pop absolute top-4 right-4 w-28 rounded-xl border-2 border-gold bg-white shadow-lg"
            />
          )}
        </div>

        {!state.choosing && (
          <div
            aria-hidden="true"
            className="relative m-4 min-h-28 rounded-2xl border-2 border-gold bg-white px-4 pt-6 pb-4"
          >
            <span className="absolute -top-3 left-4 rounded-full bg-rose px-3 py-0.5 text-xs font-bold text-white">
              {script.dialogue.speaker}
            </span>
            <p className="text-lg leading-relaxed">
              {visibleText(line.text, state.typed)}
            </p>
            {!typing && (
              <span className="absolute right-3 bottom-2 animate-bounce text-rose">
                ▼
              </span>
            )}
          </div>
        )}
      </button>
      <p className="sr-only" aria-live="polite">
        {state.typed === 0 ? '' : `${script.dialogue.speaker}: ${line.text}`}
      </p>

      {state.choosing ? (
        <div className="m-4 space-y-3">
          <button type="button" onClick={onHelp} className="btn-royal w-full">
            {script.dialogue.choices.help}
          </button>
          <button type="button" onClick={onListen} className="btn-ghost w-full">
            {script.dialogue.choices.listen}
          </button>
        </div>
      ) : (
        <p className="pb-4 text-center text-xs text-ink-soft">{script.dialogue.tapHint}</p>
      )}
    </section>
  );
}
