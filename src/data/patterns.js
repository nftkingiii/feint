// The ten universal patterns. Each country deck is a local version of these:
// the trick and the tell stay the same, the costume changes.
export const PATTERNS = [
  {
    id: 'payment-alert',
    name: 'The fake payment alert',
    trick: 'A message says money has arrived, so you hand over goods or cash.',
    tell: 'Alerts can be typed by anyone. Only your own banking app shows what really arrived.',
    sources: ['dubawa-alerts', 'humangle-pos'],
  },
  {
    id: 'reversal',
    name: 'The transfer that walks back',
    trick: 'A payer insists on a phone transfer, then takes the goods before it settles, or the money is reversed later.',
    tell: 'Wait until the money has settled in your account, not just "on its way".',
    sources: ['humangle-pos'],
  },
  {
    id: 'account-freeze',
    name: 'Verify or be frozen',
    trick: 'Your account is "about to be suspended" unless you update details through a link.',
    tell: 'Banks never ask for your PIN, password or ID number by text, and never with a link.',
    sources: ['cbn-bvn', 'gov-uk-hmrc'],
  },
  {
    id: 'fake-authority',
    name: 'The official who wants paying',
    trick: 'Someone claiming to be a regulator, tax office or police demands money, or offers a grant for a fee.',
    tell: 'Real agencies do not take fees, fines or bail by transfer, voucher or gift card, and do not appoint WhatsApp agents.',
    sources: ['cbn-grants', 'efcc-impostors', 'action-fraud-hmrc'],
  },
  {
    id: 'delivery-fee',
    name: 'The tiny delivery fee',
    trick: 'A parcel is "on hold" until you pay a small fee on a lookalike website.',
    tell: 'The fee is bait for your card details. Check the courier only through its own app or website.',
    sources: ['ftc-2025', 'action-fraud-royal-mail'],
  },
  {
    id: 'family-new-number',
    name: 'The new number',
    trick: 'A "child" or relative texts from an unknown number with a broken phone and an urgent need for money.',
    tell: 'Call the number you already have for them before you send anything.',
    sources: ['police-hi-mum'],
  },
  {
    id: 'job-pay-in',
    name: 'The job that costs you',
    trick: 'Easy online work (rating apps, liking posts) pays at first, then you must pay to unlock your earnings.',
    tell: 'A real job never asks you to pay in.',
    sources: ['ftc-2025'],
  },
  {
    id: 'wrong-number',
    name: 'The friendly wrong number',
    trick: 'A misdirected text turns into a warm chat, then into an investment tip.',
    tell: 'Strangers who steer a friendship towards money are running a script.',
    sources: ['ftc-2025'],
  },
  {
    id: 'code-request',
    name: 'Just read me the code',
    trick: 'A caller from your network or bank asks for the code that was just texted to you.',
    tell: 'A one-time code is a key to your account. Never read it out to anyone.',
    sources: ['ncc-sim-swap'],
  },
  {
    id: 'fraud-alert',
    name: 'The fake fraud alert',
    trick: 'A "bank" text about a suspicious purchase asks you to reply or call a number.',
    tell: 'Do not reply or call the number in the message. Open your banking app or call the number on your card.',
    sources: ['ftc-2025'],
  },
];

export const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map(p => [p.id, p]));
