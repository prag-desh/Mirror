import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="topbar topbar--with-bottom-nav">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>
        <span className="brand-name">Mirror</span>
      </Link>
    </header>
  );
}
