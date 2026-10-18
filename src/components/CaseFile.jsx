import { useState } from 'react';
import { PATTERN_BY_ID } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';
import { formatMoney, shareQuery, summarize } from '../lib/engine.js';
import Guide from './Guide.jsx';

const OUTCOME = {
  caught: { label: 'Scam avoided', tone: 'good' },
  trusted: { label: 'Real, trusted', tone: 'good' },
  fooled: { label: 'Fooled', tone: 'bad' },
  missed: { label: 'Real, ignored', tone: 'warn' },
};

function closingLine(s) {
  if (s.correct === s.total) return { mood: 'happy', text: 'Not one feint got past you. Try today’s challenge, or send this to someone who needs it.' };
  if (s.fooled === 0) return { mood: 'calm', text: 'No scam got you, but you ignored a real message. Checking first tells the two apart.' };
  return { mood: 'worried', text: 'Look at the clues you missed below. Scammers reuse the same few tricks everywhere.' };
}

export default function CaseFile({ country, deck, results, seed, finished, shared, previous, onPlayAgain, onDaily, onResume }) {
  const [copied, setCopied] = useState(false);

  // During a replay of a round finished earlier, show that earlier result.
  const shown = finished ? results : previous;
  if (!shown) {
    return (
      <div className="round-done">
        <h2>Your case file opens when the round ends.</h2>
        <p>
          {results.length} of {deck.length} messages handled so far.
        </p>
        <button className="chunky plain" onClick={onResume}>
          <span>Back to the messages</span>
        </button>
      </div>
    );
  }

  const s = summarize(deck, shown);
  const left = Math.max(0, country.wallet - s.lossTaken);
  const link = `${window.location.origin}${window.location.pathname}${shareQuery({ country: country.code, seed, results: shown })}`;
  const line = closingLine(s);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="case">
      <section className="dossier">
        {shared && <p className="shared-note">A shared case file</p>}
        {!finished && (
          <div className="replay-note">
            <p>
              Your earlier result for this round. In this replay you have handled {results.length} of {deck.length} messages.
            </p>
            <button className="chunky plain inline" onClick={onResume}>
              <span>Back to the messages</span>
            </button>
          </div>
        )}
        <div className="dossier-head">
          <div>
            <p className="dossier-label">Case file · {country.name}</p>
            <h2 className="rank">{s.rank}</h2>
            <p className="score">
              <span className="num">{s.correct}</span> of {s.total} calls right
            </p>
          </div>
          <div className={`seal ${s.correct === s.total ? 'good' : s.fooled > 0 ? 'bad' : 'warn'}`} aria-hidden="true">
            <span className="num">{s.correct}</span>
            <small>/{s.total}</small>
          </div>
        </div>

        <ol className="grid-share" aria-label="Your round at a glance">
          {s.rows.map((row, i) => (
            <li key={row.card.id} className={`cell ${OUTCOME[row.outcome].tone}`} aria-label={`Message ${i + 1}: ${OUTCOME[row.outcome].label}`} />
          ))}
        </ol>

        <dl className="ledger">
          <div>
            <dt>Savings left</dt>
            <dd className="num">{formatMoney(left, country)}</dd>
          </div>
          <div>
            <dt>Losses dodged</dt>
            <dd className="num good-text">{formatMoney(s.lossAvoided, country)}</dd>
          </div>
          <div>
            <dt>Checked first</dt>
            <dd className="num">
              {s.verified}/{s.total}
            </dd>
          </div>
          <div>
            <dt>Clues marked</dt>
            <dd className="num">{s.clues ?? '—'}</dd>
          </div>
        </dl>
        <p className="fineprint">Amounts are illustrative.</p>
      </section>

      <Guide mood={line.mood}>{line.text}</Guide>

      <ol className="timeline">
        {s.rows.map((row, i) => {
          const o = OUTCOME[row.outcome];
          return (
            <li key={row.card.id} className={`entry ${o.tone}`}>
              <span className="entry-num num">{String(i + 1).padStart(2, '0')}</span>
              <div className="entry-body">
                <p className="entry-top">
                  <span className={`chip ${o.tone}`}>{row.rewound ? 'Fooled, caught on rewind' : o.label}</span>
                  <span className="entry-from">{row.card.from}</span>
                  {row.verified && <span className="chip neutral">Checked</span>}
                </p>
                {row.card.kind === 'scam' && <p className="entry-pattern">{PATTERN_BY_ID[row.card.pattern].name}</p>}
                <p className="entry-tell">{row.card.tell}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="report" aria-labelledby="report-title">
        <h3 id="report-title">If it happens for real in {country.name}</h3>
        <ul>
          {country.report.map(r => (
            <li key={r.text}>
              {r.href ? (
                <a href={r.href} target="_blank" rel="noreferrer">
                  {r.text}
                </a>
              ) : (
                r.text
              )}
              {r.source && SOURCES[r.source] && (
                <span className="cite">
                  {' '}
                  Source:{' '}
                  <a href={SOURCES[r.source].url} target="_blank" rel="noreferrer">
                    {SOURCES[r.source].publisher}
                  </a>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="share">
        <label htmlFor="share-link">Share this case file</label>
        <div className="share-row">
          <input id="share-link" readOnly value={link} onFocus={e => e.target.select()} />
          <button className="chunky plain" onClick={copy}>
            <span>{copied ? 'Link copied' : 'Copy link'}</span>
          </button>
        </div>
      </div>

      <div className="panel-actions">
        <button className="chunky primary" onClick={onPlayAgain}>
          <span>Play a new round</span>
        </button>
        <button className="chunky plain" onClick={onDaily}>
          <span>Play today’s challenge</span>
        </button>
      </div>
    </div>
  );
}
