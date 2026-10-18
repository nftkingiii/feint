import { useCallback, useEffect, useMemo, useState } from 'react';
import { CLUES } from './data/clues.js';
import { COUNTRY_BY_CODE } from './data/countries.js';
import { buildDeck, dailySeed, judge, randomSeed, readQuery, shareQuery } from './lib/engine.js';
import CountryPicker from './components/CountryPicker.jsx';
import Play from './components/Play.jsx';
import CaseFile from './components/CaseFile.jsx';
import FieldGuide from './components/FieldGuide.jsx';
import Flag from './components/Flag.jsx';

const TABS = [
  { id: 'play', label: 'Play' },
  { id: 'case', label: 'Case file' },
  { id: 'guide', label: 'Field guide' },
];

const EMPTY = { country: null, seed: null, results: [], index: 0, tab: 'play', shared: false };

function initialState() {
  const { country, seed, results } = readQuery(window.location.search);
  if (country && seed && results) return { country, seed, results, index: results.length, tab: 'case', shared: true };
  if (country) return { ...EMPTY, country, seed: seed ?? randomSeed() };
  return EMPTY;
}

export default function App() {
  const [state, setState] = useState(initialState);
  // Per-message UI state.
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rewound, setRewound] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [found, setFound] = useState(() => new Set());
  const [lastTap, setLastTap] = useState(null);

  const { country, seed, results, index, tab } = state;
  const deck = useMemo(() => (country && seed ? buildDeck(country, seed) : []), [country, seed]);
  const finished = deck.length > 0 && results.length === deck.length;
  const card = finished ? null : deck[index];
  const countryInfo = country ? COUNTRY_BY_CODE[country] : null;

  // Savings lost: every committed loss, plus the one on screen until the player rewinds.
  const lost =
    results.reduce((sum, r, i) => {
      const fooled = r.rewound || judge(deck[i], r.decision) === 'fooled';
      return sum + (fooled ? deck[i].lossAmount ?? 0 : 0);
    }, 0) + (feedback?.outcome === 'fooled' ? card.lossAmount : 0);
  const cluesSoFar = results.reduce((n, r) => n + (r.clues ?? 0), 0) + found.size;

  // Keep the address bar in step so any moment of a run can be shared or reloaded.
  useEffect(() => {
    if (!country || !seed) {
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const q = shareQuery({ country, seed, results: finished ? results : null });
    window.history.replaceState(null, '', `${window.location.pathname}${q}`);
  }, [country, seed, finished, results]);

  const resetCard = () => {
    setChecking(false);
    setVerified(false);
    setRewound(false);
    setFeedback(null);
    setFound(new Set());
    setLastTap(null);
  };

  function startRun(code, nextSeed = randomSeed()) {
    resetCard();
    setState({ ...EMPTY, country: code, seed: nextSeed });
  }

  const setTab = id => setState(s => ({ ...s, tab: id }));

  const onTap = useCallback(
    clueIndex => {
      if (!card || feedback) return;
      const clue = clueIndex === null ? null : CLUES[card.id]?.[clueIndex];
      if (!clue) {
        setLastTap({ mood: 'calm', text: 'Nothing odd there. Keep looking, or decide.' });
        return;
      }
      setFound(prev => new Set(prev).add(clueIndex));
      setLastTap({ mood: 'happy', text: clue.note });
    },
    [card, feedback],
  );

  const onCheck = useCallback(() => {
    setVerified(true);
    setChecking(true);
  }, []);

  const onCloseCheck = useCallback(() => setChecking(false), []);

  const onDecide = useCallback(
    decision => {
      if (!card || feedback) return;
      setChecking(false);
      setFeedback({ outcome: judge(card, decision), decision });
    },
    [card, feedback],
  );

  // Rewind: undo a decision that got the player fooled and try the same message again.
  const onRewind = useCallback(() => {
    setRewound(true);
    setFeedback(null);
    setLastTap(null);
  }, []);

  const onNext = useCallback(() => {
    if (!feedback) return;
    const entry = { decision: feedback.decision, verified, rewound, clues: found.size };
    resetCard();
    setState(s => {
      const nextResults = [...s.results, entry];
      const done = nextResults.length === deck.length;
      return { ...s, results: nextResults, index: s.index + 1, tab: done ? 'case' : 'play', shared: false };
    });
  }, [feedback, verified, rewound, found, deck.length]);

  if (!countryInfo) {
    return (
      <Shell>
        <CountryPicker onPick={code => startRun(code)} />
      </Shell>
    );
  }

  return (
    <Shell
      country={countryInfo}
      tabs={
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
              {t.id === 'case' && finished && <span className="tab-dot" aria-label="ready" />}
            </button>
          ))}
        </nav>
      }
      onChangeCountry={() => {
        resetCard();
        setState(EMPTY);
      }}
    >
      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="tab-panel">
        {tab === 'play' && (
          <Play
            country={countryInfo}
            deck={deck}
            results={results}
            index={index}
            card={card}
            finished={finished}
            checking={checking}
            verified={verified}
            feedback={feedback}
            found={found}
            lastTap={lastTap}
            lost={lost}
            cluesSoFar={cluesSoFar}
            onTap={onTap}
            onCheck={onCheck}
            onCloseCheck={onCloseCheck}
            onDecide={onDecide}
            onRewind={onRewind}
            onNext={onNext}
            onShowCase={() => setTab('case')}
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

function Shell({ country, tabs, onChangeCountry, children }) {
  return (
    <div className="app">
      <header className="masthead">
        <span className="wordmark">Feint</span>
        {tabs}
        {country && (
          <button className="country-chip" onClick={onChangeCountry} aria-label={`Country: ${country.name}. Change country`}>
            <Flag code={country.code} />
            <span className="chip-name">{country.name}</span>
          </button>
        )}
      </header>
      <main>{children}</main>
      <footer className="footer">
        Messages are simulated for practice and links never open. Amounts are illustrative. Every pattern links to its
        source in the Field guide.
      </footer>
    </div>
  );
}
