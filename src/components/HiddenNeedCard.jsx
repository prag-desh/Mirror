export default function HiddenNeedCard({ hiddenNeed }) {
  return (
    <section className="result-card">
      <p className="card-label">Hidden need</p>
      <p>{hiddenNeed}</p>
    </section>
  );
}