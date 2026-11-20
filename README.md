# 박봉의 거지공주 생일선물 펀딩

친구들이 링크 하나로 생일선물 값을 조금씩 보태는 1인용 페이지예요. 표지 → 공주와의 대화 → 펀딩(백마 진행률, 은인 명부) → 보태기 → 송금 안내 순서로 흘러가요. 돈은 친구가 내 계좌로 직접 보내고, 앱은 약속 기록만 저장해요.

## 로컬에서 실행

```bash
npm install
cp .env.example .env.local   # Supabase 값을 채워요
npm run dev                  # http://localhost:3000
```

`.env.local`이 없어도 화면은 떠요. 그때는 은인 명부 자리에 "명부를 잠시 못 찾고 있어요…"가 나와요.

## 처음 한 번: Supabase

1. https://supabase.com → New project. Region은 `Northeast Asia (Seoul)`.
2. SQL Editor에서 `supabase/schema.sql`을 실행해요.
3. Project Settings → API Keys에서 Project URL과 Secret key(`sb_secret_...`)를 `.env.local`의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`에 넣어요. Secret key는 서버에서만 쓰여요.

## 내용 바꾸기

- `src/config/princess.ts`: 공주 이름, 표지 제목, 생일, 선물, 목표 금액, 계좌, 토스 아이디, 그림 경로
- `src/config/script.ts`: 대사와 화면의 모든 문구
- 그림: `docs/image-prompts.md`대로 만든 PNG를 `public/images/`에 넣고, `princess.ts`의 `images` 경로 확장자를 `.png`로 바꿔요.

## 기록 관리

Supabase → Table Editor → `contributions`. 입금이 확인되면 `confirmed`를 체크하고, 장난 글은 행을 지우면 돼요. 진행률은 모든 기록의 약속 금액 합계예요.

## 배포 (Vercel)

1. GitHub 저장소를 Vercel에서 Import.
2. Environment Variables에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Project Settings → Functions → Function Region을 **Seoul (icn1)** 으로. DB와 같은 지역이어야 은인 명부가 빨리 떠요.
4. Deploy.

## 링크 보내기 전 체크

1. 카카오톡 "나와의 채팅"에 링크를 보내 미리보기를 확인해요. 예전 미리보기가 남아 있으면 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 지워요.
2. 카카오톡 안에서 링크를 열어 계좌번호 복사와 토스 버튼을 눌러 봐요.
3. 테스트로 넣은 기록을 지워요.
4. `princess.ts`에 예시값(`○○은행`, `000-0000-0000`, `예금주`)이 남아 있지 않은지 봐요.
5. Supabase 무료 프로젝트는 일주일 넘게 쓰지 않으면 일시정지돼요. 링크를 보내기 직전에 대시보드에서 활성 상태인지 확인해요.

## 개발

```bash
npm test        # Vitest
npm run lint
npm run build
```

Next.js 16.4(Cache Components 사용)라서 예전 Next.js와 다른 점이 있어요. `AGENTS.md`를 참고하세요.
