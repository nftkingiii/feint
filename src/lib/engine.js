import { COUNTRY_BY_CODE } from '../data/countries.js';

export const DECK_SIZE = 8;
const MIN_GENUINE = 2;

/** Small, fast, deterministic PRNG so a seed always deals the same deck. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rand) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A seed is a positive 31-bit integer; anything else is rejected. */
export function parseSeed(value) {
  if (typeof value !== 'string' || !/^\d{1,10}$/.test(value)) return null;
  const n = Number(value);
  return n >= 1 && n <= 2147483647 ? n : null;
}

export function randomSeed() {
  return 1 + Math.floor(Math.random() * 2147483646);
}

/** One seed per calendar day (UTC), e.g. 2026-10-18 -> 20261018. */
export function dailySeed(date = new Date()) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

/**
 * Deal a deck for a country: up to DECK_SIZE cards with at least MIN_GENUINE
 * genuine messages, so "it's always a scam" never wins. Same country and seed
 * always give the same deck in the same order.
 */
export function buildDeck(countryCode, seed) {
  const country = COUNTRY_BY_CODE[countryCode];
  if (!country) throw new Error(`Unknown country: ${countryCode}`);
  const rand = mulberry32(seed);
  const genuine = shuffle(country.cards.filter(c => c.kind === 'genuine'), rand);
  const scams = shuffle(country.cards.filter(c => c.kind === 'scam'), rand);
  const size = Math.min(DECK_SIZE, country.cards.length);
  const genuineCount = Math.min(genuine.length, MIN_GENUINE);
  const picked = [...genuine.slice(0, genuineCount), ...scams.slice(0, size - genuineCount)];
  return shuffle(picked, rand);
}

/**
 * What a decision means for a card:
 *  - caught: ignored a scam            (correct)
 *  - trusted: acted on a genuine one   (correct)
 *  - fooled: acted on a scam           (wrong, costly)
 *  - missed: ignored a genuine one     (wrong, but nothing stolen)
 */
export function judge(card, decision) {
  if (decision !== 'act' && decision !== 'ignore') throw new Error(`Bad decision: ${decision}`);
  if (card.kind === 'scam') return decision === 'ignore' ? 'caught' : 'fooled';
  return decision === 'act' ? 'trusted' : 'missed';
}

export const isCorrect = outcome => outcome === 'caught' || outcome === 'trusted';

/**
 * Results encode as one letter per card. A/I mean act/ignore; B/J are the same
 * decisions made after a rewind (the player was fooled first). Lowercase means
 * the player checked first.
 */
const LETTERS = { act: ['A', 'B'], ignore: ['I', 'J'] };

export function encodeResults(results) {
  return results
    .map(r => {
      const letter = LETTERS[r.decision][r.rewound ? 1 : 0];
      return r.verified ? letter.toLowerCase() : letter;
    })
    .join('');
}

export function decodeResults(text, deckLength) {
  if (typeof text !== 'string' || text.length !== deckLength || !/^[ABIJabij]+$/.test(text)) return null;
  return [...text].map(ch => {
    const upper = ch.toUpperCase();
    return {
      decision: upper === 'A' || upper === 'B' ? 'act' : 'ignore',
      verified: ch !== upper,
      rewound: upper === 'B' || upper === 'J',
    };
  });
}

export function summarize(deck, results) {
  const rows = deck.map((card, i) => {
    const r = results[i];
    // A card the player only got right after rewinding still counts as fooled.
    const outcome = r.rewound ? 'fooled' : judge(card, r.decision);
    return { card, decision: r.decision, verified: r.verified, rewound: Boolean(r.rewound), outcome, correct: isCorrect(outcome) };
  });
  const correct = rows.filter(r => r.correct).length;
  const fooled = rows.filter(r => r.outcome === 'fooled');
  return {
    rows,
    total: rows.length,
    correct,
    fooled: fooled.length,
    missed: rows.filter(r => r.outcome === 'missed').length,
    verified: rows.filter(r => r.verified).length,
    rewound: rows.filter(r => r.rewound).length,
    // Clue counts live only in the browser session; a shared link does not carry them.
    clues: results.some(r => typeof r.clues === 'number') ? results.reduce((n, r) => n + (r.clues ?? 0), 0) : null,
    lossAvoided: rows
      .filter(r => r.outcome === 'caught')
      .reduce((sum, r) => sum + (r.card.lossAmount ?? 0), 0),
    lossTaken: fooled.reduce((sum, r) => sum + (r.card.lossAmount ?? 0), 0),
    rank: rankFor(correct, rows.length),
  };
}

export function rankFor(correct, total) {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return 'Unfeintable';
  if (ratio >= 0.75) return 'Sharp-eyed';
  if (ratio >= 0.5) return 'Getting there';
  return 'Easy mark';
}

export function formatMoney(amount, country) {
  return new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Query string for a run: country, seed and (when finished) the results. */
export function shareQuery({ country, seed, results }) {
  const params = new URLSearchParams({ c: country, s: String(seed) });
  if (results) params.set('r', encodeResults(results));
  return `?${params.toString()}`;
}

/**
 * Read a run from the query string. Tolerates links whose ampersands were
 * HTML-escaped (`&amp;`) on the way, which happens when a link is copied out
 * of rendered Markdown or a chat app. `damaged` is true when the link names a
 * country and seed but its results part is unreadable, so the app can say so
 * instead of quietly starting a fresh round.
 */
export function readQuery(search) {
  const params = new URLSearchParams(String(search ?? '').replace(/&amp;/gi, '&'));
  // Be forgiving about what links pick up when copied: a capitalised country
  // code, or a trailing slash, space or punctuation mark after a value.
  const code = (params.get('c') ?? '').trim().toLowerCase().replace(/[^a-z]+$/, '');
  const country = COUNTRY_BY_CODE[code] ? code : null;
  const seed = parseSeed((params.get('s') ?? '').trim().match(/^\d+/)?.[0] ?? '');
  if (!country || !seed) return { country, seed: null, results: null, damaged: params.has('r') };
  const deck = buildDeck(country, seed);
  const raw = params.get('r');
  const cleaned = raw === null ? '' : raw.trim().replace(/[^ABIJabij]+$/, '');
  const results = decodeResults(cleaned, deck.length);
  return { country, seed, results, damaged: raw !== null && results === null };
}

/**
 * The calendar date a daily seed stands for, or null for an ordinary seed.
 * Daily seeds are YYYYMMDD numbers (see dailySeed).
 */
export function dailyDate(seed) {
  if (!Number.isInteger(seed) || seed < 20000101 || seed > 29991231) return null;
  const y = Math.floor(seed / 10000);
  const m = Math.floor(seed / 100) % 100;
  const d = seed % 100;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

export function dailyLabel(seed) {
  const date = dailyDate(seed);
  return date
    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : null;
}

const SQUARE = { caught: '🟩', trusted: '🟩', fooled: '🟥', missed: '🟨' };

/** A plain-text result to paste anywhere: title line, score, one square per message, link. */
export function shareText({ country, seed, summary, link }) {
  const daily = dailyLabel(seed);
  const title = `Feint · ${country.name}${daily ? ` · Daily case ${daily}` : ''}`;
  const grid = summary.rows.map(r => SQUARE[r.outcome]).join('');
  return `${title}\n${summary.correct}/${summary.total} · ${summary.rank}\n${grid}\n${link}`;
}
