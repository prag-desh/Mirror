import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReflections } from "../utils/reflectionHistory";

export default function Profile() {
  const [reflections, setReflections] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [archetypeVisible, setArchetypeVisible] = useState(false);

  useEffect(() => {
    const data = getReflections();
    setReflections(data);
    setMounted(true);
    
    // Trigger animations after mount
    setTimeout(() => setArchetypeVisible(true), 100);
    
    // Animate count up
    if (data.length > 0) {
      const duration = 1000;
      const steps = 30;
      const increment = data.length / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= data.length) {
          current = data.length;
          clearInterval(timer);
        }
        setAnimatedCount(Math.floor(current));
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, []);

  // Calculate stats
  const totalReflections = reflections.length;
  const firstReflection = reflections.length > 0 ? reflections[reflections.length - 1] : null;
  const firstDate = firstReflection ? new Date(firstReflection.id) : null;
  const formattedFirstDate = firstDate ? firstReflection.date : null;

  // Get most common pattern
  const patternCounts = {};
  reflections.forEach(ref => {
    if (ref.patternName) {
      patternCounts[ref.patternName] = (patternCounts[ref.patternName] || 0) + 1;
    }
  });
  
  const topPattern = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  const topPatternName = topPattern ? topPattern[0] : null;
  const topPatternCount = topPattern ? topPattern[1] : 0;

  // Calculate archetype
  const getArchetype = () => {
    const categories = {
      Relational: 0,
      Suppression: 0,
      Cognitive: 0,
      Validation: 0
    };

    reflections.forEach(ref => {
      const pattern = ref.patternName;
      if (pattern) {
        if (pattern.includes("Rejection Anticipation") || pattern.includes("Attachment Anxiety")) {
          categories.Relational++;
        } else if (pattern.includes("Emotional Suppression") || pattern.includes("Emotional Numbing") || pattern.includes("Avoidant Defense")) {
          categories.Suppression++;
        } else if (pattern.includes("Cognitive Distortion Loop") || pattern.includes("Internalized Self-Doubt") || pattern.includes("Fear of Vulnerability")) {
          categories.Cognitive++;
        } else if (pattern.includes("Validation Seeking")) {
          categories.Validation++;
        }
      }
    });

    const maxCount = Math.max(...Object.values(categories));
    const topCategory = Object.entries(categories).find(([_, count]) => count === maxCount)?.[0];

    if (maxCount === 0 || Object.values(categories).filter(c => c === maxCount).length > 1) {
      return {
        name: "The Complex Soul",
        description: "Your emotional patterns resist simple labels. Mirror sees full spectrum of you."
      };
    }

    const archetypes = {
      Relational: {
        name: "The Relational Feeler",
        description: "You process world through connection. Your nervous system is finely tuned to emotional temperature of your relationships."
      },
      Suppression: {
        name: "The Silent Processor",
        description: "You carry more than you show. Your inner world is rich and complex — you just rarely let others see all of it."
      },
      Cognitive: {
        name: "The Inner Architect",
        description: "Your mind builds frameworks to make sense of everything. You think deeply, sometimes at cost of simply feeling."
      },
      Validation: {
        name: "The Mirror Seeker",
        description: "You understand yourself best through others. Connection and recognition are not weaknesses — they are how you come alive."
      }
    };

    return archetypes[topCategory] || archetypes["Complex Soul"];
  };

  const archetype = getArchetype();

  // Calculate quick stats
  const uniquePatterns = Object.keys(patternCounts).length;
  const daysSinceFirst = firstDate ? Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Share functionality
  const handleShare = async () => {
    const shareText = `My Mirror profile:\n${archetype.name}\n${archetype.description}\n${totalReflections} reflections • most common pattern: ${topPatternName}\nmirror.app`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!mounted) {
    return null;
  }

  // Empty state
  if (totalReflections === 0) {
    return (
      <div className="app-layout">
        <div className="app-shell">
          <div className="profile-empty">
            <h1 className="profile-empty__title">Your Mirror profile is waiting</h1>
            <p className="profile-empty__subtitle">Complete your first reflection to begin</p>
            <Link to="/" className="primary-btn profile-empty__btn">
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
        {/* SECTION 1 — Stats header */}
        <div className="profile-stats-header">
          <div className="profile-stats__count" style={{ opacity: mounted ? 1 : 0 }}>
            {animatedCount}
          </div>
          <div className="profile-stats__label">reflections</div>
          <div className="profile-stats__started">
            You started reflecting on {formattedFirstDate}
          </div>
        </div>

        {/* SECTION 2 — Core pattern */}
        {topPatternName && (
          <div className="profile-pattern">
            <div className="profile-pattern__label">your most visited pattern</div>
            <div className="profile-pattern__name gradient-text">{topPatternName}</div>
            <div className="profile-pattern__count">Seen {topPatternCount} times in your reflections</div>
          </div>
        )}

        {/* SECTION 3 — Emotional Archetype */}
        <div className="profile-archetype">
          <div className="profile-archetype__label">your emotional archetype</div>
          <div 
            className="profile-archetype__name gradient-text"
            style={{
              filter: archetypeVisible ? 'blur(0px)' : 'blur(8px)',
              opacity: archetypeVisible ? 1 : 0,
              transition: 'filter 800ms ease-out, opacity 800ms ease-out'
            }}
          >
            {archetype.name}
          </div>
          <div className="profile-archetype__description">
            {archetype.description}
          </div>
        </div>

        {/* SECTION 4 — Share */}
        <div className="profile-share">
          <button 
            className="profile-share__btn"
            onClick={handleShare}
          >
            {copied ? "Copied!" : "Share Profile"}
          </button>
        </div>

        {/* SECTION 5 — Quick stats row */}
        <div className="profile-quick-stats">
          <div 
            className="profile-stat-card"
            style={{ animationDelay: '0ms' }}
          >
            <div className="profile-stat-card__value">{totalReflections}</div>
            <div className="profile-stat-card__label">Total reflections</div>
          </div>
          
          <div 
            className="profile-stat-card"
            style={{ animationDelay: '80ms' }}
          >
            <div className="profile-stat-card__value">{uniquePatterns}</div>
            <div className="profile-stat-card__label">Unique patterns</div>
          </div>
          
          <div 
            className="profile-stat-card"
            style={{ animationDelay: '160ms' }}
          >
            <div className="profile-stat-card__value">{daysSinceFirst}</div>
            <div className="profile-stat-card__label">Days reflecting</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Empty State */
        .profile-empty {
          text-align: center;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
        }

        .profile-empty__title {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 800;
          margin: 0 0 12px;
          color: var(--text);
        }

        .profile-empty__subtitle {
          font-size: 1rem;
          color: var(--muted);
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .profile-empty__btn {
          max-width: 280px;
        }

        /* Stats Header */
        .profile-stats-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .profile-stats__count {
          font-size: clamp(64px, 12vw, 96px);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 8px;
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: opacity 0.5s ease-out;
        }

        .profile-stats__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .profile-stats__started {
          font-size: 0.9375rem;
          color: var(--muted);
        }

        /* Core Pattern */
        .profile-pattern {
          text-align: center;
          margin-bottom: 4rem;
        }

        .profile-pattern__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .profile-pattern__name {
          font-size: clamp(28px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .profile-pattern__count {
          font-size: 0.9375rem;
          color: var(--muted);
        }

        /* Emotional Archetype */
        .profile-archetype {
          text-align: center;
          margin-bottom: 4rem;
        }

        .profile-archetype__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .profile-archetype__name {
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .profile-archetype__description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--muted);
          max-width: 400px;
          margin: 0 auto;
        }

        /* Share */
        .profile-share {
          text-align: center;
          margin-bottom: 4rem;
        }

        .profile-share__btn {
          min-height: 48px;
          padding: 12px 24px;
          border-radius: 999px;
          border: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-share__btn:hover {
          border-color: rgba(139, 92, 246, 0.45);
          background: rgba(139, 92, 246, 0.12);
          color: var(--text);
        }

        /* Quick Stats */
        .profile-quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 600px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .profile-stat-card {
          padding: 20px;
          border-radius: var(--radius-card);
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          text-align: center;
          opacity: 0;
          animation: slideInUp 0.4s ease-out forwards;
        }

        .profile-stat-card__value {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 4px;
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-stat-card__label {
          font-size: 0.75rem;
          color: var(--muted);
          line-height: 1.3;
        }

        /* Animations */
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

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .profile-stat-card,
          .profile-archetype__name,
          .profile-stats__count {
            animation: none;
            transition: none;
          }
          
          .profile-archetype__name {
            filter: blur(0px) !important;
            opacity: 1 !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .profile-quick-stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .profile-stat-card {
            padding: 16px;
          }
          
          .profile-stat-card__value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
