# 박봉의 거지공주 생일선물 펀딩 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 친구들이 링크 하나로 로판풍 인트로를 보고, 생일선물 값을 약속(저장)한 뒤, 내 계좌로 직접 송금하게 하는 1인용 펀딩 페이지를 만든다.

**Architecture:** Next.js 16 App Router(Cache Components 기본 켜짐) 위에 화면을 만들고, 보태기 기록은 Supabase `contributions` 테이블 하나에 서버에서만 읽고 쓴다. 계산·검사·대화 진행 로직은 순수 함수로 분리해 Vitest로 테스트하고, 화면은 그 함수를 조립만 한다. 내용(이름, 계좌, 대사)은 설정 파일 두 개에 모은다.

**Tech Stack:** Next.js 16.4 (React 19.3, Turbopack), TypeScript, Tailwind CSS 4, Supabase(`@supabase/supabase-js` 2), Vitest, Vercel

**설계 문서:** `docs/superpowers/specs/2026-11-20-birthday-princess-funding-design.md`

---

## 시작 전에 알아둘 것

- **명령은 Git Bash 기준**이다. 작업 폴더는 저장소 루트(`birthday-2026/`).
- **Next.js 16.4는 예전 Next.js와 다르다.** `create-next-app`이 만드는 `next.config.ts`에 `cacheComponents: true`가 켜져 있다. 그래서:
  - `export const dynamic = 'force-dynamic'` 같은 route segment config는 **쓸 수 없다**.
  - 요청마다 달라지는 데이터(DB 조회, `searchParams`, `new Date()`)는 `<Suspense>` 안의 async 컴포넌트에서 다루고, `new Date()` 전에는 `await connection()`(`next/server`)을 호출한다. 안 그러면 빌드 오류가 난다.
  - 막히면 `node_modules/next/dist/docs/01-app/`의 문서를 먼저 읽는다(`01-getting-started/08-caching.md`, `03-api-reference/04-functions/connection.md`, `02-guides/forms.md`).
- `next dev`가 `AGENTS.md`를 만들거나 다시 쓴다. 그대로 커밋한다.
- **커밋 메시지**는 모든 커밋에서 아래 형식을 쓴다.
  ```bash
  git commit -m "<메시지>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```
- 테스트는 `npm test`(= `vitest run`). 특정 파일만: `npx vitest run src/lib/dday.test.ts`.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/config/princess.ts` | 공주 이름, 표지 제목, 생일, 선물, 목표 금액, 계좌, 토스 아이디, 그림 경로 |
| `src/config/script.ts` | 대사, 선택지, 금액 프리셋, 화면 문구, 오류 문구 (전부 공주 말투) |
| `src/lib/format.ts` | 금액을 `5,000원`으로 표시 |
| `src/lib/dday.ts` | 한국 날짜 기준 D-day 라벨 |
| `src/lib/progress.ts` | 합계, 퍼센트, 백마 위치, 달성 여부 |
| `src/lib/validation.ts` | 폼 입력 검사, 금액 파싱, 함정 칸 판별 |
| `src/lib/dialogue.ts` | 대화 진행 상태 전이(타이핑, 탭, 선택지) |
| `src/lib/transfer.ts` | 토스 송금 링크 만들기 |
| `src/lib/repo.ts` | 기록 저장소 인터페이스와 타입 (타입만) |
| `src/lib/supabase-repo.ts` | Supabase 구현 (서버 전용) |
| `src/app/give/submit.ts` | 제출 처리 핵심 로직(저장소 주입식, 테스트 대상) |
| `src/app/give/actions.ts` | 서버 액션: 핵심 로직 호출 → 이동 |
| `src/app/give/GiveForm.tsx` | 보태기 폼 (클라이언트) |
| `src/app/give/page.tsx` | `/give` |
| `src/app/give/done/page.tsx` | `/give/done` 송금 안내 |
| `src/app/page.tsx` | `/` 표지 → 대화 → 펀딩 |
| `src/app/layout.tsx` | 폰트, 메타데이터 |
| `src/app/globals.css` | 테마 색, 공용 클래스 |
| `src/app/opengraph-image.tsx` | 카톡 링크 미리보기 이미지 |
| `src/components/Cover.tsx` | 표지 |
| `src/components/DialogueScene.tsx` | 대화 장면 (클라이언트) |
| `src/components/HomeFlow.tsx` | 표지/대화/펀딩 단계 전환 (클라이언트) |
| `src/components/FundingSection.tsx` | 펀딩 섹션 |
| `src/components/HorseProgress.tsx` | 백마 진행률 SVG |
| `src/components/BenefactorList.tsx` | 은인 명부 |
| `src/components/AccountCopy.tsx` | 계좌번호 복사 (클라이언트) |
| `supabase/schema.sql` | 테이블·보안 설정 SQL |
| `scripts/make-placeholders.mjs` | 임시 그림 6장 생성 |
| `public/images/*.svg` | 임시 그림 |
| `assets/GowunBatang-Bold.ttf`, `assets/OFL.txt` | 미리보기 이미지용 폰트와 라이선스 |
| `docs/image-prompts.md` | AI 그림 생성 가이드와 프롬프트 |

---

### Task 1: 프로젝트 뼈대

**Files:**
- Create: Next.js 기본 파일 일체(`create-next-app`), `vitest.config.mts`
- Modify: `package.json`, `.gitignore`, `src/app/page.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

- [ ] **Step 1: Next.js 앱 생성**

저장소 루트(`.git`과 `docs/`만 있는 상태)에서 실행한다.

```bash
npx --yes create-next-app@16.4.6 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
```

Expected: `Success! Created birthday-2026 ...`. 폴더가 비어 있지 않다는 오류가 나면, 상위 폴더에 `birthday-tmp`로 같은 명령을 실행한 뒤 그 안의 파일(숨김 파일 포함, `node_modules` 포함)을 저장소 루트로 옮기고 `birthday-tmp`를 지운다.

- [ ] **Step 2: 의존성 추가**

```bash
npm install @supabase/supabase-js server-only
npm install -D vitest
```

- [ ] **Step 3: 기본 그림 삭제와 임시 홈 화면**

```bash
rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

`src/app/page.tsx`를 통째로 바꾼다.

```tsx
export default function HomePage() {
  return <main>공주 준비 중…</main>;
}
```

- [ ] **Step 4: Vitest 설정**

`vitest.config.mts`를 만든다.

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

`package.json`에 테스트 스크립트를 추가한다.

```bash
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 5: `.env.example`을 git에 올릴 수 있게**

`.gitignore`의 `.env*` 줄 바로 아래에 한 줄을 추가한다.

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

- [ ] **Step 6: 빌드와 린트 확인**

```bash
npm run build
npm run lint
```

Expected: 둘 다 오류 없이 끝난다.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with Vitest" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 설정 파일

**Files:**
- Create: `src/config/princess.ts`, `src/config/script.ts`

- [ ] **Step 1: 공주 설정 작성**

`src/config/princess.ts` — 값은 예시다. Task 19에서 실제 값으로 바꾼다.

```ts
export type PrincessImages = {
  cover: string;
  waiting: string;
  surprised: string;
  pleading: string;
  touched: string;
  gift: string;
};

export type PrincessConfig = {
  /** 화면에 보이는 공주 이름 */
  princessName: string;
  /** 표지와 링크 미리보기에 쓰는 긴 제목 (《》 없이) */
  coverTitle: string;
  /** 생일, 한국 날짜 YYYY-MM-DD */
  birthday: string;
  gift: { name: string; link: string | null };
  /** 목표 금액(원) */
  goalAmount: number;
  account: { bank: string; number: string; holder: string };
  /** toss.me 아이디. 없으면 null */
  tossId: string | null;
  /** public 폴더 기준 그림 경로 */
  images: PrincessImages;
};

export const princess: PrincessConfig = {
  princessName: '거지공주',
  coverTitle: '박봉의 거지공주는 오늘도 백마 탄 왕자님을 기다립니다',
  birthday: '2026-12-31',
  gift: { name: '디올 포에버 쿠션 케이스 골든 메달리온', link: null },
  goalAmount: 200000,
  account: { bank: '○○은행', number: '000-0000-0000', holder: '예금주' },
  tossId: null,
  images: {
    cover: '/images/cover.svg',
    waiting: '/images/waiting.svg',
    surprised: '/images/surprised.svg',
    pleading: '/images/pleading.svg',
    touched: '/images/touched.svg',
    gift: '/images/gift.svg',
  },
};
```

- [ ] **Step 2: 대본과 문구 작성**

`src/config/script.ts`

```ts
export type SceneImage = 'waiting' | 'surprised' | 'pleading';

export type DialogueLine = {
  image: SceneImage;
  text: string;
  /** true면 선물 사진이 장면 위에 뜬다 */
  showGift?: boolean;
};

export type Preset = { label: string; amount: number };

const dialogueLines: DialogueLine[] = [
  { image: 'waiting', text: '…오늘도 안 오시네요. 백마 탄 왕자님.' },
  { image: 'waiting', text: '우리 왕국은 너무 가난해서… 공주 월급도 박봉이에요.' },
  { image: 'surprised', text: '앗, 손님이다! 혹시 왕자님…? 아, 아니시구나…' },
  { image: 'surprised', text: '사실 생일이 다가오는데… 꼭 갖고 싶은 게 있어요.', showGift: true },
  {
    image: 'pleading',
    text: '박봉으로는 도저히 무리라서요… 아주 조금만 보태 주실 수 있을까요?',
    showGift: true,
  },
];

const presets: Preset[] = [
  { label: '빵 한 조각', amount: 5000 },
  { label: '따뜻한 수프', amount: 15000 },
  { label: '성 난방비', amount: 30000 },
];

export const script = {
  loading: '공주가 은인 명부를 펼치는 중…',
  cover: {
    subtitle: '로맨스 판타지 · 생일 특별편',
    start: '1화 보기',
  },
  dialogue: {
    speaker: '공주',
    skip: '건너뛰기',
    next: '다음 대사',
    tapHint: '화면을 누르면 다음으로 넘어가요',
    lines: dialogueLines,
    choices: {
      help: '가엾은 공주를 돕는다',
      listen: '일단 사정을 더 들어본다',
    },
  },
  funding: {
    birthdayLabel: (name: string) => `${name}의 생일`,
    quote: '왕자님 대신… 조금만 도와주시면 평생 잊지 않을게요.',
    giftLink: '상품 보러 가기',
    progressLabel: '백마 진행률',
    goalLabel: '목표',
    helpButton: '공주님 도와주기',
    benefactorsTitle: '은인 명부',
    benefactorsCount: (count: number) => `${count}명`,
    emptyBenefactors: '아직 은인이 없어요… 첫 번째 은인이 되어 주실래요?',
    completeLine: '왕자님은 안 오셨지만… 여러분이 제 백마였어요 ㅠㅠ',
  },
  presets,
  give: {
    title: '공주님 도와주기',
    back: '공주에게 돌아가기',
    nameLabel: '이름',
    namePlaceholder: '은인 명부에 적힐 이름',
    messageLabel: '공주에게 한마디 (선택)',
    messagePlaceholder: '생일 축하해요, 공주님!',
    amountLabel: '얼마나 도와주실래요?',
    customAmountLabel: '직접 입력',
    customAmountPlaceholder: '예: 20000',
    submit: '도와주기',
    submitting: '전하는 중…',
    note: '돈은 공주에게 직접 가요. 다음 화면에서 보내는 방법을 알려 드려요.',
  },
  done: {
    title: '은혜는 잊지 않을게요…',
    amountLine: (won: string) => `${won}을 아래 계좌로 보내 주세요`,
    bankLabel: '은행',
    holderLabel: '예금주',
    copy: '계좌번호 복사',
    copied: '복사했어요!',
    copyFallback: '복사가 막혀 있어요. 계좌번호를 길게 눌러 복사해 주세요.',
    toss: '토스로 보내기',
    back: '은인 명부 보러 가기',
  },
  errors: {
    nameRequired: '이름을 알려 주셔야 은인 명부에 적을 수 있어요…',
    nameTooLong: '이름은 20자까지만 적을 수 있어요…',
    messageTooLong: '한마디는 100자까지만 받을 수 있어요…',
    amountInvalid: '1,000원부터 1,000,000원까지 받을 수 있어요…',
    saveFailed: '앗, 왕국 우체부가 길을 잃었어요. 한 번만 다시 눌러 주세요.',
    listFailed: '명부를 잠시 못 찾고 있어요…',
  },
};
```

- [ ] **Step 3: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 출력 없음(오류 없음).

- [ ] **Step 4: 커밋**

```bash
git add src/config
git commit -m "feat: add princess config and script" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: 테마, 폰트, 레이아웃, 임시 그림

**Files:**
- Create: `scripts/make-placeholders.mjs`, `public/images/*.svg`(스크립트가 생성)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: 테마 CSS**

`src/app/globals.css`를 통째로 바꾼다.

```css
@import "tailwindcss";

@theme inline {
  --font-title: var(--font-gowun-batang), "Nanum Myeongjo", serif;
  --font-body: var(--font-gowun-dodum), "Apple SD Gothic Neo", sans-serif;
}

@theme {
  --color-blush: #ffe4ef;
  --color-petal: #fff5f9;
  --color-rose: #e8559a;
  --color-rose-deep: #b8336f;
  --color-gold: #c9972e;
  --color-gold-soft: #f3dfa8;
  --color-ink: #4a2b33;
  --color-ink-soft: #8a6470;
}

body {
  background-color: var(--color-blush);
  background-image: radial-gradient(circle at 1px 1px, #f7c6da 1px, transparent 0);
  background-size: 22px 22px;
  color: var(--color-ink);
  font-family: var(--font-body);
}

@layer components {
  .page {
    margin-inline: auto;
    width: 100%;
    max-width: 420px;
    padding: 24px 16px 48px;
  }
  .royal-frame {
    background: var(--color-petal);
    border: 2px solid var(--color-gold);
    border-radius: 1.25rem;
    box-shadow: 0 0 0 4px var(--color-petal), 0 0 0 6px var(--color-gold);
  }
  .btn-royal {
    display: block;
    text-align: center;
    border-radius: 9999px;
    border: 2px solid var(--color-gold);
    background: var(--color-rose);
    color: #fff;
    font-family: var(--font-title);
    font-weight: 700;
    font-size: 1.125rem;
    padding: 0.75rem 1.25rem;
    transition: background-color 0.15s;
  }
  .btn-royal:hover {
    background: var(--color-rose-deep);
  }
  .btn-royal:disabled {
    opacity: 0.7;
    cursor: progress;
  }
  .btn-ghost {
    display: block;
    text-align: center;
    border-radius: 9999px;
    border: 2px solid var(--color-gold-soft);
    background: #fff;
    color: var(--color-ink);
    padding: 0.7rem 1.25rem;
  }
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  .field {
    width: 100%;
    border-radius: 0.75rem;
    border: 2px solid var(--color-gold-soft);
    background: #fff;
    padding: 0.7rem 0.9rem;
    font-size: 1rem;
  }
  .field:focus {
    outline: none;
    border-color: var(--color-rose);
  }
  .field-error {
    margin-top: 0.4rem;
    font-size: 0.875rem;
    color: var(--color-rose-deep);
  }
  .option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 0.75rem;
    border: 2px solid var(--color-gold-soft);
    background: #fff;
    padding: 0.75rem 1rem;
    cursor: pointer;
  }
  .option:has(input:checked) {
    border-color: var(--color-rose);
    background: var(--color-blush);
  }
  .notice {
    text-align: center;
    color: var(--color-ink-soft);
    font-size: 0.9rem;
  }
  .eyebrow {
    font-size: 0.8rem;
    color: var(--color-gold);
    letter-spacing: 0.05em;
  }
  .back-link {
    font-size: 0.9rem;
    color: var(--color-ink-soft);
  }
}

@keyframes gift-pop {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.gift-pop {
  animation: gift-pop 0.5s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .gift-pop {
    animation: none;
  }
}
```

- [ ] **Step 2: 레이아웃과 메타데이터**

`src/app/layout.tsx`를 통째로 바꾼다.

```tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Gowun_Batang, Gowun_Dodum } from 'next/font/google';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import './globals.css';

const titleFont = Gowun_Batang({
  weight: ['400', '700'],
  variable: '--font-gowun-batang',
  preload: false,
  display: 'swap',
});

const bodyFont = Gowun_Dodum({
  weight: '400',
  variable: '--font-gowun-dodum',
  preload: false,
  display: 'swap',
});

function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : 'http://localhost:3000');
}

const title = `《${princess.coverTitle}》`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title,
  description: script.funding.quote,
  openGraph: {
    title,
    description: script.funding.quote,
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffe4ef',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`의 임시 화면에 테마를 입힌다.

```tsx
export default function HomePage() {
  return (
    <main className="page">
      <p className="royal-frame p-6 text-center font-title text-xl">공주 준비 중…</p>
    </main>
  );
}
```

- [ ] **Step 3: 임시 그림 생성 스크립트**

`scripts/make-placeholders.mjs`

```js
import { mkdir, writeFile } from 'node:fs/promises';

const scenes = [
  { file: 'cover', label: '표지', note: '상반신 · 꽃 · 반짝이 · 위쪽 제목 여백', w: 800, h: 1000 },
  { file: 'waiting', label: '창가에서 기다리는 공주', note: '그림 자리 (임시)', w: 800, h: 1000 },
  { file: 'surprised', label: '돌아보며 놀란 공주', note: '그림 자리 (임시)', w: 800, h: 1000 },
  { file: 'pleading', label: '두 손 모아 부탁하는 공주', note: '그림 자리 (임시)', w: 800, h: 1000 },
  { file: 'touched', label: '감동한 공주', note: '그림 자리 (임시)', w: 800, h: 1000 },
  { file: 'gift', label: '선물 사진', note: '사진 자리 (임시)', w: 600, h: 600 },
];

function crown(cx, cy) {
  return `<path d="M${cx - 60} ${cy + 30} L${cx - 60} ${cy - 20} L${cx - 30} ${cy + 5} L${cx} ${cy - 40} L${cx + 30} ${cy + 5} L${cx + 60} ${cy - 20} L${cx + 60} ${cy + 30} Z" fill="#F3DFA8" stroke="#C9972E" stroke-width="6" stroke-linejoin="round"/>`;
}

function svg({ label, note, w, h }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect width="${w}" height="${h}" fill="#FFE4EF"/>
<rect x="24" y="24" width="${w - 48}" height="${h - 48}" rx="32" fill="#FFF5F9" stroke="#C9972E" stroke-width="6"/>
${crown(w / 2, h / 2 - 60)}
<text x="${w / 2}" y="${h / 2 + 60}" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="700" fill="#4A2B33">${label}</text>
<text x="${w / 2}" y="${h / 2 + 110}" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#8A6470">${note}</text>
</svg>
`;
}

await mkdir('public/images', { recursive: true });
for (const scene of scenes) {
  await writeFile(`public/images/${scene.file}.svg`, svg(scene), 'utf8');
}
console.log(`임시 그림 ${scenes.length}장을 public/images에 만들었어요`);
```

- [ ] **Step 4: 임시 그림 생성**

```bash
node scripts/make-placeholders.mjs
ls public/images
```

Expected: `임시 그림 6장을 public/images에 만들었어요`, 그리고 `cover.svg gift.svg pleading.svg surprised.svg touched.svg waiting.svg`.

- [ ] **Step 5: 화면 확인**

```bash
npm run build
npm run dev
```

브라우저에서 `http://localhost:3000`을 연다. Expected: 분홍 점무늬 배경 위에 금테 카드, 명조체 "공주 준비 중…". `http://localhost:3000/images/cover.svg`에 왕관 그림이 보인다. 확인 후 dev 서버를 끈다.

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: add royal pink theme, fonts and placeholder art" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 금액 표시 `formatWon`

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { formatWon } from './format';

describe('formatWon', () => {
  it('천 단위 쉼표와 "원"을 붙인다', () => {
    expect(formatWon(5000)).toBe('5,000원');
    expect(formatWon(1000000)).toBe('1,000,000원');
  });

  it('0원도 표시한다', () => {
    expect(formatWon(0)).toBe('0원');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL — `Failed to resolve import "./format"` 또는 `formatWon is not a function`.

- [ ] **Step 3: 구현**

`src/lib/format.ts`

```ts
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: add won formatter" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: D-day 라벨 `ddayLabel`

**Files:**
- Create: `src/lib/dday.ts`
- Test: `src/lib/dday.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { ddayLabel } from './dday';

const BIRTHDAY = '2026-12-31';

describe('ddayLabel', () => {
  it('생일 전이면 D-N', () => {
    // 2026-11-20 12:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-11-20T03:00:00Z'))).toBe('D-41');
  });

  it('한국 시간 자정 직전까지는 하루 전', () => {
    // 2026-12-30 23:59:59 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-30T14:59:59Z'))).toBe('D-1');
  });

  it('한국 시간 자정이 지나면 당일', () => {
    // 2026-12-31 00:00:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-30T15:00:00Z'))).toBe('D-DAY');
  });

  it('생일 당일 밤에도 당일', () => {
    // 2026-12-31 23:59:59 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-31T14:59:59Z'))).toBe('D-DAY');
  });

  it('생일이 지나면 D+N', () => {
    // 2027-01-02 00:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2027-01-01T15:00:00Z'))).toBe('D+2');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/dday.test.ts`
Expected: FAIL — `./dday`를 찾지 못함.

- [ ] **Step 3: 구현**

`src/lib/dday.ts`

```ts
const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** birthday는 한국 날짜 YYYY-MM-DD. now의 한국 날짜와 비교한다. */
export function ddayLabel(birthday: string, now: Date): string {
  const [year, month, day] = birthday.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const diff = Math.round((target - today) / DAY_MS);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-DAY';
  return `D+${-diff}`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/dday.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/dday.ts src/lib/dday.test.ts
git commit -m "feat: add KST-based D-day label" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 진행률 `sumAmounts`, `getProgress`

**Files:**
- Create: `src/lib/progress.ts`
- Test: `src/lib/progress.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { getProgress, sumAmounts } from './progress';

describe('sumAmounts', () => {
  it('빈 목록은 0', () => {
    expect(sumAmounts([])).toBe(0);
  });

  it('금액을 모두 더한다', () => {
    expect(sumAmounts([{ amount: 5000 }, { amount: 15000 }])).toBe(20000);
  });
});

describe('getProgress', () => {
  it('아무도 안 보탰으면 0%', () => {
    expect(getProgress(0, 200000)).toEqual({ total: 0, percent: 0, position: 0, complete: false });
  });

  it('퍼센트는 내림해서 목표 직전엔 100%가 되지 않는다', () => {
    expect(getProgress(199999, 200000)).toEqual({
      total: 199999,
      percent: 99,
      position: 99,
      complete: false,
    });
  });

  it('목표와 같으면 100%이고 달성', () => {
    expect(getProgress(200000, 200000)).toEqual({
      total: 200000,
      percent: 100,
      position: 100,
      complete: true,
    });
  });

  it('목표를 넘으면 실제 퍼센트를 보이고 위치는 100에서 멈춘다', () => {
    expect(getProgress(224000, 200000)).toEqual({
      total: 224000,
      percent: 112,
      position: 100,
      complete: true,
    });
  });

  it('목표가 0 이하이면 0%로 방어한다', () => {
    expect(getProgress(5000, 0)).toEqual({ total: 5000, percent: 0, position: 0, complete: false });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: FAIL — `./progress`를 찾지 못함.

- [ ] **Step 3: 구현**

`src/lib/progress.ts`

```ts
export type Progress = {
  total: number;
  /** 표시용 실제 퍼센트(내림). 100을 넘을 수 있다. */
  percent: number;
  /** 백마 위치용 0~100 */
  position: number;
  complete: boolean;
};

export function sumAmounts(items: ReadonlyArray<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function getProgress(total: number, goal: number): Progress {
  if (goal <= 0) return { total, percent: 0, position: 0, complete: false };
  const percent = Math.floor((total / goal) * 100);
  return {
    total,
    percent,
    position: Math.min(Math.max(percent, 0), 100),
    complete: total >= goal,
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/progress.ts src/lib/progress.test.ts
git commit -m "feat: add progress calculation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 입력 검사 `parseAmount`, `validateGive`

**Files:**
- Create: `src/lib/validation.ts`
- Test: `src/lib/validation.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { script } from '@/config/script';
import { parseAmount, validateGive, type RawGiveForm } from './validation';

const form = (overrides: Partial<RawGiveForm> = {}): RawGiveForm => ({
  name: '예준',
  message: '',
  amountChoice: '15000',
  customAmount: '',
  website: '',
  ...overrides,
});

describe('parseAmount', () => {
  it('숫자, 쉼표, "원"을 허용한다', () => {
    expect(parseAmount('15000')).toBe(15000);
    expect(parseAmount('1,000')).toBe(1000);
    expect(parseAmount('15000원')).toBe(15000);
    expect(parseAmount(' 20,000 ')).toBe(20000);
  });

  it('범위 경계를 지킨다', () => {
    expect(parseAmount('999')).toBeNull();
    expect(parseAmount('1000')).toBe(1000);
    expect(parseAmount('1000000')).toBe(1000000);
    expect(parseAmount('1000001')).toBeNull();
  });

  it('숫자가 아니면 null', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('1.5')).toBeNull();
    expect(parseAmount('-1000')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
  });
});

describe('validateGive', () => {
  it('프리셋 금액이면 통과하고 빈 한마디는 null', () => {
    expect(validateGive(form())).toEqual({
      kind: 'ok',
      value: { name: '예준', message: null, amount: 15000 },
    });
  });

  it('이름과 한마디의 앞뒤 공백을 지운다', () => {
    expect(validateGive(form({ name: '  예준  ', message: '  축하해요  ' }))).toEqual({
      kind: 'ok',
      value: { name: '예준', message: '축하해요', amount: 15000 },
    });
  });

  it('직접 입력을 고르면 customAmount를 쓴다', () => {
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '20,000' }))).toEqual({
      kind: 'ok',
      value: { name: '예준', message: null, amount: 20000 },
    });
  });

  it('이름이 비거나 공백뿐이면 오류', () => {
    expect(validateGive(form({ name: '' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired },
    });
    expect(validateGive(form({ name: '   ' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired },
    });
  });

  it('이름은 20자까지 (이모지도 한 글자)', () => {
    expect(validateGive(form({ name: '가'.repeat(20) })).kind).toBe('ok');
    expect(validateGive(form({ name: '👑'.repeat(20) })).kind).toBe('ok');
    expect(validateGive(form({ name: '가'.repeat(21) }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameTooLong },
    });
  });

  it('한마디는 100자까지', () => {
    expect(validateGive(form({ message: '가'.repeat(100) })).kind).toBe('ok');
    expect(validateGive(form({ message: '가'.repeat(101) }))).toEqual({
      kind: 'invalid',
      errors: { message: script.errors.messageTooLong },
    });
  });

  it('금액이 범위 밖이거나 비면 오류', () => {
    const amountError = { kind: 'invalid', errors: { amount: script.errors.amountInvalid } };
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '999' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '1000001' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: '' }))).toEqual(amountError);
  });

  it('여러 오류를 한 번에 돌려준다', () => {
    expect(validateGive(form({ name: '', amountChoice: '' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired, amount: script.errors.amountInvalid },
    });
  });

  it('함정 칸이 채워지면 trap', () => {
    expect(validateGive(form({ website: 'http://spam.example' }))).toEqual({ kind: 'trap' });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/validation.test.ts`
Expected: FAIL — `./validation`을 찾지 못함.

- [ ] **Step 3: 구현**

`src/lib/validation.ts`

```ts
import { script } from '@/config/script';

export const AMOUNT_MIN = 1_000;
export const AMOUNT_MAX = 1_000_000;
export const NAME_MAX = 20;
export const MESSAGE_MAX = 100;

/** 폼에서 그대로 읽은 값. 없는 필드는 빈 문자열. */
export type RawGiveForm = {
  name: string;
  message: string;
  /** 프리셋 금액 문자열('5000' 등) 또는 'custom' */
  amountChoice: string;
  customAmount: string;
  /** 함정 칸. 사람은 비워 둔다. */
  website: string;
};

export type GiveInput = { name: string; message: string | null; amount: number };

export type FieldErrors = Partial<Record<'name' | 'message' | 'amount', string>>;

export type ValidationResult =
  | { kind: 'ok'; value: GiveInput }
  | { kind: 'invalid'; errors: FieldErrors }
  | { kind: 'trap' };

/** Postgres char_length와 같게 코드 포인트 단위로 센다. */
const charCount = (text: string) => [...text].length;

export function parseAmount(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[,\s원]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isSafeInteger(amount) || amount < AMOUNT_MIN || amount > AMOUNT_MAX) return null;
  return amount;
}

export function validateGive(raw: RawGiveForm): ValidationResult {
  if (raw.website.trim() !== '') return { kind: 'trap' };

  const errors: FieldErrors = {};

  const name = raw.name.trim();
  if (name === '') errors.name = script.errors.nameRequired;
  else if (charCount(name) > NAME_MAX) errors.name = script.errors.nameTooLong;

  const message = raw.message.trim();
  if (charCount(message) > MESSAGE_MAX) errors.message = script.errors.messageTooLong;

  const amount = parseAmount(raw.amountChoice === 'custom' ? raw.customAmount : raw.amountChoice);
  if (amount === null) errors.amount = script.errors.amountInvalid;

  if (amount === null || Object.keys(errors).length > 0) return { kind: 'invalid', errors };
  return { kind: 'ok', value: { name, message: message === '' ? null : message, amount } };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/validation.test.ts`
Expected: PASS (12 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/validation.ts src/lib/validation.test.ts
git commit -m "feat: add contribution form validation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: 대화 진행 상태 `dialogue`

**Files:**
- Create: `src/lib/dialogue.ts`
- Test: `src/lib/dialogue.test.ts`

규칙: 대사는 한 글자씩 나온다(`tick`). 화면을 누르면(`advance`) 타이핑 중이면 그 줄을 다 보여 주고, 다 나온 상태면 다음 줄로, 마지막 줄이면 선택지 상태(`choosing`)가 된다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { advance, initialDialogue, isTyping, tick, visibleText } from './dialogue';

const lines = [{ text: '안녕' }, { text: '공주예요' }];

describe('tick', () => {
  it('한 글자씩 늘린다', () => {
    expect(tick(initialDialogue, lines)).toEqual({ index: 0, typed: 1, choosing: false });
  });

  it('줄 길이를 넘지 않는다', () => {
    const full = { index: 0, typed: 2, choosing: false };
    expect(tick(full, lines)).toBe(full);
  });

  it('선택지 상태에서는 그대로', () => {
    const choosing = { index: 1, typed: 4, choosing: true };
    expect(tick(choosing, lines)).toBe(choosing);
  });
});

describe('advance', () => {
  it('타이핑 중이면 그 줄을 다 보여 준다', () => {
    expect(advance({ index: 0, typed: 1, choosing: false }, lines)).toEqual({
      index: 0,
      typed: 2,
      choosing: false,
    });
  });

  it('다 나왔으면 다음 줄로 넘어가고 처음부터 타이핑한다', () => {
    expect(advance({ index: 0, typed: 2, choosing: false }, lines)).toEqual({
      index: 1,
      typed: 0,
      choosing: false,
    });
  });

  it('마지막 줄이 다 나왔으면 선택지를 띄운다', () => {
    expect(advance({ index: 1, typed: 4, choosing: false }, lines)).toEqual({
      index: 1,
      typed: 4,
      choosing: true,
    });
  });

  it('선택지 상태에서는 그대로', () => {
    const choosing = { index: 1, typed: 4, choosing: true };
    expect(advance(choosing, lines)).toBe(choosing);
  });
});

describe('isTyping', () => {
  it('글자가 남아 있으면 true', () => {
    expect(isTyping({ index: 0, typed: 1, choosing: false }, lines)).toBe(true);
    expect(isTyping({ index: 0, typed: 2, choosing: false }, lines)).toBe(false);
    expect(isTyping({ index: 1, typed: 0, choosing: true }, lines)).toBe(false);
  });
});

describe('visibleText', () => {
  it('한글과 이모지를 글자 단위로 자른다', () => {
    expect(visibleText('공주예요', 2)).toBe('공주');
    expect(visibleText('👑공주', 1)).toBe('👑');
    expect(visibleText('공주', 10)).toBe('공주');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/dialogue.test.ts`
Expected: FAIL — `./dialogue`를 찾지 못함.

- [ ] **Step 3: 구현**

`src/lib/dialogue.ts`

```ts
export type DialogueState = {
  /** 지금 보여 주는 대사 번호 */
  index: number;
  /** 지금 줄에서 보여 준 글자 수 */
  typed: number;
  /** 선택지를 띄웠는지 */
  choosing: boolean;
};

type Lines = ReadonlyArray<{ text: string }>;

export const initialDialogue: DialogueState = { index: 0, typed: 0, choosing: false };

const lineLength = (text: string) => [...text].length;

export function visibleText(text: string, typed: number): string {
  return [...text].slice(0, typed).join('');
}

export function isTyping(state: DialogueState, lines: Lines): boolean {
  return !state.choosing && state.typed < lineLength(lines[state.index].text);
}

export function tick(state: DialogueState, lines: Lines): DialogueState {
  if (!isTyping(state, lines)) return state;
  return { ...state, typed: state.typed + 1 };
}

export function advance(state: DialogueState, lines: Lines): DialogueState {
  if (state.choosing) return state;
  const full = lineLength(lines[state.index].text);
  if (state.typed < full) return { ...state, typed: full };
  if (state.index < lines.length - 1) return { index: state.index + 1, typed: 0, choosing: false };
  return { ...state, choosing: true };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/dialogue.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/dialogue.ts src/lib/dialogue.test.ts
git commit -m "feat: add dialogue state transitions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: 토스 송금 링크 `tossUrl`

**Files:**
- Create: `src/lib/transfer.ts`
- Test: `src/lib/transfer.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { tossUrl } from './transfer';

describe('tossUrl', () => {
  it('토스 아이디가 없으면 null', () => {
    expect(tossUrl(null, 15000)).toBeNull();
    expect(tossUrl('', 15000)).toBeNull();
  });

  it('금액이 있으면 금액까지 채운다', () => {
    expect(tossUrl('princess', 15000)).toBe('https://toss.me/princess/15000');
  });

  it('금액이 없으면 아이디까지만', () => {
    expect(tossUrl('princess', null)).toBe('https://toss.me/princess');
  });

  it('한글 아이디는 인코딩한다', () => {
    expect(tossUrl('공주', 5000)).toBe('https://toss.me/%EA%B3%B5%EC%A3%BC/5000');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/transfer.test.ts`
Expected: FAIL — `./transfer`를 찾지 못함.

- [ ] **Step 3: 구현**

`src/lib/transfer.ts`

```ts
export function tossUrl(tossId: string | null, amount: number | null): string | null {
  if (!tossId) return null;
  const base = `https://toss.me/${encodeURIComponent(tossId)}`;
  return amount === null ? base : `${base}/${amount}`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/transfer.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/transfer.ts src/lib/transfer.test.ts
git commit -m "feat: add toss transfer link builder" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: 저장소 인터페이스, Supabase 구현, 스키마

**Files:**
- Create: `src/lib/repo.ts`, `src/lib/supabase-repo.ts`, `supabase/schema.sql`, `.env.example`

- [ ] **Step 1: 인터페이스(타입만)**

`src/lib/repo.ts`

```ts
export type Contribution = {
  id: string;
  name: string;
  message: string | null;
  amount: number;
  createdAt: string;
};

export type NewContribution = {
  name: string;
  message: string | null;
  amount: number;
};

export interface ContributionRepo {
  /** 최신순 */
  list(): Promise<Contribution[]>;
  add(input: NewContribution): Promise<void>;
}
```

- [ ] **Step 2: Supabase 구현(서버 전용)**

`src/lib/supabase-repo.ts`

```ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Contribution, ContributionRepo, NewContribution } from './repo';

export function getRepo(): ContributionRepo {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 없어요');
  }

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async list(): Promise<Contribution[]> {
      const { data, error } = await db
        .from('contributions')
        .select('id, name, message, amount, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        amount: row.amount,
        createdAt: row.created_at,
      }));
    },

    async add(input: NewContribution): Promise<void> {
      const { error } = await db.from('contributions').insert({
        name: input.name,
        message: input.message,
        amount: input.amount,
      });
      if (error) throw error;
    },
  };
}
```

- [ ] **Step 3: 스키마 SQL**

`supabase/schema.sql`

```sql
-- 은인 명부. Supabase 대시보드 > SQL Editor에서 한 번 실행한다.
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  message text check (message is null or char_length(message) <= 100),
  amount integer not null check (amount between 1000 and 1000000),
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 브라우저(anon/authenticated)는 접근 불가. 서버의 service role만 읽고 쓴다.
alter table public.contributions enable row level security;
revoke all on table public.contributions from anon, authenticated;
grant select, insert, update, delete on table public.contributions to service_role;

create index if not exists contributions_created_at_idx
  on public.contributions (created_at desc);
```

- [ ] **Step 4: 환경변수 예시**

`.env.example`

```bash
# Supabase 대시보드 > Project Settings > API Keys
SUPABASE_URL=https://your-project-ref.supabase.co
# Secret key(sb_secret_...) 또는 legacy service_role key. 절대 브라우저 코드에 쓰지 말 것.
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxx
```

- [ ] **Step 5: 타입과 린트 확인**

```bash
npx tsc --noEmit
npm run lint
```

Expected: 오류 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/repo.ts src/lib/supabase-repo.ts supabase/schema.sql .env.example
git commit -m "feat: add contribution repo backed by Supabase" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: 제출 처리 핵심 `handleSubmit`

**Files:**
- Create: `src/app/give/submit.ts`
- Test: `src/app/give/submit.test.ts`

`handleSubmit`은 저장소를 직접 만들지 않고 `getRepo` 함수를 받는다. 저장소 생성(환경변수 누락)까지 `try` 안에서 일어나야 "우체부" 안내로 처리되기 때문이다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { script } from '@/config/script';
import type { ContributionRepo, NewContribution } from '@/lib/repo';
import type { RawGiveForm } from '@/lib/validation';
import { handleSubmit, rawFromFormData } from './submit';

const form = (overrides: Partial<RawGiveForm> = {}): RawGiveForm => ({
  name: '예준',
  message: '',
  amountChoice: '15000',
  customAmount: '',
  website: '',
  ...overrides,
});

function fakeRepo() {
  const added: NewContribution[] = [];
  const repo: ContributionRepo = {
    list: async () => [],
    add: async (input) => {
      added.push(input);
    },
  };
  return { repo, added };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('handleSubmit', () => {
  it('검사를 통과하면 저장하고 금액을 담아 완료 화면으로 보낸다', async () => {
    const { repo, added } = fakeRepo();
    const outcome = await handleSubmit(form(), () => repo);
    expect(added).toEqual([{ name: '예준', message: null, amount: 15000 }]);
    expect(outcome).toEqual({ kind: 'redirect', to: '/give/done?amount=15000' });
  });

  it('검사에 실패하면 저장하지 않고 오류와 입력값을 돌려준다', async () => {
    const { repo, added } = fakeRepo();
    const raw = form({ name: '' });
    const outcome = await handleSubmit(raw, () => repo);
    expect(added).toEqual([]);
    expect(outcome).toEqual({
      kind: 'error',
      state: {
        status: 'error',
        errors: { name: script.errors.nameRequired },
        formError: null,
        values: raw,
      },
    });
  });

  it('함정 칸이 채워지면 저장하지 않고 완료 화면으로 보낸다', async () => {
    const { repo, added } = fakeRepo();
    const outcome = await handleSubmit(form({ website: 'spam' }), () => repo);
    expect(added).toEqual([]);
    expect(outcome).toEqual({ kind: 'redirect', to: '/give/done' });
  });

  it('저장이 실패하면 공주 말투 안내를 돌려준다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = form();
    const repo: ContributionRepo = {
      list: async () => [],
      add: async () => {
        throw new Error('db down');
      },
    };
    const outcome = await handleSubmit(raw, () => repo);
    expect(outcome).toEqual({
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    });
  });

  it('저장소를 만들 수 없어도(환경변수 누락) 같은 안내를 돌려준다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = form();
    const outcome = await handleSubmit(raw, () => {
      throw new Error('env missing');
    });
    expect(outcome).toEqual({
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    });
  });
});

describe('rawFromFormData', () => {
  it('폼 값을 읽고 없는 필드는 빈 문자열로 채운다', () => {
    const data = new FormData();
    data.set('name', '예준');
    data.set('amountChoice', 'custom');
    data.set('customAmount', '20000');
    expect(rawFromFormData(data)).toEqual({
      name: '예준',
      message: '',
      amountChoice: 'custom',
      customAmount: '20000',
      website: '',
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/app/give/submit.test.ts`
Expected: FAIL — `./submit`을 찾지 못함.

- [ ] **Step 3: 구현**

`src/app/give/submit.ts`

```ts
import { script } from '@/config/script';
import type { ContributionRepo } from '@/lib/repo';
import { validateGive, type FieldErrors, type RawGiveForm } from '@/lib/validation';

export type GiveFormState =
  | { status: 'idle' }
  | { status: 'error'; errors: FieldErrors; formError: string | null; values: RawGiveForm };

export type SubmitOutcome =
  | { kind: 'redirect'; to: string }
  | { kind: 'error'; state: GiveFormState };

export const initialGiveFormState: GiveFormState = { status: 'idle' };

export function rawFromFormData(formData: FormData): RawGiveForm {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
  };
  return {
    name: text('name'),
    message: text('message'),
    amountChoice: text('amountChoice'),
    customAmount: text('customAmount'),
    website: text('website'),
  };
}

export async function handleSubmit(
  raw: RawGiveForm,
  getRepo: () => ContributionRepo,
): Promise<SubmitOutcome> {
  const result = validateGive(raw);

  if (result.kind === 'trap') return { kind: 'redirect', to: '/give/done' };

  if (result.kind === 'invalid') {
    return {
      kind: 'error',
      state: { status: 'error', errors: result.errors, formError: null, values: raw },
    };
  }

  try {
    await getRepo().add(result.value);
  } catch (error) {
    console.error('보태기 저장 실패', error);
    return {
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    };
  }

  return { kind: 'redirect', to: `/give/done?amount=${result.value.amount}` };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/app/give/submit.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: 전체 테스트**

Run: `npm test`
Expected: 7개 파일 모두 PASS.

- [ ] **Step 6: 커밋**

```bash
git add src/app/give/submit.ts src/app/give/submit.test.ts
git commit -m "feat: add contribution submit handler" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: `/give` 보태기 폼

**Files:**
- Create: `src/app/give/actions.ts`, `src/app/give/GiveForm.tsx`, `src/app/give/page.tsx`

- [ ] **Step 1: 서버 액션**

`src/app/give/actions.ts`

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getRepo } from '@/lib/supabase-repo';
import { handleSubmit, rawFromFormData, type GiveFormState } from './submit';

export async function submitContribution(
  _previous: GiveFormState,
  formData: FormData,
): Promise<GiveFormState> {
  const outcome = await handleSubmit(rawFromFormData(formData), getRepo);
  if (outcome.kind === 'error') return outcome.state;
  revalidatePath('/');
  redirect(outcome.to);
}
```

- [ ] **Step 2: 폼 컴포넌트**

`src/app/give/GiveForm.tsx`

오류가 나면 서버가 돌려준 `values`로 입력값을 다시 채운다. React 19는 액션이 끝나면 폼을 리셋하는데, 이때 `defaultValue`/`defaultChecked`로 돌아가므로 입력값이 유지된다.

```tsx
'use client';

import { useActionState, useState } from 'react';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { MESSAGE_MAX, NAME_MAX } from '@/lib/validation';
import { submitContribution } from './actions';
import { initialGiveFormState } from './submit';

const DEFAULT_CHOICE = String(script.presets[1].amount);

export function GiveForm() {
  const [state, formAction, pending] = useActionState(submitContribution, initialGiveFormState);
  const values = state.status === 'error' ? state.values : null;
  const errors = state.status === 'error' ? state.errors : {};
  const initialChoice = values?.amountChoice || DEFAULT_CHOICE;
  const [choice, setChoice] = useState(initialChoice);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === 'error' && state.formError && (
        <p role="alert" className="rounded-xl bg-white px-4 py-3 text-rose-deep">
          {state.formError}
        </p>
      )}

      <div>
        <label htmlFor="name" className="label">
          {script.give.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={NAME_MAX}
          autoComplete="nickname"
          defaultValue={values?.name ?? ''}
          placeholder={script.give.namePlaceholder}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="field"
        />
        {errors.name && (
          <p id="name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="label">
          {script.give.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={MESSAGE_MAX}
          defaultValue={values?.message ?? ''}
          placeholder={script.give.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="field resize-none"
        />
        {errors.message && (
          <p id="message-error" className="field-error">
            {errors.message}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="label">{script.give.amountLabel}</legend>
        <div className="space-y-2">
          {script.presets.map((preset) => {
            const value = String(preset.amount);
            return (
              <label key={value} className="option">
                <input
                  type="radio"
                  name="amountChoice"
                  value={value}
                  required
                  defaultChecked={initialChoice === value}
                  onChange={() => setChoice(value)}
                  className="accent-rose"
                />
                <span className="flex-1">{preset.label}</span>
                <span className="text-ink-soft">{formatWon(preset.amount)}</span>
              </label>
            );
          })}
          <label className="option">
            <input
              type="radio"
              name="amountChoice"
              value="custom"
              defaultChecked={initialChoice === 'custom'}
              onChange={() => setChoice('custom')}
              className="accent-rose"
            />
            <span className="flex-1">{script.give.customAmountLabel}</span>
          </label>
          {choice === 'custom' && (
            <input
              name="customAmount"
              inputMode="numeric"
              pattern="[0-9,]*"
              required
              defaultValue={values?.customAmount ?? ''}
              placeholder={script.give.customAmountPlaceholder}
              aria-label={script.give.customAmountLabel}
              className="field"
            />
          )}
        </div>
        {errors.amount && <p className="field-error">{errors.amount}</p>}
      </fieldset>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          웹사이트
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-royal w-full">
        {pending ? script.give.submitting : script.give.submit}
      </button>
      <p className="notice">{script.give.note}</p>
    </form>
  );
}
```

- [ ] **Step 3: 페이지**

`src/app/give/page.tsx`

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { GiveForm } from './GiveForm';

export const metadata: Metadata = {
  title: script.give.title,
};

export default function GivePage() {
  return (
    <main className="page">
      <Link href="/?view=funding" className="back-link">
        ← {script.give.back}
      </Link>
      <section className="royal-frame mt-4 p-6">
        <p className="eyebrow">{princess.gift.name}</p>
        <h1 className="mt-1 font-title text-2xl font-bold">{script.give.title}</h1>
        <div className="mt-6">
          <GiveForm />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: 화면 확인 (Supabase 연결 전)**

```bash
npm run dev
```

`http://localhost:3000/give`를 375px 폭(브라우저 개발자 도구의 모바일 보기)으로 연다.

1. 이름을 비우고 `도와주기` → 브라우저가 이름 칸을 막는다(HTML required).
2. `직접 입력`을 고르면 금액 칸이 나타난다.
3. 이름 `예준`, `빵 한 조각` 선택 후 `도와주기` → 아직 `.env.local`이 없으므로 폼 위에 "앗, 왕국 우체부가 길을 잃었어요…"가 뜨고, 입력한 이름과 선택한 금액이 그대로 남아 있다. 터미널에 `보태기 저장 실패` 로그가 찍힌다.

확인 후 dev 서버를 끈다.

- [ ] **Step 5: 빌드·린트**

```bash
npm run build
npm run lint
```

Expected: 오류 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/give
git commit -m "feat: add give page with server action form" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: `/give/done` 송금 안내

**Files:**
- Create: `src/components/AccountCopy.tsx`, `src/app/give/done/page.tsx`

- [ ] **Step 1: 계좌 복사 컴포넌트**

`src/components/AccountCopy.tsx`

```tsx
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
```

- [ ] **Step 2: 완료 페이지**

`src/app/give/done/page.tsx`

`searchParams`는 요청마다 달라지므로 `<Suspense>` 안에서 읽는다. 대체 화면(fallback)은 금액 문장 없는 계좌 안내다.

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { AccountCopy } from '@/components/AccountCopy';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { tossUrl } from '@/lib/transfer';
import { parseAmount } from '@/lib/validation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DonePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="page">
      <section className="royal-frame p-6 text-center">
        <Image
          src={princess.images.touched}
          alt=""
          width={800}
          height={1000}
          className="mx-auto w-40 rounded-xl"
        />
        <h1 className="mt-4 font-title text-2xl font-bold">{script.done.title}</h1>
        <Suspense fallback={<TransferInfo amount={null} />}>
          <TransferInfoFromParams searchParams={searchParams} />
        </Suspense>
        <Link href="/?view=funding" className="btn-ghost mt-6">
          {script.done.back}
        </Link>
      </section>
    </main>
  );
}

async function TransferInfoFromParams({ searchParams }: { searchParams: SearchParams }) {
  const { amount } = await searchParams;
  return <TransferInfo amount={parseAmount(typeof amount === 'string' ? amount : null)} />;
}

function TransferInfo({ amount }: { amount: number | null }) {
  const toss = tossUrl(princess.tossId, amount);
  return (
    <div className="mt-4 space-y-4">
      {amount !== null && <p className="text-lg">{script.done.amountLine(formatWon(amount))}</p>}
      <dl className="space-y-1 rounded-xl bg-white/80 p-4 text-left">
        <div className="flex justify-between">
          <dt className="text-ink-soft">{script.done.bankLabel}</dt>
          <dd>{princess.account.bank}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">{script.done.holderLabel}</dt>
          <dd>{princess.account.holder}</dd>
        </div>
      </dl>
      <AccountCopy number={princess.account.number} />
      {toss && (
        <a href={toss} target="_blank" rel="noopener noreferrer" className="btn-royal w-full">
          {script.done.toss}
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 화면 확인**

```bash
npm run dev
```

375px 폭으로 확인한다.

1. `http://localhost:3000/give/done?amount=15000` → "15,000원을 아래 계좌로 보내 주세요", 은행·예금주, 계좌번호, `계좌번호 복사`. 복사를 누르면 "복사했어요!". (`tossId`가 null이라 토스 버튼은 없다.)
2. `http://localhost:3000/give/done?amount=abc` → 금액 문장 없이 계좌 안내만.
3. `http://localhost:3000/give/done` → 위와 같음.
4. `은인 명부 보러 가기` → `/?view=funding`으로 이동(아직 임시 홈).

확인 후 dev 서버를 끈다.

- [ ] **Step 4: 빌드·린트**

```bash
npm run build
npm run lint
```

Expected: 오류 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/components/AccountCopy.tsx src/app/give/done
git commit -m "feat: add transfer guide page with account copy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: 펀딩 섹션 (백마 진행률, 은인 명부)

**Files:**
- Create: `src/components/HorseProgress.tsx`, `src/components/BenefactorList.tsx`, `src/components/FundingSection.tsx`

- [ ] **Step 1: 백마 진행률 SVG**

`src/components/HorseProgress.tsx` — 길 왼쪽(`ROAD_START`)에서 성 앞(`ROAD_END`)까지 백마가 이동한다.

```tsx
const ROAD_START = 20;
const ROAD_END = 250;

export function HorseProgress({ position }: { position: number }) {
  const clamped = Math.min(Math.max(position, 0), 100);
  const horseX = ROAD_START + ((ROAD_END - ROAD_START) * clamped) / 100;

  return (
    <svg
      viewBox="0 0 320 72"
      className="w-full"
      role="img"
      aria-label={`백마가 성까지 ${clamped}% 왔어요`}
    >
      <path d={`M${ROAD_START} 58 H${ROAD_END}`} stroke="#f3dfa8" strokeWidth="8" strokeLinecap="round" />
      <path d={`M${ROAD_START} 58 H${horseX}`} stroke="#e8559a" strokeWidth="8" strokeLinecap="round" />

      <g transform="translate(276 14)">
        <rect x="4" y="16" width="32" height="28" fill="#f7a8c8" stroke="#4a2b33" strokeWidth="1.5" />
        <path
          d="M0 18 L8 4 L16 18 Z M24 18 L32 4 L40 18 Z"
          fill="#e8559a"
          stroke="#4a2b33"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="15" y="30" width="10" height="14" rx="5" fill="#4a2b33" />
        <path d="M8 4 V-4 L14 -1 L8 2" fill="#c9972e" stroke="#c9972e" />
      </g>

      <g transform={`translate(${horseX - 20} 18)`}>
        <path
          d="M8 30 L6 36 M13 30 L13 36 M25 30 L26 36 M30 29 L33 35"
          stroke="#4a2b33"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="19" cy="22" rx="14" ry="8" fill="#fff" stroke="#4a2b33" strokeWidth="1.5" />
        <path
          d="M29 18 L35 6 L40 8 L35 20 Z"
          fill="#fff"
          stroke="#4a2b33"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M33 7 Q29 10 30 16" stroke="#e8559a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M5 19 Q-1 23 2 30" stroke="#e8559a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: 은인 명부**

`src/components/BenefactorList.tsx` — 금액은 보여 주지 않는다.

```tsx
import { script } from '@/config/script';
import type { Contribution } from '@/lib/repo';

const HEART_COLORS = ['text-rose', 'text-gold', 'text-rose-deep'];

export function BenefactorList({ items }: { items: Contribution[] }) {
  if (items.length === 0) return <p className="notice">{script.funding.emptyBenefactors}</p>;

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className="rounded-xl border border-gold-soft bg-white/80 px-4 py-3">
          <p className="font-bold">
            <span aria-hidden="true" className={HEART_COLORS[index % HEART_COLORS.length]}>
              ♥
            </span>{' '}
            {item.name}
          </p>
          {item.message && <p className="mt-1 break-words text-sm text-ink-soft">{item.message}</p>}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: 펀딩 섹션**

`src/components/FundingSection.tsx` — `contributions`가 `null`이면 명부 조회에 실패한 것이다. 그때는 진행률 자리에 안내만 보이고 명부는 숨긴다. 선물, 버튼은 그대로 보인다.

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { getProgress, sumAmounts } from '@/lib/progress';
import type { Contribution } from '@/lib/repo';
import { BenefactorList } from './BenefactorList';
import { HorseProgress } from './HorseProgress';

type Props = {
  contributions: Contribution[] | null;
  dday: string;
};

export function FundingSection({ contributions, dday }: Props) {
  const progress =
    contributions === null ? null : getProgress(sumAmounts(contributions), princess.goalAmount);

  return (
    <section id="funding" className="royal-frame space-y-6 p-6">
      <header className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{script.funding.birthdayLabel(princess.princessName)}</span>
        <span className="rounded-full bg-rose px-3 py-1 font-bold text-white">{dday}</span>
      </header>

      <div>
        <h1 className="font-title text-2xl font-bold leading-snug">{princess.gift.name}</h1>
        <p className="mt-2 text-ink-soft">“{script.funding.quote}”</p>
      </div>

      <Image
        src={princess.images.gift}
        alt={princess.gift.name}
        width={600}
        height={600}
        className="w-full rounded-2xl border-2 border-gold-soft"
      />
      {princess.gift.link && (
        <a
          href={princess.gift.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-ink-soft underline underline-offset-4"
        >
          {script.funding.giftLink}
        </a>
      )}

      {progress?.complete && (
        <div className="space-y-3 text-center">
          <Image
            src={princess.images.touched}
            alt=""
            width={800}
            height={1000}
            className="mx-auto w-48 rounded-xl"
          />
          <p className="font-title text-lg font-bold text-rose-deep">{script.funding.completeLine}</p>
        </div>
      )}

      {progress ? (
        <div>
          <HorseProgress position={progress.position} />
          <div className="mt-1 flex justify-between text-sm">
            <span>
              {script.funding.progressLabel} <b className="text-rose-deep">{progress.percent}%</b>
            </span>
            <span className="text-ink-soft">
              {script.funding.goalLabel} {formatWon(princess.goalAmount)}
            </span>
          </div>
        </div>
      ) : (
        <p className="notice">{script.errors.listFailed}</p>
      )}

      <Link href="/give" className="btn-royal w-full">
        {script.funding.helpButton}
      </Link>

      {contributions && (
        <div>
          <h2 className="font-title text-lg font-bold">
            {script.funding.benefactorsTitle}{' '}
            <span className="text-rose">{script.funding.benefactorsCount(contributions.length)}</span>
          </h2>
          <div className="mt-3">
            <BenefactorList items={contributions} />
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: 타입·린트**

```bash
npx tsc --noEmit
npm run lint
```

Expected: 오류 없음. (화면 확인은 Task 15에서 홈에 붙인 뒤 한다.)

- [ ] **Step 5: 커밋**

```bash
git add src/components/HorseProgress.tsx src/components/BenefactorList.tsx src/components/FundingSection.tsx
git commit -m "feat: add funding section with white horse progress" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: 홈 흐름 (표지 → 대화 → 펀딩)

**Files:**
- Create: `src/components/Cover.tsx`, `src/components/DialogueScene.tsx`, `src/components/HomeFlow.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 표지**

`src/components/Cover.tsx`

```tsx
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
          priority
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
```

- [ ] **Step 2: 대화 장면**

`src/components/DialogueScene.tsx` — 상태 전이는 Task 8의 `dialogue` 함수만 쓴다. 타이핑은 `setInterval` 콜백에서 `tick`, 탭은 `advance`. 움직임 줄이기 설정이 켜져 있으면 타이핑 없이 바로 한 줄을 보여 준다.

```tsx
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
            priority
            className="h-auto w-full"
          />
          {line.showGift && (
            <Image
              src={princess.images.gift}
              alt={princess.gift.name}
              width={600}
              height={600}
              className="gift-pop absolute top-4 right-4 w-28 rounded-xl border-2 border-gold bg-white shadow-lg"
            />
          )}
        </div>

        {!state.choosing && (
          <div className="relative m-4 min-h-28 rounded-2xl border-2 border-gold bg-white px-4 pt-6 pb-4">
            <span className="absolute -top-3 left-4 rounded-full bg-rose px-3 py-0.5 text-xs font-bold text-white">
              {script.dialogue.speaker}
            </span>
            <p aria-hidden="true" className="text-lg leading-relaxed">
              {visibleText(line.text, state.typed)}
            </p>
            <p className="sr-only">{line.text}</p>
            {!typing && (
              <span aria-hidden="true" className="absolute right-3 bottom-2 animate-bounce text-rose">
                ▼
              </span>
            )}
          </div>
        )}
      </button>

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
```

- [ ] **Step 3: 단계 전환**

`src/components/HomeFlow.tsx` — 펀딩 섹션은 서버에서 그려서 `funding`으로 받는다.

```tsx
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
```

- [ ] **Step 4: 홈 페이지**

`src/app/page.tsx`를 통째로 바꾼다. 요청마다 달라지는 것(`searchParams`, DB, `new Date()`)은 전부 `<Suspense>` 안의 `HomeContent`에서 처리하고, `new Date()` 전에 `connection()`을 호출한다(Cache Components 규칙). `HomeFlow`에 `key`를 줘서 `?view=funding`으로 들어왔을 때 시작 단계가 확실히 바뀌게 한다.

```tsx
import { connection } from 'next/server';
import { Suspense } from 'react';
import { FundingSection } from '@/components/FundingSection';
import { HomeFlow, type Stage } from '@/components/HomeFlow';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { ddayLabel } from '@/lib/dday';
import type { Contribution } from '@/lib/repo';
import { getRepo } from '@/lib/supabase-repo';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="page">
      <Suspense fallback={<p className="notice mt-24">{script.loading}</p>}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function loadContributions(): Promise<Contribution[] | null> {
  try {
    return await getRepo().list();
  } catch (error) {
    console.error('은인 명부 조회 실패', error);
    return null;
  }
}

async function HomeContent({ searchParams }: { searchParams: SearchParams }) {
  const { view } = await searchParams;
  await connection();
  const contributions = await loadContributions();
  const dday = ddayLabel(princess.birthday, new Date());
  const initialStage: Stage = view === 'funding' ? 'funding' : 'cover';

  return (
    <HomeFlow
      key={initialStage}
      initialStage={initialStage}
      funding={<FundingSection contributions={contributions} dday={dday} />}
    />
  );
}
```

- [ ] **Step 5: 화면 확인 (Supabase 연결 전)**

```bash
npm run dev
```

375px 폭으로 `http://localhost:3000`을 연다.

1. 표지: 임시 표지 그림 위에 "로맨스 판타지 · 생일 특별편"과 《박봉의 거지공주는…》 제목, `1화 보기`.
2. `1화 보기` → 대화 장면. 대사가 한 글자씩 나온다. 타이핑 중에 누르면 그 줄이 바로 다 나오고, 다시 누르면 다음 줄로 간다.
3. 4번째 대사에서 선물 임시 그림이 튀어나온다.
4. 마지막 대사 뒤 선택지 두 개. `일단 사정을 더 들어본다` → 펀딩 섹션.
5. 펀딩 섹션: D-day 배지, 선물, 한마디, 진행률 자리에 "명부를 잠시 못 찾고 있어요…"(아직 DB 미연결), `공주님 도와주기`.
6. 새로고침 후 `건너뛰기` → 바로 펀딩 섹션.
7. 대화에서 `가엾은 공주를 돕는다` → `/give`.
8. `http://localhost:3000/?view=funding` → 표지 없이 펀딩 섹션부터.

dev 서버를 끈다.

- [ ] **Step 6: 빌드·린트·테스트**

```bash
npm run build
npm run lint
npm test
```

Expected: 모두 통과. 빌드 중 "Uncached data was accessed outside of <Suspense>"나 `new Date()` 관련 오류가 나면 Step 4의 구조(Suspense 안에서 `connection()` 후 `new Date()`)를 다시 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: add cover, dialogue and home flow" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: 카톡 링크 미리보기 이미지

**Files:**
- Create: `assets/GowunBatang-Bold.ttf`, `assets/OFL.txt`, `src/app/opengraph-image.tsx`

미리보기 이미지는 빌드 때 PNG로 만들어진다. 한글을 그리려면 폰트 파일이 필요해서 고운바탕 Bold(SIL OFL, 약 8MB)를 저장소에 넣는다. 표지 그림이 PNG/JPG로 바뀌면 왼쪽에 그 그림이 함께 들어간다(임시 SVG일 때는 글자만).

- [ ] **Step 1: 폰트와 라이선스 내려받기**

```bash
mkdir -p assets
curl -L -o assets/GowunBatang-Bold.ttf https://github.com/google/fonts/raw/main/ofl/gowunbatang/GowunBatang-Bold.ttf
curl -L -o assets/OFL.txt https://github.com/google/fonts/raw/main/ofl/gowunbatang/OFL.txt
ls -l assets
```

Expected: `GowunBatang-Bold.ttf`가 약 8,000,000바이트, `OFL.txt`가 수 KB.

- [ ] **Step 2: 미리보기 이미지 라우트**

`src/app/opengraph-image.tsx` — Satori 규칙상 자식이 여러 개인 `div`에는 `display: 'flex'`가 필요하고, 텍스트는 문자열 하나로 넣는다.

```tsx
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { princess } from '@/config/princess';
import { script } from '@/config/script';

export const alt = princess.coverTitle;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const titleFont = await readFile(join(process.cwd(), 'assets/GowunBatang-Bold.ttf'));

async function loadCover(): Promise<string | null> {
  const path = princess.images.cover;
  if (!/\.(png|jpe?g)$/i.test(path)) return null;
  const data = await readFile(join(process.cwd(), 'public', path));
  const mime = /\.png$/i.test(path) ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${data.toString('base64')}`;
}

export default async function OpengraphImage() {
  const cover = await loadCover();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#ffe4ef',
          fontFamily: 'GowunBatang',
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={504} height={630} style={{ objectFit: 'cover' }} />
        ) : null}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            margin: 28,
            padding: 48,
            background: '#fff5f9',
            border: '6px solid #c9972e',
            borderRadius: 32,
          }}
        >
          <div style={{ fontSize: 30, color: '#c9972e' }}>{script.cover.subtitle}</div>
          <div style={{ marginTop: 24, fontSize: cover ? 50 : 62, lineHeight: 1.35, color: '#4a2b33' }}>
            {`《${princess.coverTitle}》`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'GowunBatang', data: titleFont, style: 'normal', weight: 700 }],
    },
  );
}
```

- [ ] **Step 3: 확인**

```bash
npm run dev
```

1. `http://localhost:3000/opengraph-image`를 연다 → 분홍 배경, 금테 카드 안에 "로맨스 판타지 · 생일 특별편"과 긴 제목이 한글로(네모 깨짐 없이) 보인다.
2. `http://localhost:3000` 페이지 소스에서 `og:image`, `og:title` 메타 태그가 있는지 확인한다.

dev 서버를 끄고:

```bash
npm run build
npm run lint
```

Expected: 오류 없음. 빌드 출력의 라우트 목록에 `/opengraph-image`가 있다.

- [ ] **Step 4: 커밋**

```bash
git add assets src/app/opengraph-image.tsx
git commit -m "feat: add Korean Open Graph image for link previews" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Supabase 연결과 전체 흐름 확인

**Files:** 없음(설정과 확인). `.env.local`은 git에 올라가지 않는다.

이 Task의 1~3단계는 사용자가 Supabase 대시보드에서 직접 한다.

- [ ] **Step 1: Supabase 프로젝트 만들기 (사용자)**

1. https://supabase.com 에 로그인 → New project. Region은 `Northeast Asia (Seoul)`.
2. 왼쪽 메뉴 SQL Editor → `supabase/schema.sql` 내용을 붙여 넣고 Run. Expected: `Success. No rows returned`.
3. Table Editor에 `contributions` 테이블이 보이는지 확인.

- [ ] **Step 2: 키 복사 (사용자)**

Project Settings → API Keys에서
- Project URL → `SUPABASE_URL`
- Secret key(`sb_secret_...`, 없으면 legacy `service_role`) → `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Step 3: `.env.local` 만들기 (사용자)**

저장소 루트에 `.env.example`을 복사해 `.env.local`을 만들고 실제 값을 넣는다.

```bash
cp .env.example .env.local
```

- [ ] **Step 4: 전체 흐름 확인**

```bash
npm run dev
```

375px 폭으로:

1. `http://localhost:3000` → 펀딩 섹션까지 가면 진행률 `0%`, "아직 은인이 없어요…"가 보인다(이제 DB가 연결됨).
2. `공주님 도와주기` → 이름 `테스트은인`, 한마디 `테스트`, `따뜻한 수프` → `도와주기`.
3. `/give/done?amount=15000` 화면에 "15,000원을 아래 계좌로 보내 주세요".
4. `은인 명부 보러 가기` → 펀딩 섹션에 `은인 명부 1명`, `♥ 테스트은인 / 테스트`. 진행률이 `15000 / goalAmount` 비율(예시 목표 200,000원이면 7%)이다.
5. Supabase Table Editor에 같은 행이 있다. `confirmed`를 체크해도 화면은 그대로다.
6. 대시보드에서 그 행을 지우고 새로고침 → 명부가 다시 비고 0%.
7. 함정 칸 확인: 개발자 도구 콘솔에서 아래를 실행한 뒤 정상적으로 제출 → 완료 화면은 나오지만 Table Editor에 행이 생기지 않는다.

```js
document.querySelector('input[name="hp_extra"]').value = 'bot';
```

8. 목표 달성 연출 확인: `src/config/princess.ts`의 `goalAmount`를 잠시 `10000`으로 바꾸고 15,000원을 한 번 보탠다 → 감동 그림, "왕자님은 안 오셨지만…", 백마가 성 앞, `150%`. 확인 후 `goalAmount`를 원래대로 돌리고 테스트 행을 지운다.

dev 서버를 끈다.

- [ ] **Step 5: 변경 없음 확인**

```bash
git status --short
```

Expected: 출력 없음(`.env.local`은 무시되고, `goalAmount`는 원래 값). 커밋할 것이 없다.

---

### Task 18: AI 그림 생성 가이드

**Files:**
- Create: `docs/image-prompts.md`

- [ ] **Step 1: 가이드 작성**

`docs/image-prompts.md`

````markdown
# 공주 그림 만들기 (AI 이미지 생성)

ChatGPT(이미지 생성)나 Gemini 같은 도구로 같은 공주가 나오는 그림 5장을 만든다.

## 순서

1. **캐릭터 시트부터** 만든다. 내 사진 1장을 첨부하고 아래 "캐릭터 시트" 프롬프트를 넣는다. 마음에 드는 결과가 나올 때까지 다시 뽑는다.
2. 같은 대화창에서, 또는 새 대화에 **캐릭터 시트 이미지를 첨부**하고 장면 프롬프트를 하나씩 넣는다. 매번 "같은 캐릭터"를 강조한다.
3. 세로 4:5(예: 1024×1280)로 받는다. 글자, 로고, 워터마크는 넣지 않는다(제목은 앱이 얹는다).
4. 파일 이름을 아래 표대로 바꿔 `public/images/`에 넣고, `src/config/princess.ts`의 `images` 경로 확장자를 `.png`로 바꾼다.
5. `node scripts/make-placeholders.mjs`는 다시 돌리지 않는다(임시 SVG를 다시 만든다).

| 파일 | 장면 |
|---|---|
| `cover.png` | 표지 |
| `waiting.png` | 창가에서 기다림 |
| `surprised.png` | 돌아보며 놀람 |
| `pleading.png` | 두 손 모아 부탁 |
| `touched.png` | 감동 |
| `gift.png` | 선물 사진(직접 찍거나 준비한 사진, 정사각형) |

## 지킬 것

- 특정 웹툰·소설·애니의 캐릭터나 표지, 특정 작가 이름을 프롬프트에 넣지 않는다. 장르 화풍(로맨스 판타지 웹툰풍)만 말한다.
- 브랜드 로고를 그려 달라고 하지 않는다.

## 공통 화풍 (모든 프롬프트 앞에 붙인다)

```
Korean romance-fantasy webtoon cover illustration style, soft cel shading,
delicate line art, glowing pastel pink and warm gold palette, sparkles and
rose petals. Original character, not based on any existing work.
The princess: a young woman with long wavy hair and big gentle eyes (use the
attached photo/character sheet for her face and hair), wearing a pink ball gown
with a few visible hand-sewn patches and a small gold tiara with a tiny crack.
She is royalty but poor, sweet and earnest. Vertical 4:5 composition.
No text, no letters, no logos, no watermark.
```

## 캐릭터 시트

```
[공통 화풍]
Character reference sheet of this princess: front view, side view and back
view, full body, plain light pink background, same outfit in every view.
```

## 장면

1. `cover.png`
```
[공통 화풍]
Upper-body portrait for a book cover. She holds a tiny, empty coin purse and
smiles hopefully. Pink castle window and climbing roses behind her.
Leave the top third of the image calm and empty for a title.
```

2. `waiting.png`
```
[공통 화풍]
Side view. She leans on a castle window sill with her chin in her hand,
gazing at an empty country road outside, wistful and a little bored.
Pink castle room with slightly peeling wallpaper.
```

3. `surprised.png`
```
[공통 화풍]
Same pink castle room. She turns around toward the viewer in surprise,
one hand near her mouth, a hopeful sparkle in her eyes.
```

4. `pleading.png`
```
[공통 화풍]
Same pink castle room. She clasps both hands together under her chin,
pleading puppy eyes, a tiny tear, an earnest little bow.
```

5. `touched.png`
```
[공통 화풍]
Tears of joy, both hands on her chest, a glowing happy smile,
rose petals swirling around her, warm golden light.
```
````

- [ ] **Step 2: 커밋**

```bash
git add docs/image-prompts.md
git commit -m "docs: add AI illustration prompts for the princess" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: 실제 값 채우기, 배포, 공개 전 체크

**Files:**
- Modify: `src/config/princess.ts`, `public/images/*`

- [ ] **Step 1: 실제 값 받기 (사용자)**

사용자에게 다음을 받는다: 공주 이름(별명), 생일(YYYY-MM-DD), 목표 금액(선물 가격), 은행·계좌번호·예금주, 토스 아이디(선택), 선물 상품 링크(선택), 표지 제목을 바꿀지 여부.

- [ ] **Step 2: 설정 반영**

`src/config/princess.ts`의 `princess` 객체 값을 받은 값으로 바꾼다. 그림을 넣었다면 `images` 경로를 `.png`로 바꾼다. 예:

```ts
export const princess: PrincessConfig = {
  princessName: '현이공주',
  coverTitle: '박봉의 거지공주는 오늘도 백마 탄 왕자님을 기다립니다',
  birthday: '2026-12-31',
  gift: { name: '디올 포에버 쿠션 케이스 골든 메달리온', link: 'https://example.com/product' },
  goalAmount: 180000,
  account: { bank: '카카오뱅크', number: '3333-00-0000000', holder: '홍길동' },
  tossId: 'mytossid',
  images: {
    cover: '/images/cover.png',
    waiting: '/images/waiting.png',
    surprised: '/images/surprised.png',
    pleading: '/images/pleading.png',
    touched: '/images/touched.png',
    gift: '/images/gift.png',
  },
};
```

(위 이름·계좌·아이디는 형식 예시다. 실제 값만 넣는다.)

- [ ] **Step 3: 확인과 커밋**

```bash
npm test
npm run build
npm run dev
```

375px 폭으로 표지 → 대화 → 펀딩 → 도와주기 → 완료를 한 번 더 확인하고, `/opengraph-image`에 표지 그림이 들어갔는지 본다. 테스트로 넣은 행은 대시보드에서 지운다.

```bash
git add src/config/princess.ts public/images
git commit -m "feat: fill in real princess details and illustrations" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: GitHub에 올리기 (사용자 확인 후)**

원격 저장소는 `origin`(GitHub)으로 이미 연결돼 있다. 사용자가 올려도 된다고 하면:

```bash
git push -u origin main
```

- [ ] **Step 5: Vercel 배포 (사용자)**

1. https://vercel.com → Add New → Project → GitHub의 `birthday-2026` 선택.
2. Environment Variables에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 넣는다(Production, Preview 모두).
3. Project Settings → Functions → Function Region을 Seoul (icn1)으로 바꾼다. (DB와 같은 지역)
4. Deploy. 끝나면 `https://<프로젝트>.vercel.app`이 생긴다.

- [ ] **Step 6: 공개 전 체크리스트**

1. 배포 주소에서 전체 흐름(표지 → 대화 → 펀딩 → 도와주기 → 완료 → 명부 반영)을 휴대폰으로 확인.
2. 카카오톡 "나와의 채팅"에 링크를 보내 미리보기(표지 이미지와 긴 제목)를 확인한다. 예전 미리보기가 남아 있으면 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 지운다.
3. 카카오톡 안에서 링크를 열어 `계좌번호 복사`와 `토스로 보내기`를 눌러 본다. 복사가 막히면 "길게 눌러 복사" 안내가 뜨는지 본다.
4. Supabase Table Editor에서 테스트 행을 모두 지운다.
5. `src/config/princess.ts`에 예시값(`○○은행`, `000-0000-0000`, `예금주`)이 남아 있지 않은지 확인한다.
6. Supabase 무료 프로젝트는 일주일 넘게 쓰지 않으면 일시정지된다. 링크를 보내기 직전에 대시보드에서 활성 상태인지 확인한다.
