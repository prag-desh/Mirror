export default function ActionStepsCard({ steps }) {
  return (
    <section className="result-card">
      <p className="card-label">What helps next</p>
      <div className="steps-list">
        {steps.map((step, index) => (
          <div className="step-item" key={index}>
            <span className="step-num">{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}