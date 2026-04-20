import { useEffect, useState } from "react";

const TYPE_MS = 40;

function PatternNameTypewriter({ text }) {
  const [len, setLen] = useState(() => (text.length ? 1 : 0));
  const [done, setDone] = useState(() => !text.length || text.length <= 1);

  useEffect(() => {
    if (!text.length || text.length <= 1) {
      return undefined;
    }

    let n = 1;
    const id = setInterval(() => {
      n += 1;
      setLen(n);
      if (n >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, TYPE_MS);

    return () => clearInterval(id);
  }, [text]);

  const displayed = text.slice(0, len);

  return (
    <>
      <span className="pattern-title-typewriter__text">{displayed}</span>
      {!done && <span className="pattern-title-typewriter__cursor" aria-hidden="true">|</span>}
    </>
  );
}

export default function PatternCard({ result, explanation: explanationProp }) {
  const explanation = explanationProp ?? result.explanation;
  const fullName = result.patternName || "";

  return (
    <section className="result-card pattern-card">
      <p className="card-label">Pattern detected</p>
      <h2 className="pattern-title-typewriter">
        <PatternNameTypewriter key={fullName} text={fullName} />
      </h2>
      <p className="confidence-note">{result.confidenceNote}</p>

      <div className="content-block">
        <h3 className="block-title">Why this may be happening</h3>
        <p key={explanation} className="pattern-explanation-body pattern-explanation-body--fade">
          {explanation}
        </p>
      </div>
    </section>
  );
}
