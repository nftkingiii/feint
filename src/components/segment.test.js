import { describe, expect, it } from 'vitest';
import { CLUES } from '../data/clues.js';
import { COUNTRIES } from '../data/countries.js';
import { segment } from './Card.jsx';

const cards = Object.fromEntries(COUNTRIES.flatMap(c => c.cards).map(card => [card.id, card]));

describe('segment', () => {
  it('turns every clue into its own tappable phrase', () => {
    for (const [id, clues] of Object.entries(CLUES)) {
      const card = cards[id];
      const segs = [...segment(card.from, clues), ...segment(card.body, clues)];
      clues.forEach((clue, index) => {
        expect(segs.some(s => s.clue === index && s.text === clue.text), `${id}: "${clue.text}"`).toBe(true);
      });
    }
  });

  it('never makes a tappable phrase out of punctuation alone', () => {
    for (const card of Object.values(cards)) {
      const clues = CLUES[card.id] ?? [];
      for (const s of [...segment(card.from, clues), ...segment(card.body, clues)]) {
        if (/^[.,!?:;…-]+$/.test(s.text)) expect(s.inert, `${card.id}: "${s.text}"`).toBe(true);
      }
    }
  });

  it('keeps the USPS fee and link as clues, with the colon between them as plain text', () => {
    const card = cards['us-redelivery'];
    const segs = segment(card.body, CLUES['us-redelivery']);
    expect(segs.find(s => s.text === '$1.99 redelivery fee')?.clue).not.toBeNull();
    expect(segs.find(s => s.text === ':')).toMatchObject({ clue: null, inert: true });
  });
});
