const CHANNEL_LABEL = {
  sms: 'Text message',
  whatsapp: 'WhatsApp',
  call: 'Incoming call',
  email: 'Email',
};

/** A message as it would land on the player's phone. Links are shown as text, never clickable. */
export default function Message({ card }) {
  return (
    <article className={`phone channel-${card.channel}`} aria-label={`${CHANNEL_LABEL[card.channel]} from ${card.from}`}>
      <header className="phone-head">
        <span className="channel">{CHANNEL_LABEL[card.channel]}</span>
        <span className="sender">{card.from}</span>
      </header>
      <p className="bubble">{card.body}</p>
    </article>
  );
}
