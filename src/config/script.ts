export type SceneImage = "waiting" | "surprised" | "pleading";

export type DialogueLine = {
  image: SceneImage;
  text: string;
  /** true면 선물 사진이 장면 위에 뜬다 */
  showGift?: boolean;
};

export type Preset = { label: string; amount: number };

/** 펀딩 섹션 큰 제목. 몇 초마다 다음 것으로 바뀐다. 첫 번째가 처음에 보인다. */
export type GiftTitle = { title: string; quote: string };

const giftTitles: GiftTitle[] = [
  {
    title: "【전설 등급】 황금 메달리온의 마법 거울",
    quote: "거울아 거울아, 이 왕국에서 제일 가난한 공주는 누구니?",
  },
  {
    title: "【전설】 황금 메달리옹 · 체면 +99",
    quote: "박봉으로는 드랍률 0%예요…",
  },
  {
    title: "왕실 보물 제1호, 황금 메달리옹 손거울",
    quote: "국고가 비어 보물 1호가 아직 없어요",
  },
  { title: "박봉 공주의 마지막 자존심", quote: "오늘만큼은 공주이고 싶어요" },
  {
    title: "Lot. 01 — 황금 메달리옹 (겨울 한정 진상품)",
    quote: "낙찰가는 여러분의 마음입니다",
  },
  {
    title: "왕자님 대신 저를 비춰 줄 황금 거울",
    quote: "왕자님은 안 와도 거울은 와야죠",
  },
];

const dialogueLines: DialogueLine[] = [
  { image: "waiting", text: "…오늘도 안 오시네요. 백마 탄 왕자님." },
  {
    image: "waiting",
    text: "우리 왕국은 너무 가난해서… 공주 월급도 박봉이에요.",
  },
  { image: "surprised", text: "앗, 손님이다! 혹시 왕자님…? 아, 아니시구나…" },
  {
    image: "surprised",
    text: "사실 생일이 다가오는데… 꼭 갖고 싶은 게 있어요.",
    showGift: true,
  },
  {
    image: "pleading",
    text: "박봉으로는 도저히 무리라서요… 아주 조금만 보태 주실 수 있을까요?",
    showGift: true,
  },
];

const presets: Preset[] = [
  { label: "빵 한 조각", amount: 5000 },
  { label: "따뜻한 수프", amount: 15000 },
  { label: "성 난방비", amount: 30000 },
];

export const script = {
  loading: "공주가 은인 명부를 펼치는 중…",
  cover: {
    subtitle: "로맨스 판타지 · 생일 특별편",
    start: "1화 보기",
  },
  dialogue: {
    speaker: "공주",
    skip: "건너뛰기",
    next: "다음 대사",
    tapHint: "화면을 누르면 다음으로 넘어가요",
    lines: dialogueLines,
    choices: {
      help: "가엾은 공주를 돕는다",
      listen: "일단 사정을 더 들어본다",
    },
  },
  funding: {
    birthdayLabel: (name: string) => `${name}의 생일`,
    quote: "왕자님 대신… 조금만 도와주시면 평생 잊지 않을게요.",
    giftTitles,
    realNameLabel: "실물",
    giftLink: "상품 보러 가기",
    progressLabel: "백마 진행률",
    goalLabel: "목표",
    helpButton: "공주님 도와주기",
    benefactorsTitle: "은인 명부",
    benefactorsCount: (count: number) => `${count}명`,
    emptyBenefactors: "아직 은인이 없어요… 첫 번째 은인이 되어 주실래요?",
    completeLine: "왕자님은 안 오셨지만… 여러분이 제 백마였어요 ㅠㅠ",
  },
  presets,
  give: {
    title: "공주님 도와주기",
    back: "공주에게 돌아가기",
    nameLabel: "이름",
    namePlaceholder: "은인 명부에 적힐 이름",
    messageLabel: "공주에게 한마디 (선택)",
    messagePlaceholder: "생일 축하해요, 공주님!",
    amountLabel: "얼마나 도와주실래요?",
    customAmountLabel: "직접 입력",
    customAmountPlaceholder: "예: 20000",
    submit: "도와주기",
    submitting: "전하는 중…",
    note: "돈은 공주에게 직접 가요. 다음 화면에서 보내는 방법을 알려 드려요.",
  },
  done: {
    title: "은혜는 잊지 않을게요…",
    amountLine: (won: string) => `${won}을 아래 계좌로 보내 주세요`,
    bankLabel: "은행",
    holderLabel: "예금주",
    copy: "계좌번호 복사",
    copied: "복사했어요!",
    copyFallback: "복사가 막혀 있어요. 계좌번호를 길게 눌러 복사해 주세요.",
    toss: "토스로 보내기",
    back: "은인 명부 보러 가기",
  },
  errors: {
    nameRequired: "이름을 알려 주셔야 은인 명부에 적을 수 있어요…",
    nameTooLong: "이름은 20자까지만 적을 수 있어요…",
    messageTooLong: "한마디는 100자까지만 받을 수 있어요…",
    amountInvalid: "1,000원부터 1,000,000원까지 받을 수 있어요…",
    saveFailed: "앗, 왕국 우체부가 길을 잃었어요. 한 번만 다시 눌러 주세요.",
    listFailed: "명부를 잠시 못 찾고 있어요…",
  },
  errorPage: {
    title: "앗, 성에 바람이 들었어요…",
    body: "잠깐 문제가 생겼어요. 한 번만 다시 시도해 주세요.",
    retry: "다시 시도하기",
    home: "공주에게 돌아가기",
  },
  notFound: {
    title: "여기는 공주의 성이 아니에요…",
    body: "길을 잃으셨나 봐요. 공주에게 데려다 드릴게요.",
    home: "공주에게 가기",
  },
};
