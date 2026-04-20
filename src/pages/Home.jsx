import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import InputCard from "../components/InputCard";
import { getReflections } from "../utils/reflectionHistory";
import { resetVenom } from "../utils/venomSystem";

const QUESTIONS = [
  "What's weighing on you right now?",
  "What are you avoiding thinking about?",
  "What did you feel today that you didn't say out loud?",
  "What conversation are you replaying in your head?",
  "What are you pretending is fine?"
];

export default function Home() {
  const [phase, setPhase] = useState("arrival");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [frozenIdx, setFrozenIdx] = useState(0);
  const [showStartHint, setShowStartHint] = useState(false);

  const savedCount = getReflections().length;

  // Reset venom system on home page
  useEffect(() => {
    resetVenom();
  }, []);

  useEffect(() => {
    if (phase !== "arrival") return undefined;
    const id = setInterval(() => {
      setDisplayIdx((i) => (i + 1) % QUESTIONS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrival") {
      setShowStartHint(false);
      return undefined;
    }
    setShowStartHint(false);
    const t = window.setTimeout(() => setShowStartHint(true), 1000);
    return () => window.clearTimeout(t);
  }, [phase]);

  const openInput = useCallback(() => {
    setFrozenIdx(displayIdx);
    setPhase("input");
  }, [displayIdx]);

  const closeInput = useCallback(() => {
    setDisplayIdx(frozenIdx);
    setPhase("arrival");
  }, [frozenIdx]);

  const onBackdropKeyDown = useCallback(
    (e) => {
      if (phase !== "arrival") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openInput();
      }
    },
    [phase, openInput]
  );

  return (
    <main className={`gate app-shell gate--${phase}`}>
      <Header />

      <div className="gate__body">
        <div
          className="gate__backdrop"
          role={phase === "arrival" ? "button" : undefined}
          tabIndex={phase === "arrival" ? 0 : undefined}
          aria-label={phase === "arrival" ? "Start reflecting" : undefined}
          onClick={phase === "arrival" ? openInput : undefined}
          onKeyDown={onBackdropKeyDown}
        >
          {phase === "input" ? (
            <button
              type="button"
              className="gate__close"
              onClick={(e) => {
                e.stopPropagation();
                closeInput();
              }}
              aria-label="Back to gate"
            >
              ×
            </button>
          ) : null}

          <div className={`gate__center${phase === "input" ? " gate__center--input" : ""}`}>
            {phase === "arrival" ? (
              <>
                <div className="gate-question__track">
                  {QUESTIONS.map((q, i) => (
                    <p
                      key={i}
                      className={`gate-question__line${i === displayIdx ? " gate-question__line--on" : ""}`}
                    >
                      {q}
                    </p>
                  ))}
                </div>
                {showStartHint ? (
                  <p className="gate__start-hint">Start reflecting</p>
                ) : null}
              </>
            ) : (
              <p className="gate__question-frozen">{QUESTIONS[frozenIdx]}</p>
            )}
          </div>
        </div>

        <div
          className={`gate-input-drawer${phase === "input" ? " gate-input-drawer--open" : ""}`}
          onClick={(e) => e.stopPropagation()}
          aria-hidden={phase !== "input"}
        >
          <div className="gate-input-wrapper">
            <InputCard />
          </div>
        </div>
      </div>

      {savedCount >= 1 ? (
        <Link
          to="/vault"
          className="gate__vault-teaser"
          onClick={(e) => e.stopPropagation()}
        >
          You have {savedCount} reflection{savedCount === 1 ? "" : "s"} saved → View your Vault
        </Link>
      ) : null}
    </main>
  );
}
