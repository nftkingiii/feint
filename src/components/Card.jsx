import { useEffect, useRef, useState } from 'react';

const SWIPE_AT = 110; // px of drag that commits a decision
const TAP_SLOP = 6; // px of movement still treated as a tap

const CHANNEL = {
  sms: { label: 'Text message', icon: 'M4 5h16v10H8l-4 4z' },
  whatsapp: { label: 'WhatsApp', icon: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z' },
  call: {
    label: 'Incoming call',
    icon: 'M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
  },
  email: { label: 'Email', icon: 'M3 6h18v12H3zM3 6l9 7 9-7' },
};

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Split text into tappable segments. Clue phrases become their own segment;
 * the rest is cut at sentence and comma breaks so every part of the message is
 * tappable and focusable, and the clues cannot be spotted from the layout.
 */
export function segment(text, clues) {
  const hits = [];
  clues.forEach((clue, index) => {
    const at = text.indexOf(clue.text);
    if (at >= 0) hits.push({ start: at, end: at + clue.text.length, index });
  });
  hits.sort((a, b) => a.start - b.start);

  const out = [];
  let pos = 0;
  const pushPlain = chunk => {
    for (const part of chunk.split(/(?<=[.,!?:])\s+/)) if (part.trim()) out.push({ text: part.trim(), clue: null });
  };
  for (const hit of hits) {
    if (hit.start < pos) continue;
    pushPlain(text.slice(pos, hit.start));
    out.push({ text: text.slice(hit.start, hit.end), clue: hit.index });
    pos = hit.end;
  }
  pushPlain(text.slice(pos));
  return out;
}

function Segments({ text, clues, found, onTap }) {
  return segment(text, clues).map((seg, i) => {
    const isFound = seg.clue !== null && found.has(seg.clue);
    // An inline span (not a <button>) so the message wraps like normal text.
    return (
      <span key={i}>
        <span
          role="button"
          tabIndex={0}
          className={isFound ? 'seg found' : 'seg'}
          onClick={() => onTap(seg.clue)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onTap(seg.clue);
            }
          }}
          aria-pressed={isFound}
        >
          {seg.text}
        </span>{' '}
      </span>
    );
  });
}

const STAMP = {
  caught: { text: 'Scam avoided', tone: 'good' },
  trusted: { text: 'Real. Good call', tone: 'good' },
  missed: { text: 'That was real', tone: 'warn' },
  fooled: { text: 'Feinted', tone: 'bad' },
};

/**
 * The message card. Drag it right to act, left to ignore (mouse or touch);
 * tap any part of it to mark a clue. Flips over to show what the trusted
 * channel says when the player checks.
 */
export default function Card({ card, clues, found, onTap, checking, outcome, locked, onSwipe, onCloseCheck }) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    setDx(0);
    setLeaving(null);
  }, [card.id]);

  const canSwipe = !locked && !checking;

  function onPointerDown(e) {
    if (!canSwipe || e.button > 0) return;
    drag.current = { x: e.clientX, id: e.pointerId, moved: false };
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const delta = e.clientX - d.x;
    if (!d.moved && Math.abs(delta) > TAP_SLOP) {
      d.moved = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) setDx(delta);
  }

  function onPointerUp(e) {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    suppressClick.current = true;
    if (Math.abs(dx) >= SWIPE_AT) {
      const decision = dx > 0 ? 'act' : 'ignore';
      if (prefersReducedMotion()) {
        setDx(0);
        onSwipe(decision);
      } else {
        setLeaving(decision);
        setTimeout(() => {
          setLeaving(null);
          setDx(0);
          onSwipe(decision);
        }, 180);
      }
    } else {
      setDx(0);
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  // A drag that ends on a segment must not also count as a tap on it.
  function onClickCapture(e) {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  const channel = CHANNEL[card.channel];
  const stamp = outcome ? STAMP[outcome] : null;
  const offset = leaving ? (leaving === 'act' ? 640 : -640) : dx;
  const pull = Math.min(1, Math.abs(dx) / SWIPE_AT);
  const style = {
    transform: `translateX(${offset}px) rotate(${offset / 22}deg)`,
    transition: drag.current ? 'none' : undefined,
  };

  return (
    <div className="card-stage">
      <div className="card-shadow one" aria-hidden="true" />
      <div className="card-shadow two" aria-hidden="true" />
      <div
        className={`card ${checking ? 'flipped' : ''} ${leaving ? 'leaving' : ''}`}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDx(0);
        }}
        onClickCapture={onClickCapture}
      >
        <div className="card-inner">
          <article className="card-face front" aria-label={`${channel.label} from ${card.from}`} aria-hidden={checking}>
            <header className="card-head">
              <span className={`channel-badge ${card.channel}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={channel.icon} />
                </svg>
                {channel.label}
              </span>
              <span className="card-time">9:41</span>
            </header>
            <p className="card-from">
              <Segments text={card.from} clues={clues} found={found} onTap={onTap} />
            </p>
            <p className="card-body">
              <Segments text={card.body} clues={clues} found={found} onTap={onTap} />
            </p>
            <footer className="card-foot">
              {found.size > 0 ? (
                <span className="clue-count">
                  {found.size} {found.size === 1 ? 'clue' : 'clues'} marked
                </span>
              ) : (
                <span>Tap anything that looks off</span>
              )}
            </footer>
            <span className="swipe-label act" style={{ opacity: dx > 0 ? pull : 0 }} aria-hidden="true">
              Act
            </span>
            <span className="swipe-label ignore" style={{ opacity: dx < 0 ? pull : 0 }} aria-hidden="true">
              Ignore
            </span>
          </article>

          <section className="card-face back" aria-hidden={!checking} aria-label="What the trusted channel shows">
            <p className="back-kicker">Checked through a channel you trust</p>
            <h3 className="back-title">{card.check.heading}</h3>
            <ul className="back-list">
              {card.check.lines.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button type="button" className="back-close" onClick={onCloseCheck} tabIndex={checking ? 0 : -1}>
              Back to the message
            </button>
          </section>
        </div>
        {stamp && <div className={`stamp ${stamp.tone}`}>{stamp.text}</div>}
      </div>
    </div>
  );
}
