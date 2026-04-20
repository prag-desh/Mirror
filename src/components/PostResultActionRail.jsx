import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

async function postDecode(input) {
  const response = await fetch("/api/decode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input })
  });
  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Invalid response from server");
  }
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export default function PostResultActionRail({ userInput, result, onReframe }) {
  const navigate = useNavigate();
  const [deeperOpen, setDeeperOpen] = useState(false);
  const [deeperLoading, setDeeperLoading] = useState(false);
  const [deeperError, setDeeperError] = useState(null);
  const [deeperText, setDeeperText] = useState("");
  const [reframeLoading, setReframeLoading] = useState(false);
  const [reframeError, setReframeError] = useState(null);

  const goDeeper = async () => {
    setDeeperError(null);
    setDeeperLoading(true);
    setDeeperOpen(true);
    try {
      const prompt = `The user identified pattern: ${result.patternName}. Go one level deeper. What childhood pattern or core wound might this connect to? Be warm and specific.

Their situation in their words:
${userInput}

Mirror's prior read (for context):
${result.explanation}`;
      const data = await postDecode(prompt);
      const text = [data.explanation, data.hiddenNeed].filter(Boolean).join("\n\n");
      setDeeperText(text || data.confidenceNote || "Here is another layer to sit with.");
    } catch (e) {
      setDeeperError(e.message || "Something went wrong");
    } finally {
      setDeeperLoading(false);
    }
  };

  const seeDifferently = async () => {
    setReframeError(null);
    setReframeLoading(true);
    try {
      const prompt = `Reframe this situation with radical compassion. What would a wise therapist say to help them see this from a growth perspective? Be concise and powerful.

Their situation:
${userInput}

Pattern Mirror detected: ${result.patternName}
Current framing: ${result.explanation}`;
      const data = await postDecode(prompt);
      onReframe(data.explanation || result.explanation);
    } catch (e) {
      setReframeError(e.message || "Something went wrong");
    } finally {
      setReframeLoading(false);
    }
  };

  const startFresh = () => {
    const go = () => navigate("/");
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(go);
    } else {
      go();
    }
  };

  return (
    <div className="post-result-rail">
      <div className="post-result-rail__buttons">
        <button
          type="button"
          className="post-result-rail__btn"
          onClick={goDeeper}
          disabled={deeperLoading}
        >
          {deeperLoading ? "Going deeper…" : "Go deeper"}
        </button>
        <button
          type="button"
          className="post-result-rail__btn"
          onClick={seeDifferently}
          disabled={reframeLoading}
        >
          {reframeLoading ? "Reframing…" : "See it differently"}
        </button>
        <button type="button" className="post-result-rail__btn" onClick={startFresh}>
          Start fresh
        </button>
      </div>

      {reframeError ? <p className="post-result-rail__error">{reframeError}</p> : null}

      {(deeperOpen || deeperLoading || deeperText || deeperError) && (
        <div className="post-result-rail__deeper">
          <button
            type="button"
            className="post-result-rail__deeper-toggle"
            onClick={() => setDeeperOpen((o) => !o)}
            aria-expanded={deeperOpen}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Deeper layer</span>
            {deeperOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {deeperOpen && (
            <div className="post-result-rail__deeper-panel">
              {deeperLoading ? <p className="post-result-rail__muted">Consulting the psychology…</p> : null}
              {deeperError ? <p className="post-result-rail__error">{deeperError}</p> : null}
              {!deeperLoading && deeperText ? (
                <p className="post-result-rail__deeper-text">{deeperText}</p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
