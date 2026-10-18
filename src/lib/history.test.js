import { describe, expect, it } from 'vitest';
import { recallRound, rememberRound } from './history.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

const RESULTS = Array.from({ length: 8 }, (_, i) => ({ decision: i % 2 ? 'act' : 'ignore', verified: i === 0, rewound: i === 3 }));

describe('round history', () => {
  it('remembers a finished round by country and seed', () => {
    const s = memoryStorage();
    rememberRound('ng', 42, RESULTS, s);
    expect(recallRound('ng', 42, s)).toEqual(RESULTS);
    expect(recallRound('ng', 43, s)).toBeNull();
    expect(recallRound('us', 42, s)).toBeNull();
  });

  it('ignores stored values that do not decode for that deck', () => {
    const s = memoryStorage();
    s.setItem('feint:round:ng:42', 'nonsense');
    expect(recallRound('ng', 42, s)).toBeNull();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => rememberRound('ng', 42, RESULTS, broken)).not.toThrow();
    expect(recallRound('ng', 42, broken)).toBeNull();
  });
});
