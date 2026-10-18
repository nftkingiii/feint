import { useId } from 'react';

/**
 * Small inline SVG flags. Emoji flags do not render on Windows (they show as
 * letters), so each country draws its own. Decorative: the country name is
 * always next to it.
 */
export default function Flag({ code, className = 'flag' }) {
  const id = useId().replace(/:/g, '');
  const common = { className, 'aria-hidden': true, focusable: 'false' };

  if (code === 'ng') {
    return (
      <svg {...common} viewBox="0 0 6 3">
        <rect width="6" height="3" fill="#008751" />
        <rect x="2" width="2" height="3" fill="#fff" />
      </svg>
    );
  }

  if (code === 'gb') {
    return (
      <svg {...common} viewBox="0 0 60 30">
        <clipPath id={`${id}s`}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={`${id}t`}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath={`url(#${id}s)`}>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    );
  }

  if (code === 'us') {
    const stripes = Array.from({ length: 13 }, (_, i) => i);
    const stars = [];
    for (let row = 0; row < 9; row++) {
      const cols = row % 2 === 0 ? 6 : 5;
      for (let col = 0; col < cols; col++) {
        stars.push([(row % 2 === 0 ? 0.6 : 1.2) + col * 1.2, 0.5 + row * 0.6]);
      }
    }
    return (
      <svg {...common} viewBox="0 0 19 10">
        {stripes.map(i => (
          <rect key={i} y={(i * 10) / 13} width="19" height={10 / 13} fill={i % 2 === 0 ? '#B22234' : '#fff'} />
        ))}
        <rect width="7.6" height={(10 * 7) / 13} fill="#3C3B6E" />
        {stars.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.16" fill="#fff" />
        ))}
      </svg>
    );
  }

  // Anywhere else: a simple globe.
  return (
    <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </svg>
  );
}
