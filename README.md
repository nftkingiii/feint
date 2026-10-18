# Feint

Spot the scam before it spots you.

Feint is a short game for your phone or browser. Pick the country you live in, and eight messages land on your phone: fake payment alerts, "your account will be frozen" texts, a child texting from a new number, a job that wants a fee, and some genuine messages that look just as alarming. For each one you act on it, check it through a channel you already trust, or ignore it.

Fall for one and Feint shows exactly what the scammer got and the clue you missed, then lets you rewind. At the end you get a case file you can share by link.

## How it works

- **Ten universal patterns.** Scams look different from country to country but run on the same few tricks. Each pattern has a tell, and each tell is backed by an official or primary source.
- **Country decks.** Nigeria, the United States, the United Kingdom and a global deck today. Each deck is a local version of the same patterns, mixed with genuine messages so "everything is a scam" never wins.
- **Check first.** The Check tab plays the part of your own banking app, the official website or the number you already have saved, which is what you should use in real life.
- **Deterministic runs.** A country and a seed always deal the same eight messages in the same order, and the result is encoded in the link (`?c=ng&s=42&r=…`). The same link always reopens the same case file.

## Sources

Every pattern lists its sources in the Field guide. They include the US Federal Trade Commission, GOV.UK (HMRC), Action Fraud, UK police warnings, and Nigerian reporting of CBN, EFCC and NCC statements (Dubawa, HumAngle, Channels TV, The Guardian Nigeria, Prime Business Africa, Technology Times). Amounts in the game are illustrative, and messages are simulated for practice.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # engine and content tests
npm run build
```

## Status

Early build for TestSprite Hackathon Season 4. More country decks (India, Kenya, Australia) are planned.
