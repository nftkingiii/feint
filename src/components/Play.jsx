import { useEffect } from 'react';
import { CLUES } from '../data/clues.js';
import { PATTERN_BY_ID } from '../data/patterns.js';
import { formatMoney } from '../lib/engine.js';
import Card from './Card.jsx';
import Guide from './Guide.jsx';
import Meters from './Meters.jsx';

const CHANNEL_NOUN = { sms: 'text', whatsapp: 'WhatsApp message', call: 'call', email: 'email' };

/** What Vee says right now, and how Vee looks saying it. */
function guideLine({ index, card, feedback, checking, lastTap }) {
  if (feedback) {
    const tell = card.tell;
    if (feedback.outcome === 'caught') return { mood: 'happy', text: `Nice catch. ${tell}` };
    if (feedback.outcome === 'trusted') return { mood: 'happy', text: `Good call. Not everything is a scam: ${tell.charAt(0).toLowerCase()}${tell.slice(1)}` };
    if (feedback.outcome === 'missed') return { mood: 'worried', text: `That one was real. ${tell}` };
    return { mood: 'worried', text: `Ouch. ${tell}` };
  }
  if (checking) return { mood: 'calm', text: 'This is the channel you already trust. Does it agree with the message?' };
  if (lastTap) return lastTap;
  if (index === 0) return { mood: 'calm', text: 'Read it the way a scammer would write it. Tap anything that looks off, then decide.' };
  return { mood: 'calm', text: 'What do you notice? Tap anything that looks off.' };
}

export default function Play(props) {
  const { country, deck, results, index, card, finished, checking, verified, feedback, found, lastTap, lost, cluesSoFar } = props;
  const { onTap, onCheck, onCloseCheck, onDecide, onRewind, onNext, onShowCase } = props;

  useShortcuts({ card, feedback, finished, checking, onCheck, onCloseCheck, onDecide, onRewind, onNext });

  if (finished) {
    return (
      <div className="round-done">
        <h2>That was the last message.</h2>
        <button className="btn primary" onClick={onShowCase}>
          Open your case file
        </button>
      </div>
    );
  }

  const clues = CLUES[card.id] ?? [];
  const line = guideLine({ index, card, feedback, checking, lastTap });

  return (
    <div className="desk">
      <aside className="desk-left">
        <Meters country={country} deck={deck} results={results} index={index} lost={lost} cluesSoFar={cluesSoFar} />
      </aside>

      <div className="desk-center">
        <p className="situation-label">
          Message {index + 1} of {deck.length} · a {CHANNEL_NOUN[card.channel]}
        </p>
        <p className="situation">{card.context}</p>
        <Card
          card={card}
          clues={clues}
          found={found}
          onTap={onTap}
          checking={checking}
          outcome={feedback?.outcome ?? null}
          locked={Boolean(feedback)}
          onSwipe={onDecide}
          onCloseCheck={onCloseCheck}
        />
        {!feedback && !checking && (
          <p className="swipe-hint" aria-hidden="true">
            <span>Drag left or press ← to ignore</span>
            <span>Drag right or press → to act</span>
          </p>
        )}
      </div>

      <aside className="desk-right">
        <Guide mood={line.mood}>{line.text}</Guide>

        {!feedback && (
          <div className="decisions" role="group" aria-label="What do you do?">
            <button className="chunky act" onClick={() => onDecide('act')} aria-keyshortcuts="A">
              <span>{card.act}</span>
              <kbd aria-hidden="true">A</kbd>
            </button>
            <button
              className="chunky check"
              onClick={checking ? onCloseCheck : onCheck}
              aria-keyshortcuts="C"
              aria-pressed={checking}
            >
              <span>{checking ? 'Back to the message' : verified ? 'Look at your check again' : 'Check first'}</span>
              <kbd aria-hidden="true">C</kbd>
            </button>
            <button className="chunky ignore" onClick={() => onDecide('ignore')} aria-keyshortcuts="I">
              <span>Ignore it</span>
              <kbd aria-hidden="true">I</kbd>
            </button>
          </div>
        )}

        {feedback?.outcome === 'fooled' && (
          <div className="loss-panel" role="alert">
            <p className="loss-amount num">−{formatMoney(card.lossAmount, country)}</p>
            <p className="loss-what">{card.loss}</p>
            <p className="loss-trick">The trick: {PATTERN_BY_ID[card.pattern].name}</p>
            <p className="loss-note">Amounts are illustrative.</p>
            <div className="panel-actions">
              <button className="chunky primary" onClick={onRewind} autoFocus>
                <span>Rewind and try again</span>
                <kbd aria-hidden="true">R</kbd>
              </button>
              <button className="chunky plain" onClick={onNext}>
                <span>Take the loss</span>
              </button>
            </div>
          </div>
        )}

        {feedback && feedback.outcome !== 'fooled' && (
          <div className="panel-actions">
            <button className="chunky primary" onClick={onNext} autoFocus>
              <span>{index === deck.length - 1 ? 'See your case file' : 'Next message'}</span>
              <kbd aria-hidden="true">Enter</kbd>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/** A / C / I to decide, R to rewind, Enter for the next message, Escape to close a check. */
function useShortcuts({ card, feedback, finished, checking, onCheck, onCloseCheck, onDecide, onRewind, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (finished || !card || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      const key = e.key.toLowerCase();
      let handled = true;
      if (!feedback) {
        if (key === 'a') onDecide('act');
        else if (key === 'i') onDecide('ignore');
        else if (key === 'c') (checking ? onCloseCheck : onCheck)();
        else if (key === 'escape' && checking) onCloseCheck();
        else handled = false;
      } else if (key === 'r' && feedback.outcome === 'fooled') onRewind();
      else if (key === 'enter' && e.target?.tagName !== 'BUTTON') onNext();
      else handled = false;
      if (handled) e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, feedback, finished, checking, onCheck, onCloseCheck, onDecide, onRewind, onNext]);
}
