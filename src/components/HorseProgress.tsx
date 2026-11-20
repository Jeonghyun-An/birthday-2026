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

      <g transform={`translate(${horseX - 22} 18)`}>
        <path
          d="M11 25 L10 36 M15 26 L15 36 M25 26 L26 36 M29 24 L31 35"
          stroke="#4a2b33"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M8 17 Q1 19 3 29" stroke="#e8559a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="20" cy="20" rx="13" ry="7.5" fill="#fff" stroke="#4a2b33" strokeWidth="1.5" />
        <path
          d="M27 16 L32 6 Q34 2.5 37.5 3.5 L43.5 9 Q45 11 42.5 12.5 L37 11.5 L34 19 Z"
          fill="#fff"
          stroke="#4a2b33"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M34.5 4.5 L35.5 0.5 L37.5 3.8"
          fill="#fff"
          stroke="#4a2b33"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="7.2" r="0.9" fill="#4a2b33" />
        <path d="M33.5 4 Q29 8.5 29.5 15.5" stroke="#e8559a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path
          d="M16 13.5 Q20.5 12 25 13.5 L24.5 19 Q20.5 20.5 16.5 19 Z"
          fill="#f7a8c8"
          stroke="#c9972e"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}
