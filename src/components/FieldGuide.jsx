import { PATTERNS } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';

function snippet(text, max = 96) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Every pattern, its tell, how it shows up in the chosen country, and where the facts come from. */
export default function FieldGuide({ country }) {
  return (
    <div className="field-guide">
      <header className="guide-head">
        <h2>Field guide</h2>
        <p>Ten tricks scammers use everywhere, and how they look in {country.name}.</p>
      </header>
      <ol className="pattern-grid">
        {PATTERNS.map((p, i) => {
          const local = country.cards.find(c => c.pattern === p.id && c.kind === 'scam');
          return (
            <li key={p.id} className="pattern-card">
              <span className="pattern-num num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.name}</h3>
              <p className="pattern-trick">{p.trick}</p>
              <p className="pattern-tell">
                <mark>The tell</mark> {p.tell}
              </p>
              {local && <p className="pattern-local">“{snippet(local.body)}”</p>}
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
        })}
      </ol>
    </div>
  );
}
