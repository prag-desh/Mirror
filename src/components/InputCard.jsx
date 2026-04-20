import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquareText } from "lucide-react";
import LoadingState from "./LoadingState";
import { saveReflection } from "../utils/reflectionHistory";

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const PLACEHOLDER_FEELING =
  "Example: She saw my message but didn’t reply… now I feel weird and I keep checking my phone.";
const PLACEHOLDER_UNSENT =
  "Who is this for, and what have you been holding back?";

export default function InputCard({ minWordsToSubmit = 10 }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState("feeling");
  const navigate = useNavigate();

  const words = useMemo(() => countWords(input), [input]);
  const meetsWordMin = minWordsToSubmit <= 0 || words >= minWordsToSubmit;

  const glowClass =
    words >= 30 ? "emotion-input--glow-strong" : words >= 15 ? "emotion-input--glow-mid" : "";

  let hint = null;
  let hintClass = "input-word-hint";
  if (words === 0) {
    hint = null;
  } else if (words <= 15) {
    hint = "Keep going, tell me more...";
    hintClass += " input-word-hint--muted";
  } else if (words <= 30) {
    hint = "Mirror is ready to decode";
    hintClass += " input-word-hint--purple";
  } else {
    hint = <span className="gradient-text">Perfect. Hit decode.</span>;
    hintClass += " input-word-hint--gradient";
  }

  const handleSubmit = async () => {
    if (!input.trim()) {
      alert("Please type what happened first.");
      return;
    }

    if (minWordsToSubmit > 0 && words < minWordsToSubmit) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/decode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: input.trim()
        })
      });

      // Check content type before parsing
      const contentType = response.headers.get("content-type") || "";
      let data = null;
      
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("API Error Response:", { status: response.status, data });
        throw new Error(data?.error || "Decode failed");
      }

      saveReflection({
        userInput: input.trim(),
        result: data,
        inputMode
      });

      navigate("/results", {
        state: {
          userInput: input.trim(),
          result: data,
          inputMode
        }
      });
    } catch (error) {
      console.error("Decode submit error:", error);
      alert(error.message || "Failed to decode emotion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="input-panel">
      <div className="panel-head">
        <div className="panel-icon">
          <MessageSquareText size={18} />
        </div>
        <div>
          <h2>What happened?</h2>
          <p>Type the situation exactly as it feels.</p>
        </div>
      </div>

      <div className="input-mode-toggle" role="group" aria-label="Input mode">
        <button
          type="button"
          className={`input-mode-toggle__opt${inputMode === "feeling" ? " input-mode-toggle__opt--active" : ""}`}
          onClick={() => setInputMode("feeling")}
          aria-pressed={inputMode === "feeling"}
        >
          What I&apos;m feeling
        </button>
        <button
          type="button"
          className={`input-mode-toggle__opt${inputMode === "unsent" ? " input-mode-toggle__opt--active" : ""}`}
          onClick={() => setInputMode("unsent")}
          aria-pressed={inputMode === "unsent"}
        >
          What I can&apos;t say
        </button>
      </div>

      <textarea
        className={`emotion-input ${glowClass}`.trim()}
        placeholder={inputMode === "unsent" ? PLACEHOLDER_UNSENT : PLACEHOLDER_FEELING}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={7}
        aria-describedby={hint ? "input-word-hint" : undefined}
      />

      {hint != null ? (
        <p id="input-word-hint" className={hintClass}>
          {hint}
        </p>
      ) : null}

      <div className="panel-actions">
        <p className="panel-tip">
          Best results come from real, messy thoughts — not polished writing.
        </p>
        {meetsWordMin ? (
          <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Decoding..." : "Decode this feeling"}
            {!loading && <ArrowRight size={18} />}
          </button>
        ) : null}
      </div>

      {loading && <LoadingState />}
    </section>
  );
}
