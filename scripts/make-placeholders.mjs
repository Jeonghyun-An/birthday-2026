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
