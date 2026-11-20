import Image from 'next/image';
import { princess } from '@/config/princess';
import { script } from '@/config/script';

export function Cover({ onStart }: { onStart: () => void }) {
  return (
    <section className="royal-frame overflow-hidden">
      <div className="relative">
        <Image
          src={princess.images.cover}
          alt={`${princess.princessName} 표지`}
          width={800}
          height={1000}
          loading="eager"
          className="h-auto w-full"
        />
        <div className="absolute inset-x-0 top-0 bg-linear-to-b from-petal via-petal/80 to-transparent px-5 pt-6 pb-16 text-center">
          <p className="eyebrow">{script.cover.subtitle}</p>
          <h1 className="mt-2 font-title text-2xl leading-snug font-bold text-ink">
            《{princess.coverTitle}》
          </h1>
        </div>
      </div>
      <div className="p-5">
        <button type="button" onClick={onStart} className="btn-royal w-full">
          {script.cover.start}
        </button>
      </div>
    </section>
  );
}
