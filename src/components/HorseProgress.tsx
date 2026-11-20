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
