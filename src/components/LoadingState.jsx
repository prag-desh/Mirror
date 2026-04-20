import { useEffect, useState } from "react";

const PHRASES = [
  "Reading between the lines...",
  "Detecting your pattern...",
  "Mapping your emotional state...",
  "Consulting the psychology...",
  "Almost there..."
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-box">
      <div className="loading-breather" aria-hidden="true"></div>
      <p key={index} className="loading-phrase">
        {PHRASES[index]}
      </p>
    </div>
  );
}
