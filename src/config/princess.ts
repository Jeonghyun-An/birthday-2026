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
