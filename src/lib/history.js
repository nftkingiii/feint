import { buildDeck, decodeResults, encodeResults } from './engine.js';

/**
 * Finished rounds are remembered in this browser only, so reopening a round's
 * address (country and seed, without the results part) can still show the
 * case file. Storage can be missing or blocked (private windows, previews),
 * so every access is wrapped and failure just means "nothing remembered".
 */
const key = (country, seed) => `feint:round:${country}:${seed}`;

function store(storage) {
  try {
    return storage ?? window.localStorage;
  } catch {
    return null;
  }
}

export function rememberRound(country, seed, results, storage) {
  try {
    store(storage)?.setItem(key(country, seed), encodeResults(results));
  } catch {
    /* storage full or blocked: not remembering is fine */
  }
}

export function recallRound(country, seed, storage) {
  try {
    const raw = store(storage)?.getItem(key(country, seed));
    if (!raw) return null;
    return decodeResults(raw, buildDeck(country, seed).length);
  } catch {
    return null;
  }
}
