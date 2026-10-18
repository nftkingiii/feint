import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_BY_CODE } from './data/countries.js';
import { buildDeck, dailySeed, judge, randomSeed, readQuery, shareQuery } from './lib/engine.js';
import CountryPicker from './components/CountryPicker.jsx';
import Play from './components/Play.jsx';
import Check from './components/Check.jsx';
import CaseFile from './components/CaseFile.jsx';
import FieldGuide from './components/FieldGuide.jsx';

const TABS = [
  { id: 'play', label: 'Play' },
  { id: 'check', label: 'Check' },
  { id: 'case', label: 'Case file' },
  { id: 'guide', label: 'Field guide' },
];

function initialState() {
  const { country, seed, results } = readQuery(window.location.search);
  if (country && seed && results) {
    return { country, seed, results, index: results.length, tab: 'case', shared: true };
  }
  if (country) {
    return { country, seed: seed ?? randomSeed(), results: [], index: 0, tab: 'play', shared: false };
  }
  return { country: null, seed: null, results: [], index: 0, tab: 'play', shared: false };
}

export default function App() {
  const [state, setState] = useState(initialState);
  // Per-card UI state: whether the player opened Check, and the outcome shown after deciding.
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [rewound, setRewound] = useState(false);

  const { country, seed, results, index, tab } = state;
  const deck = useMemo(() => (country && seed ? buildDeck(country, seed) : []), [country, seed]);
  const finished = deck.length > 0 && results.length === deck.length;
  const card = finished ? null : deck[index];

  // Keep the address bar in step so any moment of a run can be shared or reloaded.
  useEffect(() => {
    if (!country || !seed) {
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const q = shareQuery({ country, seed, results: finished ? results : null });
    window.history.replaceState(null, '', `${window.location.pathname}${q}`);
  }, [country, seed, finished, results]);

  function startRun(code, nextSeed = randomSeed()) {
    setVerified(false);
    setRewound(false);
    setFeedback(null);
    setState({ country: code, seed: nextSeed, results: [], index: 0, tab: 'play', shared: false });
  }

  function setTab(id) {
    setState(s => ({ ...s, tab: id }));
  }

  function openCheck() {
    setVerified(true);
    setTab('check');
  }

  function decide(decision) {
    if (!card || feedback) return;
    const outcome = judge(card, decision);
    setFeedback({ outcome, decision });
    setState(s => ({ ...s, tab: 'play' }));
  }

  // Rewind: undo a decision that got the player fooled and try the same message again.
  function rewind() {
    setRewound(true);
    setFeedback(null);
  }

  function next() {
    if (!feedback) return;
    const entry = { decision: feedback.decision, verified, rewound };
    setFeedback(null);
    setVerified(false);
    setRewound(false);
    setState(s => {
      const nextResults = [...s.results, entry];
      const done = nextResults.length === deck.length;
      return { ...s, results: nextResults, index: s.index + 1, tab: done ? 'case' : 'play', shared: false };
    });
  }

  if (!country) {
    return (
      <Shell>
        <CountryPicker onPick={code => startRun(code)} />
      </Shell>
    );
  }

  const countryInfo = COUNTRY_BY_CODE[country];

  return (
    <Shell
      country={countryInfo}
      onChangeCountry={() => {
        setVerified(false);
        setFeedback(null);
        setRewound(false);
        setState({ country: null, seed: null, results: [], index: 0, tab: 'play', shared: false });
      }}
    >
      <nav className="tabs" role="tablist" aria-label="Feint sections">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="panel">
        {tab === 'play' && (
          <Play
            country={countryInfo}
            deck={deck}
            index={index}
            card={card}
            finished={finished}
            verified={verified}
            feedback={feedback}
            onCheck={openCheck}
            onDecide={decide}
            onRewind={rewind}
            onNext={next}
            onShowCase={() => setTab('case')}
          />
        )}
        {tab === 'check' && (
          <Check
            country={countryInfo}
            card={card}
            verified={verified}
            locked={Boolean(feedback)}
            onDecide={decide}
            onBack={() => setTab('play')}
          />
        )}
        {tab === 'case' && (
          <CaseFile
            country={countryInfo}
            deck={deck}
            results={results}
            seed={seed}
            finished={finished}
            shared={state.shared}
            onPlayAgain={() => startRun(country)}
            onDaily={() => startRun(country, dailySeed())}
            onResume={() => setTab('play')}
          />
        )}
        {tab === 'guide' && <FieldGuide country={countryInfo} />}
      </section>
    </Shell>
  );
}

function Shell({ country, onChangeCountry, children }) {
  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">Feint</h1>
        {country && (
          <button className="country-chip" onClick={onChangeCountry} aria-label={`Country: ${country.name}. Change country`}>
            <span aria-hidden="true">{country.flag}</span> {country.name}
          </button>
        )}
      </header>
      <main>{children}</main>
      <footer className="footer">
        Messages are simulated for practice. Amounts are illustrative. Every pattern links to its source in the Field guide.
      </footer>
    </div>
  );
}
