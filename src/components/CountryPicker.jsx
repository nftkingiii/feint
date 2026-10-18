import { useState } from 'react';
import { COUNTRIES } from '../data/countries.js';

/** Best guess from the browser's region, used only to pre-select; the player always confirms. */
function guessCountry() {
  const region = (navigator.language || '').split('-')[1]?.toLowerCase();
  if (region === 'gb' || region === 'uk') return 'gb';
  return COUNTRIES.some(c => c.code === region) ? region : 'global';
}

export default function CountryPicker({ onPick }) {
  const [choice, setChoice] = useState(guessCountry);

  return (
    <div className="picker">
      <h2 className="hero-title">Spot the scam before it spots you.</h2>
      <p className="hero-lede">
        Eight messages land on your phone. Some are scams built the way they are sent where you live. Some are real.
        Decide what to do with each one.
      </p>

      <form
        className="picker-form"
        onSubmit={e => {
          e.preventDefault();
          onPick(choice);
        }}
      >
        <fieldset>
          <legend>Where do you live?</legend>
          <div className="country-grid">
            {COUNTRIES.map(c => (
              <label key={c.code} className={choice === c.code ? 'country-option selected' : 'country-option'}>
                <input
                  type="radio"
                  name="country"
                  value={c.code}
                  checked={choice === c.code}
                  onChange={() => setChoice(c.code)}
                />
                <span className="flag" aria-hidden="true">
                  {c.flag}
                </span>
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="primary">
          Start playing
        </button>
      </form>
    </div>
  );
}
