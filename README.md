# Feint

Spot the scam before it spots you.

**Play it:** https://feint.vercel.app

Feint is a short game for your phone or browser. Pick the country you live in, and eight messages arrive: fake payment alerts, "your account will be frozen" texts, a child texting from a new number, a job that wants a fee, and genuine messages that look just as alarming. For each one you tap what looks off, check it through a channel you already trust, then act on it or ignore it.

Fall for one and Feint shows what the scammer got and the clue you missed, then lets you rewind. At the end you get a case file with your rank, a colour grid of your calls and a link anyone can open.

## How it plays

- **Swipe or tap.** Swipe the card right to act, left to ignore, or use the buttons. On a keyboard: A, C, I, the arrow keys, and Enter for the next message.
- **Mark clues.** Every phrase in a message can be tapped. Real clues light up and Vee, the guide, explains why.
- **Check first.** The card flips to what your own banking app, the official site or the number you already saved would show, which is what you should use in real life.
- **Rewind.** Fooled? Rewind gives the money back and lets you try again, but the case file still counts it as fooled.
- **Today's case.** Everyone in a country gets the same eight messages each day, so results can be compared.
- **Share.** The result is encoded in the link (`?c=ng&s=42&r=IIAIIIAI`), and the case file has a copyable result with one square per message.

## What's inside

- **Ten universal patterns.** Scams look different in each country but run on the same few tricks. Each pattern has a tell, and each tell cites an official or primary source in the Field guide.
- **Country decks.** Nigeria, the United States, the United Kingdom and a global deck, each mixing local scams with genuine messages so "everything is a scam" never wins.
- **Deterministic rounds.** A country and a seed always deal the same messages in the same order. Random rounds and the daily case are just seeds.

## How it's tested

Every pull request is tested by itself, and the merge waits for the result.

1. **Unit tests** (`npm test`, Vitest, 41 tests): the deck builder, scoring, link parsing, the daily seed, share text, and that every clue in the content is tappable.
2. **Browser tests** (`npm run test:e2e`, Playwright, desktop and phone): real mouse drags for the swipe, the centre of every phrase in three full rounds, rewinds, meters, the end-of-round screen and the landing page.
3. **TestSprite on every pull request.** Vercel builds a preview for the PR; TestSprite's GitHub App runs an 84-test plan against that preview, posts the results on the PR and marks its check as failed when tests fail, which holds the merge.

[LOOP.md](LOOP.md) records each TestSprite run: what failed, whether it was a real bug or a test assumption, and what changed. Over about a dozen runs on [PR #5](https://github.com/nftkingiii/feint/pull/5) it caught, among others: clue taps landing on the wrong phrase when text wrapped, the back of the card covering the message after a flip, savings dropping again after a rewind, unknown paths returning a 404, and no way to leave a round. Where a test's own steps were wrong, the test plan was fixed instead of the app.

The product requirements TestSprite generates its tests from are in [docs/PRD.md](docs/PRD.md), including fixed links with known answers (for example `/?c=ng&s=42`, whose perfect run is `IIAIIIAI`).

## Sources

Every pattern lists its sources in the Field guide. They include the US Federal Trade Commission, GOV.UK (HMRC), Action Fraud, UK police warnings, and Nigerian reporting of CBN, EFCC and NCC statements (Dubawa, HumAngle, Channels TV, The Guardian Nigeria, Prime Business Africa, Technology Times). Amounts are illustrative, phone numbers use fictional ranges, and messages are simulated for practice.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build
npm run test:e2e   # Playwright; set BASE_URL to test a deployed copy
```

## Status

Built for TestSprite Hackathon Season 4. More country decks (India, Kenya, Australia) are planned.
