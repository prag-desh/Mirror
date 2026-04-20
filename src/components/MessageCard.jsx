export default function MessageCard({ message }) {
  return (
    <section className="result-card">
      <p className="card-label">What you can say</p>
      <div className="message-box">“{message}”</div>
    </section>
  );
}