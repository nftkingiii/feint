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

## Run 2 · 2026-10-18 · re-run after the first fixes

TestSprite flagged four journeys again. I reproduced each with Playwright (the same engine TestSprite generates tests for) against feint.vercel.app before changing anything.

| Journey | What the test saw | What reproduction showed | Fix |
|---|---|---|---|
| Open a shared case file from a results link | "Your case file opens when the round ends", 0 of 8 | The exact link works, but a trailing `/`, a trailing space or `c=NG` dropped the results and started a fresh round | Link parsing now ignores trailing junk and capitalisation; tested with five variants |
| Use clue tapping during a round | Clue count stayed at 0 | Role-based and text clicks mark clues, but a click in the space between phrases did nothing at all | Any click on the message now gets an answer from the guide; the PRD names the phrase buttons |
| View pattern details in the field guide | No control to open a pattern card | Cards had nothing to open | Each card has "See N examples from <country>" that expands the full messages and their clues |
| Use swipe gestures | The test tool cannot drag | A Playwright mouse drag swipes correctly; the tool lacked a drag action | No code change: the PRD now says swipe is an optional shortcut and the buttons are canonical |

Unit tests 32/32.

## Run 3 · 2026-10-18 · two shared-case-file journeys left

| Journey | What the test saw | Root cause | Fix |
|---|---|---|---|
| Open a shared case file directly from the URL | After finishing a round, opening the round address showed "opens when the round ends", 0 of 8 | Real gap: the agent reopened the address without the results part, and the app had no memory of finished rounds | Finished rounds are remembered in the browser; reopening shows a notice and the Case file tab shows the earlier result, while the round can still be replayed |
| Open a shared case file from a results link | Started on the landing page and found no results link to follow | Real gap for first-time visitors and judges: nothing on the landing page shows how a round ends | Added "See an example case file" on the landing page, linking to a finished Nigeria round |

Unit tests 35/35 (new: round memory, including blocked storage).

## Run 4 · 2026-10-18 · swipe blocked in automation

| Journey | What the test saw | Root cause | Fix |
|---|---|---|---|
| Use swipe gestures to act and ignore | Blocked: the test browser cannot drag | The test tool has no drag action; the gesture itself works (verified with a Playwright mouse drag in run 2) | Arrow keys now swipe the card with the same animation and outcome, and the card is a labelled, focusable group, so swiping is reachable from the keyboard and verifiable by tools that cannot drag |

Shared-case-file journeys from run 3 re-checked live afterwards.

## Run 5 · 2026-10-18 · first pull-request run (PR #5)

TestSprite's GitHub App ran 44 tests against the preview of PR #5 (daily case, shareable result, Playwright drag test): 39 passed, 4 failed, 1 blocked.

| Failed test | What happened | Verdict | Change |
|---|---|---|---|
| Return to messages from the case file | After the round, the Play tab offered only "Open your case file" | Real gap | The last-message screen now also offers Play a new round and Play today's case |
| Complete the round by ignoring a scam | The test ignored message 1 assuming it was a scam; in that random round it was a genuine bank alert, so "That was real" was correct | Test assumption | The PRD now says random rounds cannot assume message order and points to the fixed links |
| Handle a suspicious message by checking first | The trusted channel confirmed the pharmacy message was real; the test still ignored it | Test assumption | Same PRD note |
| Mark clues and track clue count | Clues were not marked by "keyboard activation" | Not reproduced: Enter and Space on a phrase mark it (Playwright). Found instead that a lone ":" was exposed as a button | Punctuation on its own is now plain text; a unit test checks every clue still becomes its own phrase |

Unit tests 40/40. Pushed to the PR branch, so the check re-runs on the PR.

## Run 6 · 2026-10-18 · pull-request run with the merge gate on (PR #5)

44 tests on the PR #5 preview: 38 passed, 5 failed, 1 blocked. The TestSprite V3 check failed and held the merge, as intended.

| Failed test | What happened | Verdict | Change |
|---|---|---|---|
| Invalid country code | `/zz` returned Vercel's 404 page instead of the game | Real bug | `vercel.json` sends every path to the app; Playwright checks `/zz` loads the game |
| Mark clues (three tests) | Clicks at the centre of a phrase missed it. A phrase that wraps across lines has a box whose centre sits on a neighbouring phrase ("send $400" on phones, "this is my new number" on desktop) | Real bug, reproduced in Playwright | Phrases are now solid inline boxes; Playwright checks the centre of every phrase in three full rounds hits that phrase |
| Ignore a genuine message after verifying it | The test used the BVN message, which is a scam, so "Scam avoided" was correct | Test assumption | None in the app; the test needs a genuine card from a fixed link |
| Swipe (blocked) | TestSprite's browser cannot drag | Tool limit | Arrow keys already swipe; the test should press them. Playwright covers the drag itself |

Unit tests 40/40. Playwright against the preview 16/16 (desktop and phone). Pushed to the PR branch, so the check re-runs.

## Run 7 · 2026-10-18 · PR #5 after the solid-phrase fix

44 tests: 36 passed, 6 failed, 2 blocked. The merge gate held the PR.

| Failed test | What happened | Verdict | Change |
|---|---|---|---|
| Update savings after a wrong decision and rewind | Rewind put savings back to $8,000, then the next message showed $6,800 again | Real bug: the meter and case file still charged a rewound card | A rewind now gives the money back for good; it still counts as fooled for accuracy and rank. Unit test and Playwright test added |
| Mark clues (three tests) | The agent did not see the phrases as controls ("not available as an interactive control") | Real gap: phrases were spans with a help cursor | Every phrase is now a real button with a pointer cursor; Playwright clicks "send $400" by its button role |
| Return to the play screen from the case file | The test wanted to see the messages again after the round | Reasonable request | The Play tab now lists all 8 messages under "That was the last message." with how each went |
| Keyboard shortcuts | After pressing I, the test expected the round to move on without Next | Test assumption | Not reproduced: I, then Enter (or Space) moves to message 2 in Playwright |
| Swipe, check before acting (blocked) | Tool limits | Not app bugs | Swipe test should press the arrow keys |

Unit tests 41/41. Playwright 20/22 against a local build (the 2 misses are the unknown-path test, which needs Vercel's rewrite).

## Run 8 · 2026-10-18 · PR #5 after phrases became buttons

44 tests: 38 passed, 5 failed, 1 blocked. This run started from the push, before the edited test plan was saved, so the keyboard test still had its old steps.

| Failed test | What happened | Verdict | Change |
|---|---|---|---|
| Mark clues / clue tapping to case file | The agent listed "Back to the message" as a control but no phrase buttons | Real bug: the turned-away back of the card sat on top of the message, so the phrases looked covered | The turned-away face is now hidden (switched mid-flip); the card wrapper is no longer a focus stop. Playwright checks only the showing face can be used |
| Ignore a genuine message and continue | On a random round the agent took a scam bank alert for a genuine one; the game said "Scam avoided" correctly | Test assumption | Test now uses `/?c=ng&s=42`, message 3 (genuine) |
| Reflect trust changes | Looked for a Trust meter, which became Accuracy in run 4 | Out-of-date test | Test now checks Accuracy |
| Keyboard shortcuts | Old steps (I alone should advance) | Test assumption | Test plan edited: I, then Enter |

Unit tests 41/41. Playwright 22/24 against a local build (the 2 misses are the unknown-path test, which needs Vercel's rewrite).
