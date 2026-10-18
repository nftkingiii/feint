/**
 * Vee, the guide: a pair of watchful eyes with one line to say. The mood
 * changes the eyes (calm, pleased, worried) and the tint of the bubble.
 */
export default function Guide({ mood = 'calm', children }) {
  return (
    <div className={`guide mood-${mood}`} aria-live="polite">
      <Eyes mood={mood} />
      <div className="guide-bubble">
        <span className="guide-name">Vee</span>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Eyes({ mood }) {
  // Pupils glance sideways when calm, lift when pleased, drop when worried.
  const pupil = { calm: [2, 0], happy: [0, -2], worried: [0, 2] }[mood] ?? [0, 0];
  return (
    <svg className="guide-face" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" className="face" />
      <ellipse cx="22" cy="30" rx="9" ry={mood === 'happy' ? 7 : 10} className="eye" />
      <ellipse cx="42" cy="30" rx="9" ry={mood === 'happy' ? 7 : 10} className="eye" />
      <circle cx={22 + pupil[0]} cy={30 + pupil[1]} r="4" className="pupil" />
      <circle cx={42 + pupil[0]} cy={30 + pupil[1]} r="4" className="pupil" />
      {mood === 'worried' && (
        <>
          <path d="M13 17 L28 21" className="brow" />
          <path d="M51 17 L36 21" className="brow" />
        </>
      )}
      {mood === 'happy' && <path d="M24 46 Q32 52 40 46" className="mouth" />}
      {mood === 'worried' && <path d="M25 49 Q32 44 39 49" className="mouth" />}
      {mood === 'calm' && <path d="M26 47 L38 47" className="mouth" />}
    </svg>
  );
}
