import { PATTERNS } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';

function snippet(text, max = 90) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Every pattern, its tell, how it shows up in the chosen country, and where the facts come from. */
export default function FieldGuide({ country }) {
  return (
    <div className="guide">
      <h2>Field guide</h2>
      <p className="guide-lede">Ten tricks scammers use everywhere, and how they look in {country.name}.</p>
      <ul className="patterns">
        {PATTERNS.map(p => {
          const local = country.cards.filter(c => c.pattern === p.id && c.kind === 'scam');
          return (
            <li key={p.id} className="pattern">
              <h3>{p.name}</h3>
              <p>{p.trick}</p>
              <p className="tell">
                <strong>The tell:</strong> {p.tell}
              </p>
              {local.length > 0 && (
                <p className="local">
                  In {country.name}, it can look like: “{snippet(local[0].body)}”
                </p>
              )}
              <p className="cite">
                Sources:{' '}
                {p.sources.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ', '}
                    <a href={SOURCES[id].url} target="_blank" rel="noreferrer">
                      {SOURCES[id].publisher}
                    </a>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
