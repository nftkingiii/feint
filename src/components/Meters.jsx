import { useEffect, useRef, useState } from 'react';
import { formatMoney, judge } from '../lib/engine.js';

/**
 * The three meters: savings (drops when fooled), trust (real messages handled
 * well) and clues marked, plus one pip per message in the round.
 */
export default function Meters({ country, deck, results, index, lost, cluesSoFar, compact = false }) {
  const savings = Math.max(0, country.wallet - lost);
  const shown = useCountTo(savings);

  // Accuracy: share of calls made so far that were right. A rewound card counts as wrong.
  const right = results.filter((r, i) => {
    const outcome = r.rewound ? 'fooled' : judge(deck[i], r.decision);
    return outcome === 'caught' || outcome === 'trusted';
  }).length;
  const accuracy = results.length === 0 ? null : right / results.length;

  return (
    <div className={compact ? 'meters compact' : 'meters'}>
      <Meter label="Savings" value={formatMoney(shown, country)} ratio={savings / country.wallet} tone="savings" note="illustrative" />
      {!compact && (
        <>
          <Meter
            label="Accuracy"
            value={accuracy === null ? '—' : `${right} of ${results.length} right`}
            ratio={accuracy ?? 1}
            tone="accuracy"
            note="calls so far"
          />
          <div className="meter clues">
            <span className="meter-label">Clues marked</span>
            <span className="meter-value num">{cluesSoFar}</span>
          </div>
        </>
      )}
      <ol className="pips" aria-label="Progress through the round">
        {deck.map((card, i) => {
          let state = 'todo';
          if (i < results.length) {
            const r = results[i];
            const o = r.rewound ? 'fooled' : judge(card, r.decision);
            state = o === 'caught' || o === 'trusted' ? 'right' : 'wrong';
          } else if (i === index) state = 'now';
          return <li key={card.id} className={`pip ${state}`} aria-label={`Message ${i + 1}: ${state === 'todo' ? 'not yet' : state}`} />;
        })}
      </ol>
    </div>
  );
}

function Meter({ label, value, ratio, tone, note }) {
  return (
    <div className={`meter ${tone} ${ratio < 1 ? 'dipped' : ''}`}>
      <span className="meter-label">
        {label}
        {note && <small> · {note}</small>}
      </span>
      <span className="meter-value num">{value}</span>
      <span className="meter-track" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }} />
      </span>
    </div>
  );
}

/** Count towards a number instead of jumping, unless the player prefers reduced motion. */
function useCountTo(target) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const start = current.current;
    if (reduce || start === target) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    const t0 = performance.now();
    let raf;
    const step = now => {
      const p = Math.min(1, (now - t0) / 650);
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}
