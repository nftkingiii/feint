/**
 * The Check tab: verify through a channel you already trust (your own banking
 * app, the official site, the saved number) before deciding.
 */
export default function Check({ card, verified, locked, onDecide, onBack }) {
  if (!card) {
    return (
      <div className="empty">
        <h2>Nothing left to check.</h2>
        <p>Your run is over. Open the case file to see how you did.</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="empty">
        <h2>Check a message through a channel you trust.</h2>
        <p>On the current message, choose "Check first" to open your own banking app, the official site or the saved number.</p>
        <button className="secondary" onClick={onBack}>
          Back to the message
        </button>
      </div>
    );
  }

  return (
    <div className="check">
      <p className="check-label">You checked through</p>
      <h2>{card.check.heading}</h2>
      <ul className="evidence">
        {card.check.lines.map(line => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {!locked && (
        <div className="actions" role="group" aria-label="Now decide">
          <button className="action act" onClick={() => onDecide('act')}>
            {card.act}
          </button>
          <button className="action ignore" onClick={() => onDecide('ignore')}>
            Ignore it
          </button>
        </div>
      )}
      <button className="link" onClick={onBack}>
        Back to the message
      </button>
    </div>
  );
}
