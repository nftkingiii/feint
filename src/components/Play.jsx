import { useEffect, useRef } from 'react';
import { PATTERN_BY_ID } from '../data/patterns.js';
import { formatMoney } from '../lib/engine.js';
import Message from './Message.jsx';

export default function Play({
  country,
  deck,
  index,
  card,
  finished,
  verified,
  feedback,
  onCheck,
  onDecide,
  onRewind,
  onNext,
  onShowCase,
}) {
  if (finished) {
    return (
      <div className="empty">
        <h2>That was the last message.</h2>
        <button className="primary" onClick={onShowCase}>
          Open your case file
        </button>
      </div>
    );
  }

  return (
    <div className="play">
      <p className="progress" aria-live="polite">
        Message {index + 1} of {deck.length}
      </p>
      <p className="context">{card.context}</p>

      <Message card={card} />

      {!feedback && (
        <div className="actions" role="group" aria-label="What do you do?">
          <button className="action act" onClick={() => onDecide('act')}>
            {card.act}
          </button>
          <button className="action check" onClick={onCheck}>
            {verified ? 'See what you checked' : 'Check first'}
          </button>
          <button className="action ignore" onClick={() => onDecide('ignore')}>
            Ignore it
          </button>
        </div>
      )}

      {feedback && feedback.outcome === 'fooled' && (
        <Feinted country={country} card={card} onRewind={onRewind} onNext={onNext} />
      )}
      {feedback && feedback.outcome !== 'fooled' && (
        <Verdict outcome={feedback.outcome} card={card} last={index === deck.length - 1} onNext={onNext} />
      )}
    </div>
  );
}

const VERDICT_COPY = {
  caught: { title: 'Scam avoided.', tone: 'good' },
  trusted: { title: 'Right call, it was real.', tone: 'good' },
  missed: { title: 'That one was real.', tone: 'warn' },
};

function Verdict({ outcome, card, last, onNext }) {
  const copy = VERDICT_COPY[outcome];
  const pattern = PATTERN_BY_ID[card.pattern];
  const ref = useFocus();
  return (
    <div className={`verdict ${copy.tone}`} role="status" ref={ref} tabIndex={-1}>
      <h2>{copy.title}</h2>
      {card.kind === 'scam' && <p className="pattern-name">{pattern.name}</p>}
      <p>{card.tell}</p>
      <button className="primary" onClick={onNext}>
        {last ? 'See your case file' : 'Next message'}
      </button>
    </div>
  );
}

/** The fail screen: exactly what the scammer got, the clue that was missed, and a rewind. */
function Feinted({ country, card, onRewind, onNext }) {
  const pattern = PATTERN_BY_ID[card.pattern];
  const ref = useFocus();
  return (
    <div className="feinted" role="alertdialog" aria-labelledby="feinted-title" ref={ref} tabIndex={-1}>
      <h2 id="feinted-title">You were feinted.</h2>
      <dl className="loss">
        <div>
          <dt>What they got</dt>
          <dd>{card.loss}</dd>
        </div>
        <div>
          <dt>Illustrative cost</dt>
          <dd className="num">{formatMoney(card.lossAmount, country)}</dd>
        </div>
        <div>
          <dt>The trick</dt>
          <dd>{pattern.name}</dd>
        </div>
        <div>
          <dt>The clue you missed</dt>
          <dd>{card.tell}</dd>
        </div>
      </dl>
      <div className="feinted-actions">
        <button className="primary" onClick={onRewind}>
          Rewind and try again
        </button>
        <button className="secondary" onClick={onNext}>
          Keep the loss and move on
        </button>
      </div>
    </div>
  );
}

function useFocus() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
