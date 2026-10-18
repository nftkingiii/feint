# The loop

Every change to Feint is checked by TestSprite running real browser tests against the live app. This log records what each run caught and what changed because of it.

## Run 1 · 2026-10-18 · first full suite on feint.vercel.app

TestSprite execution `81f9306b-1cf0-4cae-a3be-14b72bcb502d`, generated from [docs/PRD.md](docs/PRD.md).

It flagged five journeys. What each one turned out to be:

| Journey | What the test saw | Root cause | Fix |
|---|---|---|---|
| Browse the field guide from the home screen | No way to reach the guide before starting a round | Real gap: the guide only existed as an in-round tab | Added **Read the field guide** on the landing page, with Back and Start playing |
| Open a shared case file from the URL | A fresh round at message 1 instead of the case file | The exact link works; a copy whose `&` had become `&amp;` lost its seed, and the app silently started a new round | Links now tolerate `&amp;`; a link with an unreadable result shows a notice instead of quietly pretending |
| Open a shared case file from a results link | Same as above | Same | Same |
| Mark a clue and keep evaluating | Tapping did not mark a clue | Real bug: after a drag that ended without a click event, a "swallow the next click" flag stayed set, so the next tap on a clue was ignored | The flag now resets on every new press |
| Trust reflects decisions | Trust stayed at 100% after a scam was mishandled | Working as defined (trust counted genuine messages only), but the label misled | Replaced Trust with **Accuracy**, "N of M right", which moves with every call |

Verified locally with real mouse input before deploying; unit tests 27/27.
