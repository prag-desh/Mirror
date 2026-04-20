import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Header from "../components/Header";
import ShareInsightCard from "../components/ShareInsightCard";
import SafetyBanner from "../components/SafetyBanner";
import UnsentMessageCard from "../components/UnsentMessageCard";
import PostResultActionRail from "../components/PostResultActionRail";
import { getReflections } from "../utils/reflectionHistory";
import { activateVenom, resetVenom } from "../utils/venomSystem";

const CHAPTER_IDS = ["chapter-1", "chapter-2", "chapter-3", "chapter-4", "chapter-5"];

function resolveResultsFromLocation(state) {
  let userInput = state?.userInput;
  let result = state?.result;
  let inputMode = state?.inputMode ?? "feeling";

  if (!userInput || !result) {
    const entries = getReflections();
    const latest = entries[0];
    if (latest?.situation && latest?.result) {
      userInput = latest.situation;
      result = latest.result;
      inputMode = latest.inputMode ?? "feeling";
    }
  }

  return { userInput, result, inputMode, ok: !!(userInput && result) };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

function ChapterSteps({ steps, reducedMotion }) {
  const refs = useRef([]);
  const [visible, setVisible] = useState(() =>
    reducedMotion ? steps.map(() => true) : steps.map(() => false)
  );

  useEffect(() => {
    if (reducedMotion) {
      setVisible(steps.map(() => true));
      return undefined;
    }

    const observers = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          const hit = entries.some(
            (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.3
          );
          if (hit) {
            setVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }
        },
        { threshold: [0, 0.3, 0.6, 1] }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [steps, reducedMotion]);

  return (
    <div className="chapter-steps__list">
      {steps.map((step, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`chapter-step${visible[i] ? " chapter-step--visible" : ""}`}
        >
          <span className="chapter-step__num">{i + 1}</span>
          <p className="chapter-step__text">{step}</p>
        </div>
      ))}
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();

  const { userInput, result, inputMode, ok } = useMemo(
    () => resolveResultsFromLocation(location.state),
    [location.state]
  );

  const [displayExplanation, setDisplayExplanation] = useState(() => result?.explanation ?? "");

  useEffect(() => {
    if (result?.explanation != null) {
      setDisplayExplanation(result.explanation);
    }
  }, [result]);

  const [showConfidence, setShowConfidence] = useState(reducedMotion);
  const [showScrollCue, setShowScrollCue] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setShowConfidence(true);
      setShowScrollCue(true);
      return undefined;
    }

    const t1 = window.setTimeout(() => setShowConfidence(true), 1500);
    const t2 = window.setTimeout(() => setShowScrollCue(true), 2500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reducedMotion, result?.patternName]);

  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRatiosRef = useRef({});

  useEffect(() => {
    if (!ok) return undefined;

    const sections = CHAPTER_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return undefined;

    CHAPTER_IDS.forEach((id) => {
      chapterRatiosRef.current[id] = 0;
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          chapterRatiosRef.current[entry.target.id] = entry.intersectionRatio;
        });
        let best = 0;
        let max = -1;
        CHAPTER_IDS.forEach((id, i) => {
          const r = chapterRatiosRef.current[id] ?? 0;
          if (r > max) {
            max = r;
            best = i;
          }
        });
        if (max > 0.05) {
          setActiveChapter(best);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-10% 0px -10% 0px" }
    );

    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ok, result?.patternName]);

  const scrollToChapter = useCallback((index) => {
    const el = document.getElementById(CHAPTER_IDS[index]);
    el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [reducedMotion]);

  if (!ok) {
    return <Navigate to="/" replace />;
  }

  const railResult = { ...result, explanation: displayExplanation };

  const showUnsentCard = inputMode === "unsent";
  const steps = Array.isArray(result.actionSteps) ? result.actionSteps : [];

  return (
    <main className="results-cinematic app-shell app-shell--results">
      <Header />

      <SafetyBanner flag={result.safetyFlag} />

      <div className="results-chapters">
        <section
          id="chapter-1"
          className="chapter chapter--pattern"
          aria-label="Pattern"
        >
          <div className="chapter__inner chapter--pattern__inner">
            <p className="chapter--pattern__context">{userInput}</p>
            <h2
              className={`chapter--pattern__title gradient-text${reducedMotion ? " chapter--pattern__title--static" : ""}`}
              style={{ color: 'var(--atm-accent)' }}
            >
              {result.patternName}
            </h2>
            <p
              className={`chapter--pattern__confidence${showConfidence ? " chapter--pattern__confidence--on" : ""}`}
            >
              {result.confidenceNote}
            </p>
          </div>
          <div
            className={`chapter--pattern__scroll${showScrollCue ? " chapter--pattern__scroll--on" : ""}`}
            aria-hidden="true"
          >
            <ChevronDown size={28} strokeWidth={1.75} />
          </div>
        </section>

        <section id="chapter-2" className="chapter chapter--explain" aria-label="Understanding">
          <div className="chapter__inner chapter--explain__inner">
            <div className="chapter--explain__col">
              <p className="chapter__label">Why this may be happening</p>
              <p className="chapter--explain__body">{displayExplanation}</p>
            </div>
            <div className="chapter--explain__col">
              <p className="chapter__label">Hidden need</p>
              <p className="chapter--explain__need">{result.hiddenNeed}</p>
            </div>
          </div>
        </section>

        <section id="chapter-3" className="chapter chapter--letter" aria-label="What to say">
          <div className="chapter__inner chapter--letter__inner">
            <p className="chapter--letter__label">What to say</p>
            <blockquote className="chapter--letter__quote">
              <span className="chapter--letter__oq" aria-hidden="true">
                &ldquo;
              </span>
              <span className="chapter--letter__text">{result.whatToSay}</span>
              <span className="chapter--letter__cq" aria-hidden="true">
                &rdquo;
              </span>
            </blockquote>
          </div>
        </section>

        <section id="chapter-4" className="chapter chapter--steps" aria-label="Next steps">
          <div className="chapter__inner chapter--steps__inner">
            <p className="chapter__label">What helps next</p>
            <ChapterSteps steps={steps} reducedMotion={reducedMotion} />
          </div>
        </section>

        <section id="chapter-5" className="chapter chapter--close" aria-label="Share">
          <div className="chapter__inner chapter--close__inner">
            {showUnsentCard ? (
              <div className="chapter--close__unsent">
                <UnsentMessageCard message={result.whatToSay} />
              </div>
            ) : null}
            <ShareInsightCard patternName={result.patternName} insight={result.shareInsight} />
            <Link to="/vault" className="chapter--close__vault-link">
              Save to your Vault →
            </Link>
            <PostResultActionRail
              userInput={userInput}
              result={railResult}
              onReframe={setDisplayExplanation}
            />
            <div className="disclaimer-card chapter--close__disclaimer">
              <p>{result.disclaimer}</p>
            </div>
          </div>
        </section>
      </div>

      <nav className="chapter-progress" aria-label="Chapters">
        {CHAPTER_IDS.map((_, i) => (
          <button
            key={CHAPTER_IDS[i]}
            type="button"
            className={`chapter-progress__dot${activeChapter === i ? " chapter-progress__dot--active" : ""}`}
            aria-label={`Go to chapter ${i + 1}`}
            aria-current={activeChapter === i ? "true" : undefined}
            onClick={() => scrollToChapter(i)}
          />
        ))}
      </nav>
    </main>
  );
}
