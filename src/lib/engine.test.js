import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../data/countries.js';
import { PATTERN_BY_ID } from '../data/patterns.js';
import { SOURCES } from '../data/sources.js';
import { CLUES } from '../data/clues.js';
import {
  buildDeck,
  dailySeed,
  decodeResults,
  encodeResults,
  judge,
  parseSeed,
  rankFor,
  readQuery,
  shareQuery,
  summarize,
} from './engine.js';

describe('content', () => {
  it.each(COUNTRIES.map(c => [c.code, c]))('%s: every card is complete and cites a known pattern', (_, country) => {
    const ids = new Set();
    for (const card of country.cards) {
      expect(ids.has(card.id), `duplicate id ${card.id}`).toBe(false);
      ids.add(card.id);
      expect(PATTERN_BY_ID[card.pattern], `${card.id} pattern`).toBeTruthy();
      expect(['scam', 'genuine']).toContain(card.kind);
      for (const field of ['from', 'context', 'body', 'act', 'tell']) {
        expect(card[field], `${card.id}.${field}`).toBeTruthy();
      }
      expect(card.check.lines.length).toBeGreaterThan(0);
      if (card.kind === 'scam') {
        expect(card.loss, `${card.id}.loss`).toBeTruthy();
        expect(card.lossAmount).toBeGreaterThan(0);
      }
    }
  });

  it('every pattern and report line cites a source that exists', () => {
    for (const p of Object.values(PATTERN_BY_ID)) {
      for (const s of p.sources) expect(SOURCES[s], `${p.id} -> ${s}`).toBeTruthy();
    }
    for (const c of COUNTRIES) {
      for (const line of c.report) if (line.source) expect(SOURCES[line.source]).toBeTruthy();
    }
  });
});

describe('clues', () => {
  it('every scam card has at least one clue and genuine cards have none', () => {
    for (const c of COUNTRIES) {
      for (const card of c.cards) {
        if (card.kind === 'scam') expect(CLUES[card.id]?.length, card.id).toBeGreaterThan(0);
        else expect(CLUES[card.id], card.id).toBeUndefined();
      }
    }
  });

  it('every clue appears exactly in the card sender or message', () => {
    const cards = Object.fromEntries(COUNTRIES.flatMap(c => c.cards).map(card => [card.id, card]));
    for (const [id, clues] of Object.entries(CLUES)) {
      expect(cards[id], id).toBeTruthy();
      for (const clue of clues) {
        const found = cards[id].body.includes(clue.text) || cards[id].from.includes(clue.text);
        expect(found, `${id}: "${clue.text}"`).toBe(true);
        expect(clue.note.length).toBeGreaterThan(10);
      }
    }
  });

  it('each country deck has a wallet that covers every possible loss', () => {
    for (const c of COUNTRIES) {
      const worst = c.cards.filter(card => card.kind === 'scam').reduce((n, card) => n + card.lossAmount, 0);
      expect(c.wallet, c.code).toBeGreaterThanOrEqual(worst);
    }
  });
});

describe('buildDeck', () => {
  it('deals the same deck for the same country and seed', () => {
    const a = buildDeck('ng', 42).map(c => c.id);
    const b = buildDeck('ng', 42).map(c => c.id);
    expect(a).toEqual(b);
  });

  it('deals different orders for different seeds', () => {
    expect(buildDeck('us', 1).map(c => c.id)).not.toEqual(buildDeck('us', 2).map(c => c.id));
  });

  it.each(COUNTRIES.map(c => [c.code]))('%s: 8 cards, at least 2 genuine and 4 scams, no repeats', code => {
    for (const seed of [1, 7, 99, 20261018]) {
      const deck = buildDeck(code, seed);
      expect(deck).toHaveLength(8);
      expect(new Set(deck.map(c => c.id)).size).toBe(8);
      expect(deck.filter(c => c.kind === 'genuine').length).toBeGreaterThanOrEqual(2);
      expect(deck.filter(c => c.kind === 'scam').length).toBeGreaterThanOrEqual(4);
      expect(deck.every(c => c.id.startsWith(code === 'global' ? 'gl-' : `${code}-`))).toBe(true);
    }
  });

  it('rejects an unknown country', () => {
    expect(() => buildDeck('xx', 1)).toThrow('Unknown country');
  });
});

describe('judge', () => {
  const scam = { kind: 'scam' };
  const genuine = { kind: 'genuine' };
  it('maps every decision to an outcome', () => {
    expect(judge(scam, 'ignore')).toBe('caught');
    expect(judge(scam, 'act')).toBe('fooled');
    expect(judge(genuine, 'act')).toBe('trusted');
    expect(judge(genuine, 'ignore')).toBe('missed');
  });
  it('rejects unknown decisions', () => {
    expect(() => judge(scam, 'maybe')).toThrow();
  });
});

describe('results encoding and share links', () => {
  const results = [
    { decision: 'act', verified: false, rewound: false },
    { decision: 'ignore', verified: true, rewound: false },
    { decision: 'act', verified: true, rewound: false },
    { decision: 'ignore', verified: false, rewound: true },
  ];

  it('round-trips results, including checks and rewinds', () => {
    expect(encodeResults(results)).toBe('AiaJ');
    expect(decodeResults('AiaJ', 4)).toEqual(results);
  });

  it('rejects malformed or wrong-length results', () => {
    expect(decodeResults('AiaX', 4)).toBeNull();
    expect(decodeResults('Aia', 4)).toBeNull();
    expect(decodeResults(undefined, 4)).toBeNull();
  });

  it('builds and reads a share query', () => {
    const deck = buildDeck('gb', 1234);
    const full = deck.map(() => ({ decision: 'ignore', verified: false, rewound: false }));
    const q = shareQuery({ country: 'gb', seed: 1234, results: full });
    expect(q).toBe('?c=gb&s=1234&r=IIIIIIII');
    expect(readQuery(q)).toEqual({ country: 'gb', seed: 1234, results: full, damaged: false });
  });

  it('ignores a bad country, seed or result string', () => {
    expect(readQuery('?c=zz&s=5')).toEqual({ country: null, seed: null, results: null, damaged: false });
    expect(readQuery('?c=ng&s=abc')).toEqual({ country: 'ng', seed: null, results: null, damaged: false });
    expect(readQuery('?c=ng&s=5&r=AAA')).toMatchObject({ results: null, damaged: true });
  });

  it.each([
    ['trailing slash', '?c=ng&s=42&r=IIAIIIAI/'],
    ['trailing space', '?c=ng&s=42&r=IIAIIIAI%20'],
    ['trailing full stop', '?c=ng&s=42&r=IIAIIIAI.'],
    ['capital country', '?c=NG&s=42&r=IIAIIIAI'],
    ['junk after the seed', '?c=ng&s=42/&r=IIAIIIAI'],
  ])('still opens the shared case file with a %s', (_, q) => {
    expect(readQuery(q)).toMatchObject({ country: 'ng', seed: 42, damaged: false });
    expect(readQuery(q).results).toHaveLength(8);
  });

  it('reads a link whose ampersands were HTML-escaped', () => {
    const q = readQuery('?c=ng&amp;s=42&amp;r=IIAIIIAI');
    expect(q.country).toBe('ng');
    expect(q.seed).toBe(42);
    expect(q.results).toHaveLength(8);
    expect(q.damaged).toBe(false);
  });
});

describe('summarize', () => {
  it('scores a run and totals illustrative losses', () => {
    const deck = buildDeck('ng', 7);
    const perfect = deck.map(c => ({ decision: c.kind === 'scam' ? 'ignore' : 'act', verified: false }));
    const s = summarize(deck, perfect);
    expect(s.correct).toBe(8);
    expect(s.fooled).toBe(0);
    expect(s.rank).toBe('Unfeintable');
    expect(s.lossAvoided).toBe(deck.filter(c => c.kind === 'scam').reduce((n, c) => n + c.lossAmount, 0));
    expect(s.lossTaken).toBe(0);

    const gullible = deck.map(() => ({ decision: 'act', verified: true }));
    const g = summarize(deck, gullible);
    expect(g.fooled).toBe(deck.filter(c => c.kind === 'scam').length);
    expect(g.verified).toBe(8);
    expect(g.rank).toBe('Easy mark');
  });

  it('counts a card answered right only after a rewind as fooled', () => {
    const deck = buildDeck('us', 3);
    const perfect = deck.map(c => ({ decision: c.kind === 'scam' ? 'ignore' : 'act', verified: false }));
    const scamAt = deck.findIndex(c => c.kind === 'scam');
    perfect[scamAt] = { ...perfect[scamAt], rewound: true };
    const s = summarize(deck, perfect);
    expect(s.correct).toBe(7);
    expect(s.rewound).toBe(1);
    expect(s.rows[scamAt].outcome).toBe('fooled');
  });

  it('ranks by share of correct answers', () => {
    expect(rankFor(8, 8)).toBe('Unfeintable');
    expect(rankFor(6, 8)).toBe('Sharp-eyed');
    expect(rankFor(4, 8)).toBe('Getting there');
    expect(rankFor(3, 8)).toBe('Easy mark');
  });
});

describe('seeds', () => {
  it('accepts only positive 31-bit integers', () => {
    expect(parseSeed('42')).toBe(42);
    expect(parseSeed('0')).toBeNull();
    expect(parseSeed('-3')).toBeNull();
    expect(parseSeed('2147483648')).toBeNull();
    expect(parseSeed('1e3')).toBeNull();
  });
  it('derives a daily seed from the UTC date', () => {
    expect(dailySeed(new Date('2026-10-18T12:00:00Z'))).toBe(20261018);
  });
});
