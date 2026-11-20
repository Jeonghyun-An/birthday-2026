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
