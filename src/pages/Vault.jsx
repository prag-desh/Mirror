import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReflections, getTopPatterns } from "../utils/reflectionHistory";

export default function Vault() {
  const [reflections, setReflections] = useState([]);
  const [topPatterns, setTopPatterns] = useState([]);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = getReflections();
    setReflections(data);
    setTopPatterns(getTopPatterns(3));
    setMounted(true);
  }, []);

  const openModal = (reflection) => {
    setSelectedReflection(reflection);
  };

  const closeModal = () => {
    setSelectedReflection(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedReflection) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [selectedReflection]);

  if (!mounted) {
    return null;
  }

  // Empty state - no reflections at all
  if (reflections.length === 0) {
    return (
      <div className="app-layout">
        <div className="app-shell">
          <div className="vault-empty">
            <div className="vault-empty__illustration">
              <div className="vault-empty__shape"></div>
            </div>
            <h1 className="vault-empty__title">No reflections yet</h1>
            <p className="vault-empty__subtitle">Your first reflection will appear here</p>
            <Link to="/" className="primary-btn vault-empty__btn">
              Start reflecting →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="app-shell">
        {/* SECTION 1 — Emotional Fingerprint */}
        {reflections.length >= 3 ? (
          <div className="emotional-fingerprint">
            <h2 className="emotional-fingerprint__title">Your emotional fingerprint</h2>
            <p className="emotional-fingerprint__subtitle">Patterns Mirror has seen in you</p>
            <div className="emotional-fingerprint__pills">
              {topPatterns.map((pattern, index) => (
                <div
                  key={pattern.name}
                  className="emotional-fingerprint__pill emotional-fingerprint__pill--gradient"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: mounted ? "slideInUp 0.4s ease-out forwards" : "none",
                    opacity: 0
                  }}
                >
                  <span>{pattern.name}</span>
                  <span className="emotional-fingerprint__count">×{pattern.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="emotional-fingerprint-locked">
            <div className="emotional-fingerprint-locked__icon">🔒</div>
            <h2 className="emotional-fingerprint-locked__title">
              Your emotional fingerprint unlocks after 3 reflections
            </h2>
            <p className="emotional-fingerprint-locked__subtitle">
              You have {reflections.length} of 3 so far
            </p>
          </div>
        )}

        {/* SECTION 2 — Reflection Timeline */}
        <div className="reflection-timeline">
          <div className="reflection-timeline__header">
            <h2 className="reflection-timeline__title">Your reflections</h2>
            <span className="reflection-timeline__count">{reflections.length}</span>
          </div>
          
          <div className="reflection-timeline__entries">
            <div className="reflection-timeline__line"></div>
            {reflections.map((reflection, index) => (
              <div
                key={reflection.id}
                className="reflection-timeline__entry"
                onClick={() => openModal(reflection)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: mounted ? "fadeIn 0.3s ease-out forwards" : "none",
                  opacity: 0
                }}
              >
                <div className="reflection-timeline__dot"></div>
                <div className="reflection-timeline__content">
                  <div className="reflection-timeline__date">{reflection.date}</div>
                  <div className="reflection-timeline__pattern">{reflection.patternName}</div>
                  <div className="reflection-timeline__preview">
                    {reflection.situation.slice(0, 60)}
                    {reflection.situation.length > 60 && "..."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedReflection && (
        <div className="modal-overlay" onClick={closeModal}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button 
              className="modal-close" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            
            <h3 id="modal-title" className="modal-title">{selectedReflection.patternName}</h3>
            <div className="modal-date">{selectedReflection.date}</div>
            
            <div className="modal-section">
              <div className="modal-label">Situation</div>
              <div className="modal-content">{selectedReflection.situation}</div>
            </div>
            
            {selectedReflection.result?.explanation && (
              <div className="modal-section">
                <div className="modal-label">Explanation</div>
                <div className="modal-content">{selectedReflection.result.explanation}</div>
              </div>
            )}
            
            {selectedReflection.result?.hiddenNeed && (
              <div className="modal-section">
                <div className="modal-label">Hidden Need</div>
                <div className="modal-content">{selectedReflection.result.hiddenNeed}</div>
              </div>
            )}
            
            {selectedReflection.result?.whatToSay && (
              <div className="modal-section">
                <div className="modal-label">What to Say</div>
                <div className="modal-content">{selectedReflection.result.whatToSay}</div>
              </div>
            )}
            
            {selectedReflection.result?.actionSteps && (
              <div className="modal-section">
                <div className="modal-label">Action Steps</div>
                <div className="modal-content">{selectedReflection.result.actionSteps}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Empty State */
        .vault-empty {
          text-align: center;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
        }

        .vault-empty__illustration {
          margin-bottom: 32px;
        }

        .vault-empty__shape {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border: 2px solid var(--glass-border);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }

        .vault-empty__shape::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 60px;
          height: 60px;
          background: var(--gradient);
          opacity: 0.3;
          border-radius: 8px;
        }

        .vault-empty__title {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 800;
          margin: 0 0 12px;
          color: var(--text);
        }

        .vault-empty__subtitle {
          font-size: 1rem;
          color: var(--muted);
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .vault-empty__btn {
          max-width: 280px;
        }

        /* Locked Fingerprint State */
        .emotional-fingerprint-locked {
          text-align: center;
          padding: 60px 20px;
          margin-bottom: 32px;
        }

        .emotional-fingerprint-locked__icon {
          font-size: 48px;
          margin-bottom: 20px;
          opacity: 0.4;
        }

        .emotional-fingerprint-locked__title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--text);
        }

        .emotional-fingerprint-locked__subtitle {
          font-size: 0.9375rem;
          color: var(--muted);
          margin: 0;
        }

        /* Enhanced Fingerprint Pills with Gradient */
        .emotional-fingerprint__pill--gradient {
          border: 1px solid;
          border-image: var(--gradient) 1;
          background: rgba(0, 0, 0, 0.4);
          color: var(--text);
          font-weight: 700;
          font-size: 0.9375rem;
          padding: 10px 16px;
        }

        .emotional-fingerprint__pill--gradient .emotional-fingerprint__count {
          background: var(--gradient);
          color: #fff;
          font-weight: 800;
        }

        /* Timeline */
        .reflection-timeline {
          max-width: 860px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .reflection-timeline__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .reflection-timeline__title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }

        .reflection-timeline__count {
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          border-radius: 999px;
          background: rgba(139, 92, 246, 0.2);
          color: var(--gradient-start);
          font-size: 0.8125rem;
          font-weight: 700;
          display: grid;
          place-items: center;
        }

        .reflection-timeline__entries {
          position: relative;
          padding-left: 32px;
        }

        .reflection-timeline__line {
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .reflection-timeline__entry {
          position: relative;
          padding: 16px 20px;
          margin-bottom: 16px;
          border-radius: var(--radius-card);
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reflection-timeline__entry:hover {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(139, 92, 246, 0.05);
          transform: translateX(4px);
        }

        .reflection-timeline__dot {
          position: absolute;
          left: -24px;
          top: 24px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--gradient);
          border: 2px solid var(--bg);
          box-shadow: 0 0 0 4px var(--bg);
        }

        .reflection-timeline__date {
          font-size: 0.75rem;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .reflection-timeline__pattern {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 6px;
          color: var(--text);
        }

        .reflection-timeline__preview {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-card);
          padding: 32px;
          max-width: 560px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          animation: modalIn 0.3s ease-out;
          box-shadow: var(--shadow-soft);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: var(--muted);
          font-size: 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: var(--text);
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 8px;
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-date {
          font-size: 0.875rem;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .modal-section {
          margin-bottom: 24px;
        }

        .modal-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .modal-content {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .reflection-timeline__entry,
          .emotional-fingerprint__pill,
          .modal-overlay,
          .modal-card {
            animation: none;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .modal-card {
            padding: 24px 20px;
          }
          
          .reflection-timeline__entries {
            padding-left: 24px;
          }
          
          .reflection-timeline__dot {
            left: -18px;
          }
        }
      `}</style>
    </div>
  );
}
