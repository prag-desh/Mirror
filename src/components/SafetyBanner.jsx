export default function SafetyBanner({ flag }) {
  if (flag === "none") return null;

  return (
    <div className="safety-banner">
      <strong>Important:</strong> Mirror is a self-reflection tool, not a crisis or medical support service.
    </div>
  );
}