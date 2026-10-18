import { useState } from 'react';
import { CLUES } from '../data/clues.js';
import { PATTERNS } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';

/** Every pattern, its tell, how it shows up in the chosen country, and where the facts come from. */
export default function FieldGuide({ country }) {
  return (
    <div className="field-guide">
      <header className="guide-head">
        <h2>Field guide</h2>
        <p>Ten tricks scammers use everywhere, and how they look in {country.name}.</p>
      </header>
      <ol className="pattern-grid">
        {PATTERNS.map((p, i) => (
          <PatternCard key={p.id} pattern={p} number={i + 1} country={country} />
        ))}
      </ol>
    </div>
  );
}

function PatternCard({ pattern: p, number, country }) {
  const [open, setOpen] = useState(false);
  const examples = country.cards.filter(c => c.pattern === p.id && c.kind === 'scam');
  const panelId = `pattern-${p.id}-examples`;

  return (
    <li className={open ? 'pattern-card open' : 'pattern-card'}>
      <span className="pattern-num num">{String(number).padStart(2, '0')}</span>
      <h3>{p.name}</h3>
      <p className="pattern-trick">{p.trick}</p>
      <p className="pattern-tell">
        <mark>The tell</mark> {p.tell}
      </p>

      {examples.length > 0 ? (
        <>
          <button
            type="button"
            className="pattern-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(o => !o)}
          >
            {open ? 'Hide examples' : `See ${examples.length === 1 ? 'the example' : `${examples.length} examples`} from ${country.name}`}
          </button>
          {open && (
            <ul className="pattern-examples" id={panelId}>
              {examples.map(card => (
                <li key={card.id}>
                  <p className="example-from">{card.from}</p>
                  <p className="example-body">“{card.body}”</p>
                  {CLUES[card.id]?.length > 0 && (
                    <p className="example-clues">
                      Clues: {CLUES[card.id].map(clue => `“${clue.text}”`).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="pattern-none">No example in the {country.name} deck yet.</p>
      )}

      <p className="cite">
        {p.sources.map((id, j) => (
          <span key={id}>
            {j > 0 && ' · '}
            <a href={SOURCES[id].url} target="_blank" rel="noreferrer">
              {SOURCES[id].publisher}
            </a>
          </span>
        ))}
      </p>
    </li>
  );
}
