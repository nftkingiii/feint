# Feint — product requirements

Live app: https://feint.vercel.app (static single-page app, no login, no backend).

## What it is

Feint is a scam-spotting game. The player picks the country they live in, then handles eight messages one at a time. Some are scams built the way they are sent in that country; some are genuine messages that look just as alarming. For each message the player can tap suspicious parts to mark clues, check it through a trusted channel, and then act on it or ignore it. Falling for a scam shows what it would have cost (illustrative amounts) and offers a rewind. The round ends in a case file that can be shared by link.

## Users

Anyone with a phone and a bank account, especially people new to mobile money or online banking. No account, no sign-in, works on desktop and mobile.

## Core rules (these are fixed and testable)

- A **scam** is handled correctly by **ignoring** it. Acting on it means the player was fooled.
- A **genuine** message is handled correctly by **acting** on it. Ignoring it is a "missed" real message (no money lost).
- A message answered correctly only after a **rewind** still counts as **fooled**.
- Every round has **8 messages**, at least **2 genuine** and at least **4 scams**.
- The same country and seed always deal the same 8 messages in the same order.
- Links in messages are never clickable.
- Amounts are illustrative and labelled as such.

## Navigation

- First visit (`/`): the country picker. Options: Nigeria, United States, United Kingdom, Anywhere else, each with a flag. One is pre-selected from the browser language; **Start playing** begins a round.
- **See an example case file** (a link under the buttons on the landing page) opens a finished Nigeria round as a shared case file: `/?c=ng&s=42&r=IIAIIJAI`, rank **Sharp-eyed**, 7 of 8, with message 6 shown as "Fooled, caught on rewind".
- **Read the field guide** on the landing page opens the field guide for the selected country without starting a round. It has **← Back** (returns to the picker) and **Start playing**.
- In a round, three tabs: **Play**, **Case file**, **Field guide**. The country chip in the header returns to the country picker.
- The address bar always reflects the round: `/?c=<country>&s=<seed>` while playing, plus `&r=<results>` once finished.
- Country codes: `ng`, `us`, `gb`, `global`. An unknown code (e.g. `/?c=zz`) shows the country picker.
- Links are forgiving about what copying adds: HTML-escaped ampersands (`&amp;`), a capitalised country code (`c=NG`), and a trailing slash, space or full stop after a value all still open the same round or shared case file.

## Play screen

- Header line: "Message N of 8 · a text / WhatsApp message / call / email", then a one-line situation in large serif type.
- The message card shows a channel badge, the sender and the message.
- **Clue tapping:** the sender and message are split into phrases, and each phrase is a button (role `button`, named by its text, e.g. the button "0803 ••• 4471"). Tapping a real clue highlights it in yellow, the card footer changes to "1 clue marked" (2, 3…), the Clues marked meter goes up by one, and the guide "Vee" explains it. Tapping a plain phrase, or the space between phrases, makes Vee say "Nothing odd there. Keep looking, or decide." Marking clues never blocks deciding: the act, check and ignore buttons stay available.
- **Decisions:** three buttons on the right (desktop) or under the card (mobile):
  - the act button, labelled with what acting means for that message (e.g. "Hand over the phone"), keyboard **A**;
  - **Check first**, keyboard **C**;
  - **Ignore it**, keyboard **I**.
- **Swipe:** dragging the card right past the threshold acts; dragging left ignores; a short drag springs back. **The arrow keys swipe too:** pressing → throws the card right (act) and ← throws it left (ignore), with the same animation, stamp and outcome as a drag. The card is a focusable group labelled "Message card. Swipe right or press the right arrow key to act; swipe left or press the left arrow key to ignore." Tools that cannot drag can verify swiping with the arrow keys. The hint under the card reads "Drag left or press ← to ignore" and "Drag right or press → to act".
- **Swipe check (Nigeria seed 42):** press → on message 1 (a scam) → stamp "Feinted"; **Take the loss**; press ← on message 2 (a scam) → stamp "Scam avoided"; **Next message** shows "Message 3 of 8".
- **Check first** flips the card to its back: "Checked through a channel you trust", a heading (e.g. "Your banking app") and evidence lines. **Back to the message** (or C / Escape) flips it back. The act and ignore decisions still work while the check is showing.
- **After a correct decision:** a green stamp on the card ("Scam avoided" or "Real. Good call"), Vee explains the tell, and a **Next message** button (Enter). After the last message the button reads **See your case file**.
- **After ignoring a genuine message:** an amber stamp "That was real".
- **After being fooled:** a red stamp "Feinted", a loss panel with the illustrative amount (e.g. "−₦85,000"), what was taken, and the trick's name. Savings in the left meter drop by that amount. Two buttons: **Rewind and try again** (R), which restores savings and lets the player decide again, and **Take the loss**, which moves on.
- **Meters** (left column on desktop; on mobile only Savings and the pips show): Savings (illustrative), **Accuracy** ("N of M right" for calls made so far, "—" before the first call; a rewound card counts as wrong, so it drops after a fooled call), Clues marked (rises by one for each clue tapped), and eight progress pips (green = right, red = wrong, indigo = current).

## Case file

- Rank by share of correct calls: 8/8 "Unfeintable", 6–7 "Sharp-eyed", 4–5 "Getting there", 0–3 "Easy mark".
- "N of 8 calls right", a round seal, and a row of 8 coloured cells (green right, red fooled, amber real-but-ignored).
- Ledger: Savings left, Losses dodged, Checked first (x/8), Clues marked ("—" when opened from a shared link).
- A timeline of all 8 messages with outcome chip ("Scam avoided", "Real, trusted", "Fooled", "Real, ignored", or "Fooled, caught on rewind"), sender, trick name for scams, and the tell.
- "If it happens for real in <country>": where to report, with sources.
- **Share this case file:** a read-only link field and **Copy link** (changes to "Link copied").
- **Play a new round** (new seed) and **Play today's challenge** (seed from today's UTC date).
- Before the round ends, the Case file tab says "Your case file opens when the round ends." with a count of messages handled, unless this browser finished the same round before (see below).
- **Finished rounds are remembered in this browser.** Reopening a round address without the results part (e.g. `/?c=us&s=7` after finishing it) starts the round again but shows a notice, "You finished this round before. Your earlier case file is still here, or play it again.", with **See your case file**. The Case file tab then shows the earlier result with "Your earlier result for this round. In this replay you have handled N of 8 messages." and **Back to the messages**. A new browser profile has no history, so it simply starts the round.
- The **shared results link** for any finished round is shown in the case file under "Share this case file" (and is also the address bar once the round ends).

## Field guide

Ten pattern cards (e.g. "The fake payment alert", "Verify or be frozen", "The new number"), each with the trick, "The tell" and source links. A card with local examples has a button such as "See 2 examples from Nigeria" (aria-expanded false); pressing it opens the full example messages with their sender and clues, and the button changes to "Hide examples". A card with no local example says "No example in the <country> deck yet." In Nigeria, "The official who wants paying" has 2 examples (CBN Youth Grant Desk, EFCC officer).

## Fixed test anchors

These links always deal the same messages. Use them so tests can check exact outcomes.

**Nigeria, seed 42 — `/?c=ng&s=42`**

| # | Kind | Sender | Act button |
|---|---|---|---|
| 1 | scam | 0803 ••• 4471 | Hand over the phone |
| 2 | scam | CBN Youth Grant Desk | Pay the ₦7,500 fee |
| 3 | genuine | Courier | Wait for the parcel |
| 4 | scam | BANK-ALERT | Open the link and enter your BVN and PIN |
| 5 | scam | Customer at your POS stand | Give the ₦50,000 cash now |
| 6 | scam | Caller: "your network provider" | Press 1 and read out the code |
| 7 | genuine | YOURBANK | Release the rice |
| 8 | scam | Hiring Manager (Remote) | Pay ₦10,000 to unlock your earnings |

- Perfect run (ignore scams, act on genuine): rank **Unfeintable**, 8 of 8, savings **₦1,000,000**, losses dodged **₦702,500**, URL ends `&r=IIAIIIAI`.
- Acting on message 1: stamp "Feinted", loss "−₦85,000", savings **₦915,000**. Rewind restores **₦1,000,000**.
- Tapping "0803 ••• 4471" on message 1 marks a clue: footer "1 clue marked"; Vee: "A bank alert from a personal phone number. Banks send from their own sender name."
- Check first on message 1 shows "Your banking app" with "Balance: ₦1,240.50".

**United States, seed 7 — `/?c=us&s=7`**: 1 scam "+1 (213) 555-0151" (Send the $400), 2 scam, 3 scam, 4 scam, 5 genuine, 6 genuine, 7 scam, 8 scam. Savings start at **$8,000**.

**United Kingdom, seed 4242 — `/?c=gb&s=4242`**: messages 1 and 2 are genuine (bank card alert, GP reminder); 3–8 are scams, starting with "+44 7700 900461" (Pay the £2.99). Savings start at **£7,000**.

**Shared case file — `/?c=ng&s=42&r=IIAIIIAI`** opens straight on the Case file with "A shared case file", rank **Unfeintable**, 8 of 8.

**Invalid input:** `/?c=zz` shows the country picker; `/?c=ng&s=abc` starts a Nigeria round with a fresh seed; `/?c=ng&s=42&r=AAA` (damaged results) starts the round from message 1 and shows a notice: "That case file link is incomplete, so it can’t be shown. You’re playing the same round from the start instead."

**Accuracy check (Nigeria seed 42):** ignore message 1 → "1 of 1 right"; act on message 2 and take the loss → "1 of 2 right"; act on message 3 (genuine) → "2 of 3 right".

## Out of scope

Accounts, real payments, real messages, sending anything, storing personal data. The game never asks for a PIN, password or card number.
