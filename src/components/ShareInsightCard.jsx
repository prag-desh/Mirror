import { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function ShareInsightCard({ patternName, insight }) {
  const captureRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const saveAsImage = useCallback(async () => {
    const node = captureRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = "mirror-reflection.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Share image export failed:", e);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <section className="share-card" aria-label="Shareable insight">
      <p className="card-label share-pattern">{patternName}</p>
      <h2>{insight}</h2>
      <p className="share-footer">Decoded by Mirror</p>

      <div className="share-card__actions">
        <button
          type="button"
          className="share-card__save-img"
          onClick={saveAsImage}
          disabled={busy}
        >
          {busy ? "Saving…" : "Save as image"}
        </button>
      </div>

      <div ref={captureRef} className="share-capture-target" aria-hidden="true">
        <div>
          <div className="share-capture-target__brand">
            <span className="share-capture-target__dot" />
            Mirror
          </div>
        </div>
        <p className="share-capture-target__pattern">{patternName}</p>
        <p className="share-capture-target__insight">{insight}</p>
      </div>
    </section>
  );
}
