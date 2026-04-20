import { useNavigate } from "react-router-dom";
import { ChevronDown, History } from "lucide-react";
import { getReflections } from "../utils/reflectionHistory";

function preview(text, max = 60) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default function ReflectionHistory() {
  const navigate = useNavigate();
  const entries = getReflections();

  return (
    <section className="reflection-history">
      <details className="reflection-history__details">
        <summary className="reflection-history__summary">
          <span className="reflection-history__summary-inner">
            <History size={18} aria-hidden="true" />
            <span>Your past patterns</span>
            <ChevronDown size={18} className="reflection-history__chevron" aria-hidden="true" />
          </span>
        </summary>

        <div className="reflection-history__body">
          {entries.length === 0 ? (
            <p className="reflection-history__empty">Your reflections will appear here</p>
          ) : (
            <ul className="reflection-history__list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="reflection-history__item"
                    onClick={() =>
                      navigate("/results", {
                        state: {
                          userInput: entry.situation,
                          result: entry.result,
                          inputMode: entry.inputMode || "feeling"
                        }
                      })
                    }
                  >
                    <span className="reflection-history__date">{entry.date}</span>
                    <span className="reflection-history__pattern">{entry.patternName}</span>
                    <span className="reflection-history__preview">{preview(entry.situation)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
