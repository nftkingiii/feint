import { useState } from 'react';
import { PATTERN_BY_ID } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';
import { formatMoney, shareQuery, summarize } from '../lib/engine.js';

const OUTCOME_LABEL = {
  caught: 'Scam avoided',
  trusted: 'Real, trusted',
  fooled: 'Fooled',
  missed: 'Real, ignored',
};

export default function CaseFile({ country, deck, results, seed, finished, shared, onPlayAgain, onDaily, onResume }) {
  const [copied, setCopied] = useState(false);

  if (!finished) {
    return (
      <div className="empty">
        <h2>Your case file opens when the round ends.</h2>
        <p>
          {results.length} of {deck.length} messages handled so far.
        </p>
        <button className="secondary" onClick={onResume}>
          Back to the messages
        </button>
      </div>
    );
  }

  const s = summarize(deck, results);
  const link = `${window.location.origin}${window.location.pathname}${shareQuery({ country: country.code, seed, results })}`;

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
      {shared && <p className="shared-note">You are viewing a shared case file.</p>}
      <h2 className="rank">{s.rank}</h2>
      <p className="score" aria-label={`Score: ${s.correct} out of ${s.total}`}>
        <span className="num">{s.correct}</span> of {s.total} right
      </p>

      <dl className="stats">
        <div>
          <dt>Scams avoided</dt>
          <dd className="num">{s.rows.filter(r => r.outcome === 'caught').length}</dd>
        </div>
        <div>
          <dt>Times fooled</dt>
          <dd className="num">{s.fooled}</dd>
        </div>
        <div>
          <dt>Real messages ignored</dt>
          <dd className="num">{s.missed}</dd>
        </div>
        <div>
          <dt>Checked first</dt>
          <dd className="num">{s.verified}</dd>
        </div>
        <div>
          <dt>Illustrative loss avoided</dt>
          <dd className="num">{formatMoney(s.lossAvoided, country)}</dd>
        </div>
        <div>
          <dt>Illustrative loss taken</dt>
          <dd className="num">{formatMoney(s.lossTaken, country)}</dd>
        </div>
      </dl>

      <ol className="case-rows">
        {s.rows.map(row => (
          <li key={row.card.id} className={`case-row ${row.correct ? 'right' : 'wrong'}`}>
            <span className="outcome">{row.rewound ? 'Fooled, caught on rewind' : OUTCOME_LABEL[row.outcome]}</span>
            <span className="from">{row.card.from}</span>
            <span className="tell">
              {row.card.kind === 'scam' ? `${PATTERN_BY_ID[row.card.pattern].name}: ` : ''}
              {row.card.tell}
            </span>
          </li>
        ))}
      </ol>

      <section className="report" aria-labelledby="report-title">
        <h3 id="report-title">If it happens for real in {country.name}</h3>
        <ul>
          {country.report.map(line => (
            <li key={line.text}>
              {line.href ? (
                <a href={line.href} target="_blank" rel="noreferrer">
                  {line.text}
                </a>
              ) : (
                line.text
              )}
              {line.source && SOURCES[line.source] && (
                <span className="cite">
                  {' '}
                  (
                  <a href={SOURCES[line.source].url} target="_blank" rel="noreferrer">
                    {SOURCES[line.source].publisher}
                  </a>
                  )
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
          <button className="secondary" onClick={copy}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="case-actions">
        <button className="primary" onClick={onPlayAgain}>
          Play a new round
        </button>
        <button className="secondary" onClick={onDaily}>
          Play today's challenge
        </button>
      </div>
    </div>
  );
}
