// Clues the player can tap on each scam card. `text` must appear exactly in
// the card's sender (`from`) or message (`body`); `note` is what the guide
// says when it is found. Genuine cards have no clues: there is nothing to find.
export const CLUES = {
  // Nigeria
  'ng-credit-alert': [
    { text: '0803 ••• 4471', note: 'A bank alert from a personal phone number. Banks send from their own sender name.' },
    { text: 'Bal:NGN86,240.50', note: 'Anyone can type a balance. Only your banking app shows the real one.' },
  ],
  'ng-pos-reversal': [
    { text: 'e go soon drop', note: '"It will soon drop" means it has not arrived. Never pay out against money that is still on its way.' },
    { text: 'I dey rush', note: 'Rushing you is the point. Pressure stops you from checking.' },
  ],
  'ng-bvn': [
    { text: 'SUSPENDED in 24hrs', note: 'A deadline in capitals is there to stop you thinking.' },
    { text: 'bvn-update-ng.com', note: 'Banks never send a link to update your BVN.' },
    { text: 'BANK-ALERT', note: 'Which bank? A real alert names your bank.' },
  ],
  'ng-cbn-grant': [
    { text: 'Pay ₦7,500 processing fee', note: 'A grant you pay for is not a grant.' },
    { text: 'to our agent', note: 'The CBN says it has appointed no agents to offer funds.' },
    { text: 'CBN Youth Grant Desk', note: 'A WhatsApp account can use any name and logo.' },
  ],
  'ng-efcc': [
    { text: 'Transfer ₦150,000 bail now', note: 'No agency collects bail by bank transfer over the phone.' },
    { text: 'arrest you today', note: 'Fear and a deadline, the two tools of every impersonation scam.' },
  ],
  'ng-sim-swap': [
    { text: 'read me the code', note: 'That code moves your number to their SIM. Never read a code out.' },
    { text: 'Press 1 to keep it', note: 'Your network will not disconnect you through a cold call.' },
  ],
  'ng-new-number': [
    { text: '+234 701 ••• 0932', note: 'A number you have never seen, claiming to be family.' },
    { text: 'Abeg send 20k', note: 'Money first, explanation later. Call the number you already have.' },
    { text: 'my new number', note: '"New number" is the opening line of this scam everywhere.' },
    { text: 'my phone fell inside water', note: 'A lost-phone story to explain the new number. Call the number you already have.' },
  ],
  'ng-task-job': [
    { text: 'Pay ₦10,000 activation', note: 'A job that asks you to pay in. The first small payout was bait.' },
    { text: 'unlock withdrawal', note: 'Earnings you cannot withdraw are not earnings.' },
  ],

  // United States
  'us-redelivery': [
    { text: 'usps-redeliver.info', note: 'Not a USPS address. Lookalike sites harvest card numbers.' },
    { text: '$1.99 redelivery fee', note: 'The small fee is bait for your card details.' },
    { text: '+1 (619) 555-0118', note: 'A random phone number, not an official short code.' },
  ],
  'us-task-job': [
    { text: 'Deposit $50', note: 'A job that asks you to deposit money is a scam.' },
    { text: 'unlock your next task set', note: 'The FTC calls these task scams: you pay to "unlock" fake earnings.' },
  ],
  'us-fraud-alert': [
    { text: 'Reply YES or NO', note: 'Replying tells them your number is live, and pulls you into a call.' },
    { text: 'call 1-844-555-0137', note: 'Never call the number in the message. Use the one on your card.' },
  ],
  'us-toll': [
    { text: 'ezpass-tollpay.com', note: 'A lookalike link. Check your toll account through its official site.' },
    { text: 'Final notice', note: 'A first message calling itself a "final notice" is pressure.' },
    { text: 'avoid a $50 late fee', note: 'Threatened fees push you to pay before thinking.' },
  ],
  'us-wrong-number': [
    { text: "uncle's crypto platform", note: 'A stranger with a family investment platform is the script.' },
    { text: 'Start with $500', note: 'The friendship turned into a request for money.' },
  ],
  'us-new-number': [
    { text: 'I broke my phone', note: 'A broken-phone story to explain the new number. Call the old one.' },
    { text: 'this is my new number', note: '"New number" from an unknown sender. Call the old one.' },
    { text: 'send $400', note: 'Urgent money, explanation later.' },
  ],
  'us-account-freeze': [
    { text: 'security@acc0unt-verify.net', note: 'Look closely: a zero instead of an "o", and not your bank’s domain.' },
    { text: 'within 12 hours', note: 'A tight deadline to stop you checking.' },
    { text: 'secure-verify-login.net', note: 'Never log in through a link in an email. Open your app.' },
  ],

  // United Kingdom
  'gb-hmrc-refund': [
    { text: 'tax refund of £427.60', note: 'HMRC never tells you about refunds by text.' },
    { text: 'hmrc-refund-claim.co.uk', note: 'Not gov.uk. HMRC services live on gov.uk.' },
    { text: 'Claim before midnight', note: 'A deadline to rush you.' },
  ],
  'gb-royal-mail': [
    { text: 'royal-mail.cloud', note: 'Not Royal Mail’s site. Action Fraud recorded this exact lookalike.' },
    { text: '£2.99 shipping fee', note: 'The tiny fee is bait for your card.' },
  ],
  'gb-hi-mum': [
    { text: 'Hi Mum, this is my new number', note: 'No name and a new number: police flag this exact opening.' },
    { text: '£350 bill today', note: 'Urgent money. Call your child’s saved number first.' },
  ],
  'gb-hmrc-giftcard': [
    { text: 'in gift cards', note: 'No real organisation takes tax in gift cards.' },
    { text: 'warrant for unpaid tax', note: 'HMRC never threatens arrest on a call.' },
  ],
  'gb-task-job': [
    { text: 'Top up £40', note: 'A job that needs you to top up is taking, not paying.' },
    { text: 'move to the next level', note: '"Levels" that cost money are the task scam pattern.' },
  ],
  'gb-bank-code': [
    { text: 'read me the code', note: 'The code approves a payment. Your bank will never ask for it.' },
    { text: 'We have blocked a suspicious payment', note: 'Fear first, then the request. Hang up and call the number on your card.' },
  ],
  'gb-wrong-number': [
    { text: 'I trade gold with a mentor', note: 'A chat partner with a "mentor" is reading a script.' },
    { text: 'start small, £250', note: 'Starting small is how the bigger losses begin.' },
  ],

  // Anywhere else
  'gl-payment-alert': [
    { text: '+00 555 210 4471', note: 'A credit alert from an ordinary phone number.' },
    { text: 'Available balance: $312.40', note: 'A typed balance proves nothing. Open your app.' },
  ],
  'gl-account-freeze': [
    { text: 'bank-secure-check.com', note: 'A link to enter your PIN. Banks never ask for it.' },
    { text: 'locked today', note: 'A deadline to rush you.' },
  ],
  'gl-delivery': [
    { text: 'parcel-release-now.com', note: 'Not a courier you know.' },
    { text: '$2.50 release fee', note: 'Small fees are bait for card details.' },
  ],
  'gl-new-number': [
    { text: 'New number, old phone broke', note: 'Unknown number claiming to be someone you know.' },
    { text: 'send $250 urgently', note: 'Urgent money first, explanation later.' },
  ],
  'gl-job': [
    { text: '$30 unlock fee', note: 'Paying to withdraw your own earnings is the scam.' },
  ],
  'gl-code': [
    { text: 'read me the six-digit code', note: 'A code you are asked to read out unlocks your account for them.' },
  ],
};
