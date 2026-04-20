import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function UnsentMessageCard({ message }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="result-card unsent-message-card" aria-label="Your unsent message">
      <p className="card-label">Your unsent message</p>
      <blockquote className="unsent-message-card__quote">{message}</blockquote>
      <p className="unsent-message-card__ready">Ready to send when you are.</p>
      <button type="button" className="unsent-message-card__copy" onClick={copy}>
        {copied ? (
          <>
            <Check size={18} aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy size={18} aria-hidden="true" /> Copy message
          </>
        )}
      </button>
    </section>
  );
}
