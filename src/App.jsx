import { useCallback, useEffect, useMemo, useState } from 'react';
import { CLUES } from './data/clues.js';
import { COUNTRY_BY_CODE } from './data/countries.js';
import { buildDeck, dailySeed, judge, randomSeed, readQuery, shareQuery } from './lib/engine.js';
import { recallRound, rememberRound } from './lib/history.js';
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

const EMPTY = { country: null, seed: null, results: [], index: 0, tab: 'play', shared: false, damaged: false, guide: null };

function initialState() {
  const { country, seed, results, damaged } = readQuery(window.location.search);
  if (country && seed && results) return { ...EMPTY, country, seed, results, index: results.length, tab: 'case', shared: true };
  // A link that names a country but whose result part is unreadable starts the
  // round fresh, and says so, instead of looking like a working case file.
  if (country) return { ...EMPTY, country, seed: seed ?? randomSeed(), damaged };
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
  // A finished result for this same round, remembered from an earlier visit in this browser.
  const previous = useMemo(() => (country && seed && !state.shared ? recallRound(country, seed) : null), [country, seed, state.shared]);

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
    const nextResults = [...results, entry];
    const done = nextResults.length === deck.length;
    if (done) rememberRound(country, seed, nextResults);
    resetCard();
    setState(s => ({ ...s, results: nextResults, index: s.index + 1, tab: done ? 'case' : 'play', shared: false }));
  }, [feedback, verified, rewound, found, results, deck.length, country, seed]);

  if (!countryInfo && state.guide) {
    // The field guide, opened from the landing page before any round.
    const guideCountry = COUNTRY_BY_CODE[state.guide];
    return (
      <Shell>
        <div className="guide-bar">
          <button className="chunky plain inline" onClick={() => setState(EMPTY)}>
            <span>← Back</span>
          </button>
          <button className="chunky primary inline" onClick={() => startRun(state.guide)}>
            <span>Start playing</span>
          </button>
        </div>
        <FieldGuide country={guideCountry} />
      </Shell>
    );
  }

  if (!countryInfo) {
    return (
      <Shell>
        <CountryPicker
          onPick={code => startRun(code)}
          onDaily={code => startRun(code, dailySeed())}
          onGuide={code => setState({ ...EMPTY, guide: code })}
        />
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
      {previous && !finished && results.length === 0 && tab === 'play' && !state.damaged && (
        <div className="notice info" role="status">
          <p>You finished this round before. Your earlier case file is still here, or play it again.</p>
          <button className="chunky plain inline" onClick={() => setTab('case')}>
            <span>See your case file</span>
          </button>
        </div>
      )}
      {state.damaged && (
        <div className="notice" role="status">
          <p>That case file link is incomplete, so it can’t be shown. You’re playing the same round from the start instead.</p>
          <button className="notice-close" onClick={() => setState(s => ({ ...s, damaged: false }))} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="tab-panel">
        {tab === 'play' && (
          <Play
            country={countryInfo}
            seed={seed}
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
            previous={previous}
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
