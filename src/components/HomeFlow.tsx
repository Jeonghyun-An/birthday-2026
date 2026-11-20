'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { script } from '@/config/script';
import { Cover } from './Cover';
import { DialogueScene } from './DialogueScene';

export type Stage = 'cover' | 'dialogue' | 'funding';

type Props = {
  initialStage: Stage;
  funding: ReactNode;
};

export function HomeFlow({ initialStage, funding }: Props) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const router = useRouter();

  const goTo = (next: Stage) => {
    setStage(next);
    window.scrollTo({ top: 0 });
  };

  if (stage === 'cover') return <Cover onStart={() => goTo('dialogue')} />;

  if (stage === 'dialogue') {
    return (
      <DialogueScene
        lines={script.dialogue.lines}
        onHelp={() => router.push('/give')}
        onListen={() => goTo('funding')}
        onSkip={() => goTo('funding')}
      />
    );
  }

  return <>{funding}</>;
}
