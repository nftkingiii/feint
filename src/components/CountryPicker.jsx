import { useState } from 'react';
import { COUNTRIES } from '../data/countries.js';
import Flag from './Flag.jsx';
import Guide from './Guide.jsx';

/** Best guess from the browser's region, used only to pre-select; the player always confirms. */
function guessCountry() {
  const region = (navigator.language || '').split('-')[1]?.toLowerCase();
  if (region === 'gb' || region === 'uk') return 'gb';
  return COUNTRIES.some(c => c.code === region) ? region : 'global';
}

const HINTS = {
  ng: 'Credit alerts, POS reversals, BVN, fake EFCC',
  us: 'Toll texts, task jobs, fake fraud alerts',
  gb: 'HMRC refunds, Royal Mail fees, "Hi Mum"',
  global: 'The ten universal tricks',
};

export default function CountryPicker({ onPick, onGuide }) {
  const [choice, setChoice] = useState(guessCountry);

  return (
    <div className="landing">
      <div className="landing-copy">
        <h1 className="hero-title">
          Spot the scam <span>before it spots you.</span>
        </h1>
        <p className="hero-lede">
          Eight messages, built the way scams are really sent where you live, mixed with real ones. Mark the clues, check
          what you can, then swipe: act or ignore.
        </p>

        <form
          className="picker"
          onSubmit={e => {
            e.preventDefault();
            onPick(choice);
          }}
        >
          <fieldset>
            <legend>Where do you live?</legend>
            <div className="country-list">
              {COUNTRIES.map(c => (
                <label key={c.code} className={choice === c.code ? 'country selected' : 'country'}>
                  <input type="radio" name="country" value={c.code} checked={choice === c.code} onChange={() => setChoice(c.code)} />
                  <Flag code={c.code} className="flag flag-lg" />
                  <span className="country-text">
                    <span className="country-name">{c.name}</span>
                    <span className="country-hint">{HINTS[c.code]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="picker-actions">
            <button type="submit" className="chunky primary large">
              <span>Start playing</span>
            </button>
            <button type="button" className="chunky plain large" onClick={() => onGuide(choice)}>
              <span>Read the field guide</span>
            </button>
          </div>
        </form>
      </div>

      <div className="landing-demo" aria-hidden="true">
        <div className="demo-stack">
          <div className="demo-card back" />
          <div className="demo-card mid" />
          <div className="demo-card top">
            <p className="demo-channel">Text message</p>
            <p className="demo-from">
              <mark>BANK-ALERT</mark>
            </p>
            <p className="demo-body">
              Your account will be <mark>SUSPENDED in 24hrs</mark> due to incomplete BVN. Update now:{' '}
              <mark>bvn-update-ng.com</mark>
            </p>
            <p className="demo-foot">3 clues marked</p>
            <span className="demo-stamp">Scam avoided</span>
          </div>
        </div>
        <Guide mood="happy">A deadline, a link and a PIN request. Banks never do that.</Guide>
      </div>
    </div>
  );
}
