import { getTopPatterns } from "../utils/reflectionHistory";

export default function EmotionalFingerprint() {
  const top = getTopPatterns(3);
  if (top.length === 0) return null;

  return (
    <section className="emotional-fingerprint" aria-label="Your emotional fingerprint">
      <h2 className="emotional-fingerprint__title">Your emotional fingerprint</h2>
      <p className="emotional-fingerprint__subtitle">Patterns Mirror has seen in you</p>
      <div className="emotional-fingerprint__pills">
        {top.map(({ name, count }) => (
          <span key={name} className="emotional-fingerprint__pill">
            {name}
            <span className="emotional-fingerprint__count" aria-label={`${count} times`}>
              ×{count}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
